import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ApolloClientsService } from './core/api/services';
import { Connection } from './core/models';
import { Store } from '@ngrx/store';
import { UserSelectors } from './core/store/user';
import { SvgIconInitializerComponent } from './components/common';
import { DataLoadingService } from './core/services/data-loading.service';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, SvgIconInitializerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  // private apolloClientsService = inject(ApolloClientsService);
  private dataLoadingService = inject(DataLoadingService);

  constructor() {}

  ngOnInit(): void {
    // const connection = new Connection({
    //   id: 'main',
    //   name: 'Main',
    //   type: 'graphql',
    //   config: {
    //     host: 'localhost',
    //     port: 5000,
    //     database: 'graphql',
    //   },
    // });

    // this.store.dispatch(
    //   UserActions.login({
    //     name: 'Администратор',
    //     password:
    //       '$2a$06$lkT2d40E5PwlY8BTs/woVub16/xJYVCiIomgTvdDeIMrhpUhpXk4y',
    //   })
    // );

    // this.store.dispatch(DatasetsActions.loadDatasets());
    // this.store.dispatch(ChartsActions.loadCharts());

    this.store
      .select(UserSelectors.selectCurrentUserPermissions)
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      )
      .subscribe((permissions) => {
        this.dataLoadingService.loadRequiredData(permissions);
      });
  }
}
