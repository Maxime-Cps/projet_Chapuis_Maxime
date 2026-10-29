import { delay, dematerialize, materialize, MonoTypeOperatorFunction, pipe } from 'rxjs';
import { environment } from '../environments/environment';

/** Delays mock responses and errors alike, to mimic a network round trip. */
export function withLatency<T>(): MonoTypeOperatorFunction<T> {
  return pipe(materialize(), delay(environment.MOCK_LATENCY_MS), dematerialize());
}
