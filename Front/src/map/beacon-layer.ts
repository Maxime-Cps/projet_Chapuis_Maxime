import type { CustomLayerInterface, CustomRenderMethodInput, Map as MaplibreMap } from 'maplibre-gl';
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  ColorManagement,
  CylinderGeometry,
  DoubleSide,
  Group,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Beacon, ParticleKind } from './city-map';
import { readToken } from './map-style';
import { prefersReducedMotion } from '../utils/motion';
import type { Maplibre } from './maplibre-city-map';

/** Id of the layer in the MapLibre style. */
export const BEACON_LAYER = 'beacon';

const COLUMN_RADIUS = 5;
const TOP_SIZE = 9;
const FALL_FROM = 400;
const FALL_MS = 650;
const RIPPLE_MS = 900;
const RIPPLE_RADIUS = 70;
const SPIN_PER_MS = 0.0012;

/** Time particles keep coming after the landing, in ms: the map then stops redrawing every frame. */
const EMIT_MS = 15_000;

/** Whether dead particles are born again or left out. */
enum Emission {
  Running = 'running',
  Ending = 'ending',
}

const PARTICLE_COUNT = 140;
const GRAVITY = 0.00004;

/** Particle settings by kind: color token, round or square, size in pixels, lifetime in ms. */
const PARTICLE_LOOK: Record<Exclude<ParticleKind, ParticleKind.None>, ParticleLook> = {
  [ParticleKind.Smoke]: { colorToken: '--muted', round: true, size: 14, lifeMs: 3200 },
  [ParticleKind.Drops]: { colorToken: '--text-soft', round: true, size: 4, lifeMs: 1100 },
  [ParticleKind.Fragments]: { colorToken: '', round: false, size: 5, lifeMs: 1600 },
};

interface ParticleLook {
  /** Empty: the beacon's own color. */
  colorToken: string;
  round: boolean;
  size: number;
  lifeMs: number;
}

/** One particle, in meters from the foot of the column, y up. */
interface Particle {
  bornAt: number;
  origin: Vector3;
  velocity: Vector3;
}

const POINT_VERTEX = `
  attribute float aAlpha;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const POINT_FRAGMENT = `
  uniform vec3 uColor;
  uniform bool uRound;
  varying float vAlpha;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    if (uRound && dot(offset, offset) > 0.25) {
      discard;
    }

    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

/**
 * MapLibre custom layer drawing a {@link Beacon} with three.js, in the map's own GL context:
 *
 *        ◆        top marker, spinning
 *        █  ∴     column (height in meters), particles above or around it
 *        █
 *     ───◯───     ripple on the ground when it lands
 *
 * The scene is built in meters, y up, from the foot of the column; the map's matrix places it.
 */
export class BeaconLayer implements CustomLayerInterface {
  readonly id = BEACON_LAYER;
  readonly type = 'custom';
  readonly renderingMode = '3d';

  private map: MaplibreMap | null = null;
  private renderer: WebGLRenderer | null = null;
  private readonly scene = new Scene();
  private readonly camera = new Camera();
  private readonly beacon = new Group();
  private readonly column: Mesh<CylinderGeometry, MeshBasicMaterial>;
  private readonly top: Mesh<OctahedronGeometry, MeshBasicMaterial>;
  private readonly ripple: Mesh<RingGeometry, MeshBasicMaterial>;
  private points: Points<BufferGeometry, ShaderMaterial> | null = null;
  private particles: Particle[] = [];

  /** Places the scene, in meters, on the map. */
  private placement = new Matrix4();
  private droppedAt = 0;
  private readonly still = prefersReducedMotion();

  constructor(
    private readonly lib: Maplibre,
    private current: Beacon,
  ) {
    // Colors are drawn as written, like the rest of the map
    ColorManagement.enabled = false;

    const solid = () => new MeshBasicMaterial({ transparent: true });
    this.column = new Mesh(new CylinderGeometry(COLUMN_RADIUS, COLUMN_RADIUS, 1, 24), solid());
    this.top = new Mesh(new OctahedronGeometry(TOP_SIZE), solid());
    this.ripple = new Mesh(new RingGeometry(0.85, 1, 48), new MeshBasicMaterial({ transparent: true, side: DoubleSide }));
    this.ripple.rotateX(-Math.PI / 2);

    this.beacon.add(this.column, this.top);
    this.scene.add(this.beacon, this.ripple);
    for (const object of [this.column, this.top, this.ripple]) {
      // The map's matrix is not a regular camera: three's culling would drop visible objects
      object.frustumCulled = false;
    }

    this.set(current);
  }

  /** Shows another beacon, dropping it again. */
  set(beacon: Beacon) {
    this.current = beacon;
    const color = readToken(beacon.colorToken);

    this.column.scale.y = beacon.height;
    this.column.position.y = beacon.height / 2;
    this.column.material.color.set(color);
    this.column.material.opacity = 0.85;
    this.top.position.y = beacon.height + TOP_SIZE * 1.5;
    this.top.material.color.set(color);
    this.ripple.material.color.set(color);

    const origin = this.lib.MercatorCoordinate.fromLngLat([beacon.position.longitude, beacon.position.latitude]);
    const meter = origin.meterInMercatorCoordinateUnits();
    this.placement = new Matrix4()
      .makeTranslation(origin.x, origin.y, origin.z)
      .scale(new Vector3(meter, -meter, meter))
      .multiply(new Matrix4().makeRotationX(Math.PI / 2));

    this.setParticles(beacon.particles, color);
    this.droppedAt = performance.now();
    this.map?.triggerRepaint();
  }

