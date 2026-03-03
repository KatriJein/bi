import { createAction, props } from '@ngrx/store';
import { InterfaceDto } from './interfaces.feature';

// Загрузка
export const loadInterfaces = createAction('[Interfaces] Load Interfaces');
export const loadInterfacesSuccess = createAction(
  '[Interfaces] Load Interfaces Success',
  props<{ interfaces: InterfaceDto[] }>()
);
export const loadInterfacesFailure = createAction(
  '[Interfaces] Load Interfaces Failure',
  props<{ error: string }>()
);

// Загрузка всех
export const loadAllInterfaces = createAction('[Interfaces] Load All Interfaces');
export const loadAllInterfacesSuccess = createAction(
  '[Interfaces] Load All Interfaces Success',
  props<{ interfaces: InterfaceDto[] }>()
);
export const loadAllInterfacesFailure = createAction(
  '[Interfaces] Load All Interfaces Failure',
  props<{ error: string }>()
);

// Добавление
export const createInterface = createAction(
  '[Interfaces] Create Interface',
  props<{ name: string; order?: number }>()
);

export const createInterfaceSuccess = createAction(
  '[Interfaces] Create Interface Success',
  props<{ interface: InterfaceDto }>()
);

export const createInterfaceFailure = createAction(
  '[Interfaces] Create Interface Failure',
  props<{ error: string }>()
);

// Обновление порядка
export const updateInterfaceOrder = createAction(
  '[Interfaces] Update Interface Order',
  props<{ interfaceId: string; order: number; newOrder: number }>()
);

export const updateInterfaceOrderSuccess = createAction(
  '[Interfaces] Update Interface Order Success',
  props<{ interface: { id: string; order: number } }>()
);

export const updateInterfaceOrderFailure = createAction(
  '[Interfaces] Update Interface Order Failure',
  props<{ error: string }>()
);

// Обновление названия
export const updateInterfaceName = createAction(
  '[Interfaces] Update Interface Name',
  props<{ id: string; name: string }>()
);

export const updateInterfaceNameSuccess = createAction(
  '[Interfaces] Update Interface Name Success',
  props<{ interface: Partial<InterfaceDto> }>()
);

export const updateInterfaceNameFailure = createAction(
  '[Interfaces] Update Interface Name Failure',
  props<{ error: string }>()
);

// Удаление
export const deleteInterface = createAction(
  '[Interfaces] Delete Interface',
  props<{ interfaceId: string; order?: number }>()
);

export const deleteInterfaceSuccess = createAction(
  '[Interfaces] Delete Interface Success',
  props<{ id: string }>()
);

export const deleteInterfaceFailure = createAction(
  '[Interfaces] Delete Interface Failure',
  props<{ error: string }>()
);

// Установка активного интерфейса
export const setActiveInterface = createAction(
  '[Interfaces] Set Active Interface',
  props<{ id: string | null }>()
);
