import {
  ApplicationConfig,
  provideZoneChangeDetection,
  inject,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { InMemoryCache, split } from '@apollo/client/core';
import { provideStore } from '@ngrx/store';
import { InterfacesEffects, InterfacesFeature } from './core/store/interfaces';
import { provideEffects } from '@ngrx/effects';
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
import { WidgetsFeature } from './core/store/widgets/widgets.feature';
import { WidgetsEffects } from './core/store/widgets';
import { provideHttpClient } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { getMainDefinition } from '@apollo/client/utilities';

function getGraphQLUri(): string {
  return `http://${window.location.hostname}:5000/graphql`;
}

function getGraphQLWsUri(): string {
  return `ws://${window.location.hostname}:5000/graphql`;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const wsLink = new GraphQLWsLink(
        createClient({
          url: getGraphQLWsUri(),
          retryAttempts: Infinity,
          retryWait: async (retries: number) => {
            const delay = [1000, 2000, 5000][Math.min(retries, 2)];
            await new Promise((resolve) => setTimeout(resolve, delay));
          },
        })
      );

      const http = httpLink.create({ uri: getGraphQLUri() });

      const link = split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
          );
        },
        wsLink,
        http
      );

      return {
        cache: new InMemoryCache(),
        link,
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
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      [InterfacesFeature.name]: InterfacesFeature.reducer,
      [UserFeature.name]: UserFeature.reducer,
      [DashboardsFeature.name]: DashboardsFeature.reducer,
      [ConnectionsFeature.name]: ConnectionsFeature.reducer,
      [DatasetsFeature.name]: DatasetsFeature.reducer,
      [ChartsFeature.name]: ChartsFeature.reducer,
      [WidgetsFeature.name]: WidgetsFeature.reducer,
    }),
    provideEffects([
      InterfacesEffects,
      UserEffects,
      DashboardsEffects,
      ConnectionsEffects,
      DatasetsEffects,
      ChartsEffects,
      WidgetsEffects,
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
