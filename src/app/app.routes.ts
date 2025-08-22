import { Routes } from '@angular/router';
import {
  AuthComponent,
  ChartPageComponent,
  ChartsSettingsComponent,
  DashboardComponent,
  DashboardsSettingsComponent,
  DatasetComponent,
  DatasetsSettingsComponent,
  HeaderLayoutComponent,
  InterfacesSettingsComponent,
  MainComponent,
  SettingsComponent,
} from './pages';

export const routes: Routes = [
  {
    path: '',
    component: HeaderLayoutComponent,
    children: [
      { path: '', component: MainComponent },
      { path: 'dataset/new', component: DatasetComponent },
      { path: 'dataset/:id', component: DatasetComponent },
      { path: 'chart/new', component: ChartPageComponent },
      { path: 'chart/:id', component: ChartPageComponent },
    ],
  },
  { path: 'dashboard/:id', component: DashboardComponent },
  //settings
  {
    path: 'settings',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'datasets', pathMatch: 'full' },
      { path: 'datasets', component: DatasetsSettingsComponent },
      { path: 'charts', component: ChartsSettingsComponent },
      { path: 'interfaces', component: InterfacesSettingsComponent },
      {
        path: 'dashboards',
        children: [
          { path: '', component: DashboardsSettingsComponent },
          { path: ':interfaceId', component: DashboardsSettingsComponent },
        ],
      },
    ],
  },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '' },
];