  onAdd(map: MaplibreMap, gl: WebGL2RenderingContext) {
    this.map = map;
    this.renderer = new WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
    this.renderer.autoClear = false;
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.droppedAt = performance.now();
  }

  onRemove() {
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    this.renderer?.dispose();
    this.renderer = null;
    this.map = null;
  }

  render(_gl: WebGL2RenderingContext, args: CustomRenderMethodInput) {
    if (!this.renderer || !this.map) {
      return;
    }

    const elapsed = this.still ? Number.POSITIVE_INFINITY : performance.now() - this.droppedAt;
    const animating = this.animate(elapsed);

    this.camera.projectionMatrix.fromArray(args.defaultProjectionData.mainMatrix).multiply(this.placement);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);

    if (animating) {
      this.map.triggerRepaint();
    }
  }

  /** Moves everything to `elapsed` ms after the drop. @returns whether later frames differ. */
  private animate(elapsed: number): boolean {
    // Falls like a dropped object: slow, then faster
    const fall = Math.min(1, elapsed / FALL_MS);
    this.beacon.position.y = FALL_FROM * (1 - fall * fall);

    const landedFor = elapsed - FALL_MS;
    const ripple = Math.min(1, Math.max(0, landedFor / RIPPLE_MS));
    this.ripple.visible = landedFor > 0 && ripple < 1;
    this.ripple.scale.setScalar(COLUMN_RADIUS + ripple * RIPPLE_RADIUS);
    this.ripple.material.opacity = 1 - ripple;

    if (this.still) {
      return false;
    }

    const settled = landedFor >= EMIT_MS;
    this.top.rotation.y = Math.min(elapsed, FALL_MS + EMIT_MS) * SPIN_PER_MS;
    if (landedFor <= 0) {
      return true;
    }

    const alive = this.moveParticles(performance.now(), settled ? Emission.Ending : Emission.Running);
    return !settled || alive > 0;
  }

  private setParticles(kind: ParticleKind, beaconColor: string) {
    if (this.points) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
      this.points.material.dispose();
      this.points = null;
    }

    this.particles = [];
    if (kind === ParticleKind.None || this.still) {
      return;
    }

    const look = PARTICLE_LOOK[kind];
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    geometry.setAttribute('aAlpha', new BufferAttribute(new Float32Array(PARTICLE_COUNT), 1));
    geometry.setAttribute('aSize', new BufferAttribute(new Float32Array(PARTICLE_COUNT), 1));

    const material = new ShaderMaterial({
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new Color(look.colorToken ? readToken(look.colorToken) : beaconColor) },
        uRound: { value: look.round },
        uPixelRatio: { value: devicePixelRatio },
      },
    });

    this.points = new Points(geometry, material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    // Spread births over one lifetime so the flow is steady from the start
    const now = performance.now();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push(this.spawn(kind, now - (i / PARTICLE_COUNT) * look.lifeMs));
    }
  }

  /** A new particle of a kind, born at `bornAt`. */
  private spawn(kind: ParticleKind, bornAt: number): Particle {
    const height = this.current.height;
    const angle = Math.random() * Math.PI * 2;
    const spread = (radius: number) => new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    switch (kind) {
      case ParticleKind.Smoke:
        return {
          bornAt,
          origin: new Vector3(0, height, 0),
          velocity: spread(Math.random() * 0.006).setY(0.03 + Math.random() * 0.02),
        };
      case ParticleKind.Drops:
        return {
          bornAt,
          origin: spread(Math.random() * 40).setY(height + 40 + Math.random() * 60),
          velocity: new Vector3(0, -0.12 - Math.random() * 0.06, 0),
        };
      default:
        return {
          bornAt,
          origin: new Vector3(0, 2, 0),
          velocity: spread(0.02 + Math.random() * 0.04).setY(0.04 + Math.random() * 0.05),
        };
    }
  }

  /**
   * Moves the particles to `now`; dead ones are born again while emission runs, hidden after.
   * @returns the number of particles still showing.
   */
  private moveParticles(now: number, emission: Emission): number {
    const kind = this.current.particles;
    if (!this.points || kind === ParticleKind.None) {
      return 0;
    }

    const look = PARTICLE_LOOK[kind];
    const geometry = this.points.geometry;
    const positions = geometry.getAttribute('position') as BufferAttribute;
    const alphas = geometry.getAttribute('aAlpha') as BufferAttribute;
    const sizes = geometry.getAttribute('aSize') as BufferAttribute;

    let alive = 0;
    this.particles.forEach((particle, i) => {
      let age = now - particle.bornAt;
      if (age >= look.lifeMs && emission === Emission.Ending) {
        alphas.setX(i, 0);
        return;
      }

      if (age >= look.lifeMs) {
        this.particles[i] = this.spawn(kind, now);
        particle = this.particles[i];
        age = 0;
      }

      const life = age / look.lifeMs;
      const fallen = kind === ParticleKind.Fragments ? GRAVITY * age * age : 0;
      const y = Math.max(0, particle.origin.y + particle.velocity.y * age - fallen);
      positions.setXYZ(i, particle.origin.x + particle.velocity.x * age, y, particle.origin.z + particle.velocity.z * age);

      // Smoke swells and fades; drops and fragments fade at the end only
      const fade = kind === ParticleKind.Smoke ? 0.55 * (1 - life) : Math.min(1, 4 * (1 - life));
      alphas.setX(i, fade);
      sizes.setX(i, kind === ParticleKind.Smoke ? look.size * (0.5 + life) : look.size);
      alive++;
    });

    positions.needsUpdate = true;
    alphas.needsUpdate = true;
    sizes.needsUpdate = true;
    return alive;
  }
}
