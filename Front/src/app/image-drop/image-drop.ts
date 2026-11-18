import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';
import { isImageFile, toStoredImage } from '../../utils/image-file';
import { IMAGE_ERRORS } from '../../constants/messages';

/**
 * Image field: drop a file on it, pick one, or paste an address.
 * A file is shrunk and kept as a data URL; the value is the image address either way.
 *
 * @example <app-image-drop formControlName="image" inputId="pollutionImage" />
 */
@Component({
  imports: [Icon],
  selector: 'app-image-drop',
  styleUrl: './image-drop.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ImageDrop), multi: true }],
  template: `
    @if (value()) {
      <div class="preview">
        <img class="photo" [src]="value()" alt="Aperçu de l'image choisie" />
        <button type="button" class="icon-btn icon-btn-danger" aria-label="Retirer l'image" title="Retirer l'image" [disabled]="disabled()" (click)="set('')">
          <app-icon name="x" />
        </button>
      </div>
    } @else {
      <label
        class="dropzone"
        [class.is-over]="dragOver()"
        (dragenter)="onDrag($event)"
        (dragover)="onDrag($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)"
      >
        <app-icon name="upload" />
        <span>Déposez une image ou <span class="pick">choisissez un fichier</span></span>
        <input class="visually-hidden" type="file" accept="image/*" [disabled]="disabled()" (change)="onPick($event)" />
      </label>
      <input
        type="url"
        placeholder="ou collez une adresse https://"
        aria-label="Adresse de l'image"
        [disabled]="disabled()"
        (change)="set($any($event.target).value.trim())"
        (blur)="touched()"
      />
    }

    @if (reading()) {
      <small class="hint" role="status">Préparation de l'image…</small>
    }
    @if (error(); as error) {
      <small class="hint error" role="alert">{{ error }}</small>
    }
  `,
})
export class ImageDrop implements ControlValueAccessor {
  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly dragOver = signal(false);
  protected readonly reading = signal(false);
  protected readonly error = signal<string | null>(null);

  private onChange: (value: string) => void = () => {};
  protected touched: () => void = () => {};

  writeValue(value: string | null) {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.touched = fn;
  }

  setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }

  protected set(value: string) {
    this.error.set(null);
    this.value.set(value);
    this.onChange(value);
    this.touched();
  }

  protected onDrag(event: DragEvent) {
    // Without this, the browser opens the dropped file instead
    event.preventDefault();
    this.dragOver.set(!this.disabled());
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    this.read(event.dataTransfer?.files[0]);
  }

  protected onPick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.read(input.files?.[0]);
    input.value = '';
  }

  private async read(file: File | undefined) {
    if (!file || this.disabled()) {
      return;
    }

    if (!isImageFile(file)) {
      this.error.set(IMAGE_ERRORS.notImage);
      return;
    }

    this.reading.set(true);
    try {
      this.set(await toStoredImage(file));
    } catch {
      this.error.set(IMAGE_ERRORS.unreadable);
    } finally {
      this.reading.set(false);
    }
  }
}
