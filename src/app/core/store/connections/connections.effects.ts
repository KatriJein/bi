import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

@Injectable()
export class ConnectionsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

}
