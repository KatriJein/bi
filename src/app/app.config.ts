import {
  ApplicationConfig,
  provideZoneChangeDetection,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideStore } from '@ngrx/store';
import { InterfacesEffects, InterfacesFeature } from './core/store/interfaces';
import { provideEffects } from '@ngrx/effects';
import { InterfaceService } from './core/api/services';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { UserEffects, UserFeature } from './core/store/user';
import { DashboardsEffects, DashboardsFeature } from './core/store/dashboards';
import {
  ConnectionsEffects,
  ConnectionsFeature,
} from './core/store/connections';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DatasetsEffects, DatasetsFeature } from './core/store/datasets';
import { ChartsEffects, ChartsFeature } from './core/store/charts';

export const appConfig: ApplicationConfig = {
  providers: [
    InterfaceService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: 'http://localhost:5000/graphql',
        }),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
          },
          query: {
            fetchPolicy: 'network-only',
          },
          mutate: {
            errorPolicy: 'all',
          },
        },
      };
    }),

    provideStore({
      [InterfacesFeature.name]: InterfacesFeature.reducer,
      [UserFeature.name]: UserFeature.reducer,
      [DashboardsFeature.name]: DashboardsFeature.reducer,
      [ConnectionsFeature.name]: ConnectionsFeature.reducer,
      [DatasetsFeature.name]: DatasetsFeature.reducer,
      [ChartsFeature.name]: ChartsFeature.reducer
    }),
    provideEffects([
      InterfacesEffects,
      UserEffects,
      DashboardsEffects,
      ConnectionsEffects,
      DatasetsEffects,
      ChartsEffects
    ]),
    provideStoreDevtools({
      maxAge: 50,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: true,
      traceLimit: 75,
      connectInZone: true,
    }),
    provideCharts(withDefaultRegisterables()),
  ],
};
