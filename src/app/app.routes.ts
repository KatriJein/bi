import { Routes } from '@angular/router';
import {
  AuthComponent,
  ChartPageComponent,
  ChartsSettingsComponent,
  DashboardComponent,
  DashboardsSettingsComponent,
  DatasetComponent,
  DatasetsSettingsComponent,
  FullscreenWidgetComponent,
  HeaderLayoutComponent,
  InterfacesSettingsComponent,
  MainComponent,
  RolesSettingsComponent,
  SettingsComponent,
  UsersSettingsComponent,
} from './pages';
import { AuthGuard, PermissionGuard } from './guards';

export const routes: Routes = [
  {
    path: '',
    component: HeaderLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: MainComponent },
      {
        path: 'dataset/new',
        component: DatasetComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['datasets.manage'] },
      },
      {
        path: 'dataset/:id',
        component: DatasetComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['datasets.manage'] },
      },
      {
        path: 'chart/new',
        component: ChartPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['charts.manage'] },
      },
      {
        path: 'chart/:id',
        component: ChartPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['charts.manage'] },
      },
    ],
  },
  {
    path: 'dashboard/:id',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'widget-fullscreen/:widgetId',
    component: FullscreenWidgetComponent,
    canActivate: [AuthGuard],
  },
  // Настройки
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: '',  },
      {
        path: 'datasets',
        component: DatasetsSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['datasets.manage'] },
      },
      {
        path: 'charts',
        component: ChartsSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['charts.manage'] },
      },
      {
        path: 'interfaces',
        component: InterfacesSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['interfaces.manage'] },
      },
      {
        path: 'dashboards',
        canActivate: [PermissionGuard],
        data: { permissions: ['dashboards.manage', 'interfaces.manage'] },
        children: [
          { path: '', component: DashboardsSettingsComponent },
          { path: ':interfaceId', component: DashboardsSettingsComponent },
        ],
      },
      {
        path: 'users',
        component: UsersSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['users.manage'] },
      },
      {
        path: 'roles',
        component: RolesSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['roles.manage'] },
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
