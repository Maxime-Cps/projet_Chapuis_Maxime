import {PollutionType} from './PollutionType';

export interface FormFields {
  label : string;
  type : PollutionType;
  description : string;
  date : string;
  place : string;
  latitude : string;
  longitude : string;
  image : string;
}
