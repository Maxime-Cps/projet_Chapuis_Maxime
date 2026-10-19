export interface PollutionType {
  id: number;
  name: string;
}

export const POLLUTION_TYPES: readonly PollutionType[] = [
  { id: 0, name: 'Plastique' },
  { id: 1, name: 'Chimique' },
  { id: 2, name: 'Dépôt sauvage' },
  { id: 3, name: 'Eau' },
  { id: 4, name: 'Air' },
  { id: 5, name: 'Autre' },
];
