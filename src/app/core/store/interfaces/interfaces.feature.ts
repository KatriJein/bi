import { createFeature, createReducer, on } from '@ngrx/store';
import * as InterfaceActions from './interfaces.actions';
import { sortByOrder } from '../../utils/sort.utils';

export interface InterfaceDto {
  id: string | undefined;
  name: string | undefined;
  order: number | undefined;
}

export interface InterfacesState {
  interfaces: InterfaceDto[];
  activeInterfaceId: string;
  isLoading: boolean;
  error: string | null;
}

export const initialState: InterfacesState = {
  interfaces: [],
  activeInterfaceId: '',
  isLoading: false,
  error: null,
};

export const InterfacesFeature = createFeature({
  name: 'interfaces',
  reducer: createReducer(
    initialState,
    // Загрузка
    on(InterfaceActions.loadInterfaces, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(InterfaceActions.loadInterfacesSuccess, (state, { interfaces }) => ({
      ...state,
      interfaces: sortByOrder(interfaces),
      activeInterfaceId: sortByOrder(interfaces)[0]?.id || '',
      isLoading: false,
    })),
    on(InterfaceActions.loadInterfacesFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),

    // Добавление
    on(InterfaceActions.createInterface, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      InterfaceActions.createInterfaceSuccess,
      (state, { interface: newInterface }) => {
        const updatedState = {
          ...state,
          interfaces: sortByOrder([...state.interfaces, newInterface]),
          isLoading: false,
        };

        if (state.activeInterfaceId === '') {
          updatedState.activeInterfaceId = newInterface.id || '';
        }

        return updatedState;
      }
    ),
    on(InterfaceActions.createInterfaceFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Удаление
    on(InterfaceActions.deleteInterface, (state) => ({
      ...state,
      isLoading: true,
    })),
    on(InterfaceActions.deleteInterfaceSuccess, (state, { id }) => {
      const remainingInterfaces = sortByOrder(
        state.interfaces.filter((intf) => intf.id !== id)
      );

      return {
        ...state,
        interfaces: remainingInterfaces,
        activeInterfaceId:
          state.activeInterfaceId === id
            ? remainingInterfaces[0]?.id ?? ''
            : state.activeInterfaceId,
        isLoading: false,
      };
    }),
    on(InterfaceActions.deleteInterfaceFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Обновление имени
    on(InterfaceActions.updateInterfaceName, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      InterfaceActions.updateInterfaceNameSuccess,
      (state, { interface: updatedInterface }) => ({
        ...state,
        interfaces: sortByOrder(
          state.interfaces.map((intf) =>
            intf.id === updatedInterface.id
              ? { ...intf, name: updatedInterface.name }
              : intf
          )
        ),
        isLoading: false,
      })
    ),
    on(InterfaceActions.updateInterfaceNameFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Обновление порядка
    on(InterfaceActions.updateInterfaceOrder, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(
      InterfaceActions.updateInterfaceOrderSuccess,
      (state, { interface: updatedInterface }) => ({
        ...state,
        interfaces: sortByOrder(
          state.interfaces.map((intf) =>
            intf.id === updatedInterface.id
              ? { ...intf, order: updatedInterface.order }
              : intf
          )
        ),
        isLoading: false,
      })
    ),
    on(InterfaceActions.updateInterfaceOrderFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),

    // Активный интерфейс
    on(InterfaceActions.setActiveInterface, (state, { id }) => ({
      ...state,
      activeInterfaceId: id || '',
    }))
  ),
});
