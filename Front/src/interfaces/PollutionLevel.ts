/** Status of a pollution, derived from its danger index. */
export enum PollutionLevel {
  Low = 'Faible',
  Moderate = 'Modérée',
  High = 'Élevée',
  Dangerous = 'Dangereuse',
  /** No index known, e.g. a pollution saved before the field existed. */
  Unknown = 'Non renseignée',
}
