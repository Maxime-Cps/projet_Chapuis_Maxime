import { PollutionType } from './PollutionType';

export interface Pollution {
  id: number;
  label: string;
  type: PollutionType;
  description: string;
  date: string;
  place: string;
  latitude: string;
  longitude: string;
  image: string;
}

/** A pollution not saved yet: the API assigns its id. */
export type NewPollution = Omit<Pollution, 'id'>;
