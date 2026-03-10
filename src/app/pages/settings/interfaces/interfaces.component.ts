import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
  Observable,
} from 'rxjs';
import {
  InterfaceDto,
  InterfacesActions,
  InterfacesSelectors,
} from '../../../core/store/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InterfaceModalComponent } from '../../../components/settings/interface/edit-interface/interface-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings-interfaces',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './interfaces.component.html',
  styleUrl: '../settings.component.scss',
})
export class InterfacesSettingsComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  searchQuery = signal('');

  interfaces$: Observable<InterfaceDto[]> = this.store.select(
    InterfacesSelectors.selectAllInterfaces
  );

  filteredInterfaces$ = combineLatest([
    this.interfaces$,
    toObservable(this.searchQuery),
  ]).pipe(
    debounceTime(300),
    map(([interfaces, query]) => {
      if (!query.trim()) {
        return interfaces;
      }
      const searchTerm = query.toLowerCase().trim();
      return interfaces.filter(
        (intf) => intf.name?.toLowerCase().includes(searchTerm) ?? false
      );
    })
  );

  constructor() {}

  onDelete(id: string, order: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Удалить этот интерфейс?')) {
      this.store.dispatch(
        InterfacesActions.deleteInterface({ interfaceId: id, order })
      );
    }
  }

  async openCreateInterfaceModal(): Promise<void> {
    const interfaces = await firstValueFrom(this.interfaces$);

    const maxOrder = interfaces.reduce(
      (max, intf) => Math.max(max, intf.order || 0),
      0
    );

    this.dialog.open(InterfaceModalComponent, {
      width: '600px',
      data: { order: maxOrder + 1 },
    });
  }

  openEditInterfaceModal(interfaceData: InterfaceDto, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.dialog.open(InterfaceModalComponent, {
      width: '600px',
      data: { interface: interfaceData },
    });
  }

  // async moveInterfaceUp(
  //   interfaceData: InterfaceDto,
  //   event: Event
  // ): Promise<void> {
  //   event.stopPropagation();
  //   event.preventDefault();

  //   const interfaces = await firstValueFrom(this.interfaces$);
  //   const currentIndex = interfaces.findIndex((i) => i.id === interfaceData.id);

  //   if (currentIndex > 0) {
  //     const newOrder = currentIndex;
  //     const prevInterface = interfaces[currentIndex - 1];
  //     const prevNewOrder = currentIndex + 1;

  //     this.store.dispatch(
  //       InterfacesActions.updateInterfaceOrder({
  //         interfaceId: interfaceData.id || '',
  //         order: interfaceData.order || 0,
  //         newOrder,
  //       })
  //     );

  //     this.store.dispatch(
  //       InterfacesActions.updateInterfaceOrder({
  //         interfaceId: prevInterface.id || '',
  //         order: prevInterface.order || 0,
  //         newOrder: prevNewOrder,
  //       })
  //     );
  //   }
  // }

  // async moveInterfaceDown(
  //   interfaceData: InterfaceDto,
  //   event: Event
  // ): Promise<void> {
  //   event.stopPropagation();
  //   event.preventDefault();

  //   const interfaces = await firstValueFrom(this.interfaces$);
  //   const currentIndex = interfaces.findIndex((i) => i.id === interfaceData.id);

  //   if (currentIndex < interfaces.length - 1) {
  //     const newOrder = currentIndex + 2;
  //     const nextInterface = interfaces[currentIndex + 1];
  //     const nextNewOrder = currentIndex + 1;

  //     this.store.dispatch(
  //       InterfacesActions.updateInterfaceOrder({
  //         interfaceId: interfaceData.id || '',
  //         order: interfaceData.order || 0,
  //         newOrder,
  //       })
  //     );

  //     this.store.dispatch(
  //       InterfacesActions.updateInterfaceOrder({
  //         interfaceId: nextInterface.id || '',
  //         order: nextInterface.order || 0,
  //         newOrder: nextNewOrder,
  //       })
  //     );
  //   }
  // }

  trackById(index: number, item: InterfaceDto): string {
    return item.id || '';
  }
}
