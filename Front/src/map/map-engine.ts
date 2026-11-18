import { Service } from '@angular/core';
import { CityMap, CityMapOptions } from './city-map';
import type { Maplibre } from './maplibre-city-map';

/** Folder where angular.json copies the MapLibre stylesheet and worker. */
const ASSETS_DIR = 'maplibre/';
const STYLESHEET = 'maplibre-gl.css';
const WORKER = 'maplibre-gl-worker.mjs';

/**
 * Creates city maps. Downloads MapLibre (about 250 kB gzipped) on the first map only,
 * so pages without a map never pay for it.
 */
@Service()
export class MapEngine {
  private library: Promise<Maplibre> | null = null;

  /**
   * Draws a map in `options.container`.
   * Resolves null where it cannot be drawn: no WebGL 2 (old browsers, unit tests) or no GPU context.
   */
  async create(options: CityMapOptions): Promise<CityMap | null> {
    if (!('WebGL2RenderingContext' in window)) {
      return null;
    }

    // Forget a failed download, so the next map tries again
    this.library ??= loadLibrary().catch((error: unknown) => {
      this.library = null;
      throw error;
    });
    const [lib, { MaplibreCityMap }] = await Promise.all([
      this.library,
      import('./maplibre-city-map'),
    ]);

    try {
      return new MaplibreCityMap(lib, options);
    } catch {
      // MapLibre throws when the browser refuses a WebGL context
      return null;
    }
  }
}

async function loadLibrary(): Promise<Maplibre> {
  const [lib] = await Promise.all([import('maplibre-gl'), loadStylesheet(assetUrl(STYLESHEET))]);

  // Versioned like MapLibre's own default URL, so an upgrade never pairs a cached old worker
  const worker = new URL(assetUrl(WORKER));
  worker.searchParams.set('v', lib.getVersion());
  lib.setWorkerUrl(worker.href);
  return lib;
}

/** Appends a stylesheet and settles once it applies: MapLibre positions its canvas with it. */
function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      reject(new Error(`Stylesheet failed to load: ${href}`));
    };
    document.head.append(link);
  });
}

/** Absolute URL of a copied asset, e.g. 'maplibre-gl.css' -> 'http://host/maplibre/maplibre-gl.css'. */
function assetUrl(file: string): string {
  return new URL(ASSETS_DIR + file, document.baseURI).href;
}
