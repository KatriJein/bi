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
import { AuthGuard } from './guards';

export const routes: Routes = [
  {
    path: '',
    component: HeaderLayoutComponent,
    children: [
      { path: '', component: MainComponent, canActivate: [AuthGuard] },
      {
        path: 'dataset/new',
        component: DatasetComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'dataset/:id',
        component: DatasetComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'chart/new',
        component: ChartPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'chart/:id',
        component: ChartPageComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'dashboard/:id',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  //settings
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
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
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [AuthGuard],
    data: { onlyUnAuth: true },
  },
  { path: '**', redirectTo: '' },
];
