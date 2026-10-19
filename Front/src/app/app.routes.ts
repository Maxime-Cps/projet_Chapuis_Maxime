import { Routes } from '@angular/router';
import { PollutionForm } from './pollution-form/pollution-form';
import { SignUp } from './sign-up/sign-up';
import { PollutionList } from './pollution-list/pollution-list';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { ROUTE_PATHS } from '../constants/routes';

export const routes: Routes = [
  { path: ROUTE_PATHS.report, component: PollutionForm },
  { path: ROUTE_PATHS.list, component: PollutionList },
  { path: ROUTE_PATHS.detail, component: PollutionDetail },
  { path: ROUTE_PATHS.edit, component: PollutionForm },
  { path: ROUTE_PATHS.signUp, component: SignUp },
  { path: '**', redirectTo: ROUTE_PATHS.report },
];
