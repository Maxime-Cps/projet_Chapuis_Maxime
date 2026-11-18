import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PollutionDeletion, UNDO_DELAY_MS } from './pollution-deletion';
import { PollutionApi } from './pollution-api';
import { Pollution } from '../interfaces/Pollution';
import { POLLUTION_TYPES } from '../interfaces/PollutionType';

describe('PollutionDeletion', () => {
  const POLLUTION: Pollution = {
    id: 7,
    label: 'Pneus',
    type: POLLUTION_TYPES[2],
    description: '',
    date: '2026-10-01T10:00',
    place: 'Lyon',
    latitude: '45.76',
    longitude: '4.83',
    image: '',
    dangerLevel: 30,
  };

  let deletion: PollutionDeletion;
  let api: { delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    api = { delete: vi.fn().mockReturnValue(of(undefined)) };
    TestBed.configureTestingModule({ providers: [{ provide: PollutionApi, useValue: api }] });
    deletion = TestBed.inject(PollutionDeletion);
  });

  afterEach(() => vi.useRealTimers());

  it('should hide the report at once and delete it after the delay', () => {
    deletion.schedule(POLLUTION);

    expect(deletion.hiddenIds().has(POLLUTION.id)).toBe(true);
    expect(api.delete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(UNDO_DELAY_MS);

    expect(api.delete).toHaveBeenCalledWith(POLLUTION.id);
    expect(deletion.pending()).toBeNull();
    expect(deletion.hiddenIds().has(POLLUTION.id)).toBe(true);
  });

  it('should send nothing when undone', () => {
    deletion.schedule(POLLUTION);
    deletion.undo();
    vi.advanceTimersByTime(UNDO_DELAY_MS);

    expect(api.delete).not.toHaveBeenCalled();
    expect(deletion.hiddenIds().has(POLLUTION.id)).toBe(false);
  });

  it('should show the report again when the deletion fails', () => {
    api.delete.mockReturnValue(throwError(() => new Error('down')));

    deletion.schedule(POLLUTION);
    deletion.commit();

    expect(deletion.hiddenIds().has(POLLUTION.id)).toBe(false);
    expect(deletion.error()).not.toBeNull();
  });

  it('should send the pending deletion when the page is left', () => {
    deletion.schedule(POLLUTION);

    dispatchEvent(new Event('pagehide'));

    expect(api.delete).toHaveBeenCalledWith(POLLUTION.id);
  });

  it('should send the previous deletion when another is scheduled', () => {
    deletion.schedule(POLLUTION);
    deletion.schedule({ ...POLLUTION, id: 8 });

    expect(api.delete).toHaveBeenCalledWith(POLLUTION.id);
    expect(deletion.pending()?.id).toBe(8);
  });
});
