import { Routes } from '@angular/router';
import { PollutionForm } from './pollution-form/pollution-form';
import { SignUp } from './sign-up/sign-up';
import { PollutionList } from './pollution-list/pollution-list';
import { PollutionDetail } from './pollution-detail/pollution-detail';

export const routes: Routes = [
  { path: 'pollutionForm', component: PollutionForm },
  { path: 'pollutions', component: PollutionList },
  { path: 'pollutions/:id', component: PollutionDetail },
  { path: 'pollutions/:id/edit', component: PollutionForm },
  { path: '', component: SignUp },
];
