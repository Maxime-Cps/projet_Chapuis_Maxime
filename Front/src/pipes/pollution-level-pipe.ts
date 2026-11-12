import { Pipe, PipeTransform } from '@angular/core';
import { PollutionLevel } from '../interfaces/PollutionLevel';
import { toPollutionLevel } from '../utils/pollution-level';

/** Turns a danger index into its status, e.g. `{{ 35 | pollutionLevel }}` -> "Modérée". */
@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(index: number | null | undefined): PollutionLevel {
    return toPollutionLevel(index);
  }
}
