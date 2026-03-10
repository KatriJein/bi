import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { RoleDto, UserDto } from '../../../../core/store/user';
import { RolesSelectors } from '../../../../core/store/roles';
import { UsersActions } from '../../../../core/store/users';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  InterfaceDto,
  InterfacesSelectors,
} from '../../../../core/store/interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTabsModule,
    MatDialogModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    FormsModule,
  ],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./user-modal.component.scss', '../user-modal.component.scss'],
})
export class EditUserModalComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditUserModalComponent>);
  user = inject(MAT_DIALOG_DATA) as UserDto;

  private originalName: string;
  private originalPassword: string;
  private originalRoleId: string;
  private originalInterfaces: { id: string; order: number }[] = [];

  roles$: Observable<RoleDto[] | null> = this.store.select(
    RolesSelectors.selectRoles,
  );
  allInterfaces$: Observable<InterfaceDto[]> = this.store.select(
    InterfacesSelectors.selectAllInterfaces,
  );

  allInterfaces: InterfaceDto[] = [];
  private allInterfacesSub?: Subscription;

  isShowPassword = false;
  selectedTab = 0;

  searchTerm: string = '';

  get filteredInterfaces(): InterfaceDto[] {
    if (!this.allInterfaces.length) return [];
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.allInterfaces;
    return this.allInterfaces.filter((i) =>
      i.name?.toLowerCase().includes(term),
    );
  }

  userInterfaces: InterfaceDto[] = [];

  userForm: FormGroup = this.fb.group({
    id: [{ value: this.user.id, disabled: true }],
    name: [this.user.name || '', [Validators.required]],
    roleId: [this.user.role?.id || '', [Validators.required]],
    password: [this.user.password || '', [Validators.required]],
  });

  constructor() {
    this.originalName = this.user.name || '';
    this.originalPassword = this.user.password || '';
    this.originalRoleId = this.user.role?.id || '';

    if (this.user.interfaces) {
      this.originalInterfaces = this.user.interfaces
        .filter((i) => i.id !== undefined && i.order !== undefined)
        .map((i) => ({ id: i.id!, order: i.order! }));

      this.userInterfaces = this.user.interfaces
        .filter((i) => i.id && i.order !== undefined)
        .map((i) => ({
          id: i.id!,
          name: i.name || '',
          order: i.order!,
        }))
        .sort((a, b) => a.order - b.order);
    }

    if (this.user.interfaces) {
      this.userInterfaces = this.user.interfaces
        .filter((i) => i.id && i.order !== undefined)
        .map((i) => ({
          id: i.id!,
          name: i.name || '',
          order: i.order!,
        }))
        .sort((a, b) => a.order - b.order);
    }
  }

  ngOnInit(): void {
    this.allInterfacesSub = this.allInterfaces$.subscribe((interfaces) => {
      this.allInterfaces = interfaces;
    });
  }

  ngOnDestroy(): void {
    this.allInterfacesSub?.unsubscribe();
  }

  get selectedInterfaceIds(): Set<string> {
    return new Set(this.userInterfaces.map((i) => i.id!));
  }

  onInterfaceToggle(interfaceId: string): void {
    const index = this.userInterfaces.findIndex((i) => i.id === interfaceId);
    if (index >= 0) {
      this.userInterfaces.splice(index, 1);
    } else {
      const interfaceDto = this.allInterfaces.find((i) => i.id === interfaceId);
      if (interfaceDto) {
        this.userInterfaces.push({
          id: interfaceId,
          name: interfaceDto.name || '',
          order: this.userInterfaces.length,
        });
      }
    }

    this.reorderUserInterfaces();
  }

  removeInterface(id: string): void {
    const index = this.userInterfaces.findIndex((i) => i.id === id);
    if (index >= 0) {
      this.userInterfaces.splice(index, 1);
      this.reorderUserInterfaces();
    }
  }

  drop(
    event: CdkDragDrop<{ id: string; name: string; order: number }[]>,
  ): void {
    moveItemInArray(
      this.userInterfaces,
      event.previousIndex,
      event.currentIndex,
    );
    this.reorderUserInterfaces();
  }

  private reorderUserInterfaces(): void {
    this.userInterfaces.forEach((item, idx) => (item.order = idx));
    this.userInterfaces.sort((a, b) => a.order! - b.order!);
  }

  toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const { name, password } = this.userForm.value;
    const newRoleId = this.userForm.get('roleId')!.value;
    const userId = this.user.id!;

    if (name !== this.originalName || password !== this.originalPassword) {
      this.store.dispatch(
        UsersActions.updateUser({ id: userId, name, password }),
      );
    }

    if (this.originalRoleId !== newRoleId) {
      this.store.dispatch(
        UsersActions.updateUserRole({
          userId,
          oldRoleId: this.originalRoleId,
          newRoleId,
        }),
      );
    }

    const currentInterfaceIds = new Set(
      this.originalInterfaces.map((i) => i.id),
    );
    const newUserInterfaceIds = new Set(this.userInterfaces.map((i) => i.id!));

    const interfacesChanged =
      currentInterfaceIds.size !== newUserInterfaceIds.size ||
      [...currentInterfaceIds].some((id) => !newUserInterfaceIds.has(id)) ||
      this.userInterfaces.some(({ id, order }) => {
        const old = this.originalInterfaces.find((i) => i.id === id);
        return !old || old.order !== order;
      });

    if (interfacesChanged) {
      currentInterfaceIds.forEach((id) => {
        if (!newUserInterfaceIds.has(id)) {
          const oldInterface = this.originalInterfaces.find((i) => i.id === id);
          if (oldInterface) {
            this.store.dispatch(
              UsersActions.deleteUserInterface({
                userId,
                interfaceId: id,
                order: oldInterface.order,
              }),
            );
          }
        }
      });

      this.userInterfaces.forEach(({ id, order }) => {
        if (!currentInterfaceIds.has(id!)) {
          this.store.dispatch(
            UsersActions.createUserInterface({
              userId,
              interfaceId: id!,
              order,
            }),
          );
        } else {
          const old = this.originalInterfaces.find((i) => i.id === id);
          if (old && old.order !== order) {
            this.store.dispatch(
              UsersActions.updateUserInterface({
                userId,
                currentInterfaceId: id!,
                currentOrder: old.order,
                newOrder: order,
              }),
            );
          }
        }
      });
    }

    this.dialogRef.close();
  }

  trackById(index: number, item: InterfaceDto): string {
    return item.id || '';
  }

  trackByInterfaceId(
    index: number,
    item: {
      id: string | undefined;
      name: string | undefined;
      order: number | undefined;
    },
  ): string {
    return item.id!;
  }
}
