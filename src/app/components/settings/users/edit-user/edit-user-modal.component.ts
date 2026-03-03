import { Component, Inject, inject, Input } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RoleDto, UserDto } from '../../../../core/store/user';
import { RolesSelectors } from '../../../../core/store/roles';
import { UsersActions } from '../../../../core/store/users';
import { MatIconModule } from '@angular/material/icon';
import { CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
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
    MatDialogContent,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogModule,
    MatTabsModule,
  ],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./user-modal.component.scss', '../user-modal.component.scss'],
})
export class EditUserModalComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditUserModalComponent>);
  user = inject(MAT_DIALOG_DATA) as UserDto;

  roles$: Observable<RoleDto[] | null> = this.store.select(
    RolesSelectors.selectRoles,
  );
  allInterfaces$: Observable<InterfaceDto[]> = this.store.select(
    InterfacesSelectors.selectAllInterfacesList,
  );

  isShowPassword = false;
  selectedTab = 0;
  availableInterfaces: InterfaceDto[] = [];
  selectedInterfaceIds = new Set<string>();
  userInterfaces: { id: string; name: string; order: number }[] = [];

  userForm: FormGroup = this.fb.group({
    id: [{ value: this.user.id, disabled: true }],
    name: [this.user.name || '', [Validators.required]],
    roleId: [this.user.role?.id || '', [Validators.required]],
    password: [this.user.password || '', [Validators.required]],
  });

  constructor() {
    this.store.dispatch(
      UsersActions.loadUserInterfaces({ userId: this.user.id! }),
    );
    // Инициализация выбранных интерфейсов
    if (this.user.interfaces) {
      this.user.interfaces
        .filter((i) => i.id && i.order !== undefined)
        .forEach((i) => {
          this.selectedInterfaceIds.add(i.id!);
          this.userInterfaces.push({
            id: i.id!,
            name: i.name || '',
            order: i.order!,
          });
        });
    }
  }

  toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  onInterfaceToggle(interfaceId: string): void {
    if (this.selectedInterfaceIds.has(interfaceId)) {
      this.selectedInterfaceIds.delete(interfaceId);
      // Удаляем из userInterfaces
      this.userInterfaces = this.userInterfaces.filter(
        (i) => i.id !== interfaceId,
      );
    } else {
      this.selectedInterfaceIds.add(interfaceId);
      // Добавляем в userInterfaces с order = последний индекс + 1
      console.log(this.userInterfaces);
      const order =
        this.userInterfaces.length > 0
          ? Math.max(...this.userInterfaces.map((i) => i.order)) + 1
          : 0;

      // Найдём имя интерфейса
      let interfaceName = '';
      this.allInterfaces$.subscribe((interfaces) => {
        const found = interfaces.find((i) => i.id === interfaceId);
        if (found) interfaceName = found.name || '';
      });

      this.userInterfaces.push({ id: interfaceId, name: interfaceName, order });
    }
  }

  updateInterfaceOrder(interfaceId: string, newOrder: number): void {
    const index = this.userInterfaces.findIndex((i) => i.id === interfaceId);
    console.log(this.userInterfaces, index);
    if (index !== -1) {
      this.userInterfaces[index].order = newOrder;
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const { name, password } = this.userForm.value;
    const newRoleId = this.userForm.get('roleId')!.value;
    const oldRoleId = this.user.role?.id || '';
    const userId = this.user.id!;

    // Обновляем пользователя
    this.store.dispatch(
      UsersActions.updateUser({ id: userId, name, password }),
    );

    // Обновляем роль
    if (oldRoleId !== newRoleId) {
      this.store.dispatch(
        UsersActions.updateUserRole({ userId, oldRoleId, newRoleId }),
      );
    }

    // Обновляем интерфейсы
    const currentInterfaceIds = new Set(
      (this.user.interfaces || [])
        .map((i) => i.id)
        .filter((id): id is string => id !== undefined),
    );

    const newUserInterfaceIds = new Set(this.userInterfaces.map((i) => i.id));

    // Удаляем старые интерфейсы
    currentInterfaceIds.forEach((id) => {
      if (!newUserInterfaceIds.has(id)) {
        const interfaceToRemove = this.user.interfaces?.find(
          (i) => i.id === id,
        );
        if (interfaceToRemove) {
          this.store.dispatch(
            UsersActions.deleteUserInterface({
              userId,
              interfaceId: id,
              order: interfaceToRemove.order || 0,
            }),
          );
        }
      }
    });

    // Обновляем/добавляем интерфейсы
    this.userInterfaces.forEach(({ id, order }) => {
      if (!currentInterfaceIds.has(id)) {
        // Новый интерфейс
        this.store.dispatch(
          UsersActions.createUserInterface({
            userId,
            interfaceId: id,
            order,
          }),
        );
      } else {
        // Обновляем порядок существующего
        const oldInterface = this.user.interfaces?.find((i) => i.id === id);
        if (oldInterface && oldInterface.order !== order) {
          this.store.dispatch(
            UsersActions.updateUserInterface({
              userId,
              currentInterfaceId: id,
              currentOrder: oldInterface.order || 0,
              newOrder: order,
            }),
          );
        }
      }
    });

    this.dialogRef.close();
  }

  trackById(index: number, item: InterfaceDto): string {
    return item.id || '';
  }

  trackByInterfaceId(
    index: number,
    item: { id: string; name: string; order: number },
  ): string {
    return item.id;
  }
}
