import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ApolloClientsService } from './core/api/services';
import { Connection } from './core/models';
import { Store } from '@ngrx/store';
import { UserActions } from './core/store/user';
import { DatasetsActions } from './core/store/datasets';
import { ChartsActions } from './core/store/charts';
import { SvgIconInitializerComponent } from './components/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, SvgIconInitializerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private apolloClientsService = inject(ApolloClientsService);

  constructor() {}

  ngOnInit(): void {
    const connection = new Connection({
      id: 'main',
      name: 'Main',
      type: 'graphql',
      config: {
        host: 'localhost',
        port: 5000,
        database: 'graphql',
      },
    });

    this.store.dispatch(
      UserActions.login({
        name: 'Администратор',
        password:
          '$2a$06$DOcdRmKkyE87zfZConVbSO/ueB46STjUZ/tkm.ou1rdFAWA.u4cke',
      })
    );

    this.store.dispatch(DatasetsActions.loadDatasets());
    this.store.dispatch(ChartsActions.loadCharts());
  }
}
