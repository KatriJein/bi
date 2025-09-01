import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DashboardFilter } from '../../../core/api/graphql/types';
import { DateInputComponent } from '../../common';
import {
  getNameOfType,
  getSelectionOptionsByType,
  SelectionColumnType,
} from '../../../constants';

const DATE_RANGE_FILTER = 'Принадлежит диапазону';

@Component({
  selector: 'dashboard-selection-modal',
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatIconModule,
    DateInputComponent,
  ],
  templateUrl: './selection-modal.component.html',
  styleUrls: ['./selection-modal.component.scss'],
})
export class DashboardSelectionModalComponent implements OnInit, OnDestroy {
  readonly DATE_RANGE_FILTER = DATE_RANGE_FILTER;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DashboardSelectionModalComponent>);
  private data = inject<{ filter?: DashboardFilter }>(MAT_DIALOG_DATA);

  filterForm: FormGroup;
  columnTypes: ('string' | 'number' | 'date')[] = ['string', 'number', 'date'];
  filterTypes: string[] = [];
  currentInputType: 'text' | 'number' | 'date' = 'text';
  canSave = false;

  private subs: Subscription[] = [];

  getNameOfType = getNameOfType;
  getSelectionOptionsByType = getSelectionOptionsByType;

  constructor() {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      filterType: ['', Validators.required],
      isMultiple: [false],
      value: [''],
      values: this.fb.array([]),
      dateValues: this.fb.array([]),
      dateRangeValues: this.fb.array([]),
    });
  }

  get valuesArray(): FormArray {
    return this.filterForm.get('values') as FormArray;
  }
  get dateValuesArray(): FormArray {
    return this.filterForm.get('dateValues') as FormArray;
  }
  get dateRangeValuesArray(): FormArray {
    return this.filterForm.get('dateRangeValues') as FormArray;
  }

  get valuesControls(): FormControl[] {
    return this.valuesArray.controls as FormControl[];
  }
  get dateControls(): FormControl[] {
    return this.dateValuesArray.controls as FormControl[];
  }

  ngOnInit(): void {
    this.subs.push(
      this.filterForm
        .get('type')!
        .valueChanges.subscribe((t) => this.onTypeChange(t))
    );

    this.subs.push(
      this.filterForm
        .get('filterType')!
        .valueChanges.subscribe((ft) => this.onFilterTypeChange(ft))
    );
    this.subs.push(
      this.filterForm
        .get('isMultiple')!
        .valueChanges.subscribe((m) => this.onIsMultipleChange(m))
    );

    this.subs.push(
      this.valuesArray.valueChanges.subscribe(() => this.recomputeCanSave())
    );
    this.subs.push(
      this.dateValuesArray.valueChanges.subscribe(() => this.recomputeCanSave())
    );
    this.subs.push(
      this.dateRangeValuesArray.valueChanges.subscribe(() =>
        this.recomputeCanSave()
      )
    );
    this.subs.push(
      this.filterForm.valueChanges.subscribe(() => this.recomputeCanSave())
    );

    if (this.data?.filter) {
      this.initFormWithExistingFilter(this.data.filter);
    }

    this.ensureAtLeastOneControl();
    this.recomputeCanSave();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private createValueControl(initial = ''): FormControl {
    return this.fb.control(initial, Validators.required);
  }
  private createDateControl(initial: string | null = null): FormControl {
    return this.fb.control(initial, Validators.required);
  }
  private createDateRangeGroup(
    initial: [string | null, string | null] = [null, null]
  ) {
    return this.fb.group({
      start: [initial[0], Validators.required],
      end: [initial[1], Validators.required],
    });
  }

  addValueInput(initial = '') {
    this.valuesArray.push(this.createValueControl(initial));
    this.valuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }
  removeValueInput(i: number) {
    this.valuesArray.removeAt(i);
    this.valuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }

  addDateInput(initial: string | null = null) {
    this.dateValuesArray.push(this.createDateControl(initial));
    this.dateValuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }
  removeDateInput(i: number) {
    this.dateValuesArray.removeAt(i);
    this.dateValuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }

  addDateRangeInput(initial: [string | null, string | null] = [null, null]) {
    this.dateRangeValuesArray.push(this.createDateRangeGroup(initial));
    this.dateRangeValuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }
  removeDateRangeInput(i: number) {
    this.dateRangeValuesArray.removeAt(i);
    this.dateRangeValuesArray.updateValueAndValidity();
    this.recomputeCanSave();
  }

  private onTypeChange(type: 'string' | 'number' | 'date') {
    this.clearAllValues();

    if (type === 'date') {
      this.currentInputType = 'date';
      this.filterForm.get('value')!.disable({ emitEvent: false });
    } else {
      this.currentInputType = type === 'number' ? 'number' : 'text';
      this.filterForm.get('value')!.enable({ emitEvent: false });
    }

    this.filterTypes = this.getSelectionOptionsByType(type);

    this.filterForm.get('filterType')!.setValue('', { emitEvent: false });

    if (this.filterForm.get('isMultiple')!.value)
      this.ensureAtLeastOneControl();

    this.recomputeCanSave();
  }

  private onFilterTypeChange(_filterType: string) {
    this.ensureAtLeastOneControl();
    this.recomputeCanSave();
  }

  private onIsMultipleChange(_isMultiple: boolean) {
    this.ensureAtLeastOneControl();
    this.recomputeCanSave();
  }

  private ensureAtLeastOneControl() {
    const type = this.filterForm.get('type')!.value;
    const filterType = this.filterForm.get('filterType')!.value;
    const isMultiple = this.filterForm.get('isMultiple')!.value;

    if (type !== 'date') {
      if (isMultiple) {
        if (this.valuesArray.length === 0) this.addValueInput();
      }
      return;
    }

    if (filterType === DATE_RANGE_FILTER) {
      if (this.dateRangeValuesArray.length === 0) {
        if (this.dateValuesArray.length > 0) {
          const first = this.dateValuesArray.at(0).value || null;
          this.addDateRangeInput([first, null]);
        } else {
          this.addDateRangeInput();
        }
      }
    } else {
      if (this.dateValuesArray.length === 0) {
        if (this.dateRangeValuesArray.length > 0) {
          const firstRangeStart =
            this.dateRangeValuesArray.at(0).get('start')?.value || null;
          this.addDateInput(firstRangeStart);
        } else {
          this.addDateInput();
        }
      }
    }
  }

  private clearAllValues() {
    this.valuesArray.clear();
    this.valuesArray.updateValueAndValidity();

    this.dateValuesArray.clear();
    this.dateValuesArray.updateValueAndValidity();

    this.dateRangeValuesArray.clear();
    this.dateRangeValuesArray.updateValueAndValidity();

    this.filterForm.get('value')!.setValue('');
  }

  onSingleDateChange(value: any) {
    if (this.dateValuesArray.length === 0) {
      this.addDateInput(value);
      return;
    }
    const ctrl = this.dateValuesArray.at(0);
    if (ctrl) {
      ctrl.setValue(value);
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity();
    }
    this.recomputeCanSave();
  }

  onSingleRangePartChange(part: 'start' | 'end', value: any) {
    if (this.dateRangeValuesArray.length === 0) {
      const initial: [string | null, string | null] = [null, null];
      if (part === 'start') initial[0] = value;
      else initial[1] = value;
      this.addDateRangeInput(initial);
      return;
    }
    const grp = this.dateRangeValuesArray.at(0);
    if (grp && grp.get(part)) {
      grp.get(part)!.setValue(value);
      grp.get(part)!.markAsTouched();
      grp.updateValueAndValidity();
    }
    this.recomputeCanSave();
  }

  onDateControlChange(index: number, value: any) {
    const ctrl = this.dateValuesArray.at(index);
    if (ctrl) {
      ctrl.setValue(value);
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity();
    }
    this.recomputeCanSave();
  }

  onDateRangeControlChange(index: number, part: 'start' | 'end', value: any) {
    const grp = this.dateRangeValuesArray.at(index);
    if (grp && grp.get(part)) {
      grp.get(part)!.setValue(value);
      grp.get(part)!.markAsTouched();
      grp.updateValueAndValidity();
    }
    this.recomputeCanSave();
  }

  public recomputeCanSave() {
    this.canSave = this.computeValidity();
  }

  private computeValidity(): boolean {
    if (!this.filterForm) return false;
    if (this.filterForm.get('name')!.invalid) return false;
    if (this.filterForm.get('type')!.invalid) return false;
    if (this.filterForm.get('filterType')!.invalid) return false;

    const isMultiple = this.filterForm.get('isMultiple')!.value;
    const type = this.filterForm.get('type')!.value;
    const filterType = this.filterForm.get('filterType')!.value;

    if (isMultiple) {
      if (type === 'date') {
        if (filterType === DATE_RANGE_FILTER) {
          return (
            this.dateRangeValuesArray.length > 0 &&
            this.dateRangeValuesArray.controls.every(
              (g) => g.valid && !!g.get('start')?.value && !!g.get('end')?.value
            )
          );
        } else {
          return (
            this.dateValuesArray.length > 0 &&
            this.dateValuesArray.controls.every((c) => c.valid && !!c.value)
          );
        }
      } else {
        return (
          this.valuesArray.length > 0 &&
          this.valuesArray.controls.every((c) => c.valid && !!c.value)
        );
      }
    } else {
      if (type === 'date') {
        if (filterType === DATE_RANGE_FILTER) {
          return (
            this.dateRangeValuesArray.length > 0 &&
            this.dateRangeValuesArray.at(0).valid &&
            !!this.dateRangeValuesArray.at(0).get('start')?.value &&
            !!this.dateRangeValuesArray.at(0).get('end')?.value
          );
        } else {
          return (
            this.dateValuesArray.length > 0 &&
            this.dateValuesArray.at(0).valid &&
            !!this.dateValuesArray.at(0).value
          );
        }
      } else {
        return !!this.filterForm.get('value')!.value;
      }
    }
  }

  private initFormWithExistingFilter(filter: DashboardFilter) {
    this.filterForm.patchValue({
      name: filter.name,
      type: filter.fieldType,
      filterType: filter.filterType,
      isMultiple: !!filter.isMultiple,
    });

    this.filterTypes = this.getSelectionOptionsByType(
      filter.fieldType as SelectionColumnType
    );

    this.clearAllValues();

    const value = filter.value.value;

    if (filter.isMultiple) {
      if (filter.fieldType === 'date') {
        if (filter.filterType === DATE_RANGE_FILTER) {
          (value || []).forEach((r: any) =>
            this.addDateRangeInput([r?.[0] || null, r?.[1] || null])
          );
        } else {
          (value || []).forEach((d: any) => this.addDateInput(d || null));
        }
      } else {
        (value || []).forEach((v: any) => this.addValueInput(v || ''));
      }
    } else {
      if (filter.fieldType === 'date') {
        if (filter.filterType === DATE_RANGE_FILTER) {
          this.addDateRangeInput([value?.[0] || null, value?.[1] || null]);
        } else {
          this.addDateInput(value || null);
        }
      } else {
        this.filterForm.get('value')!.setValue(value || '');
      }
    }

    this.recomputeCanSave();
  }

  onSave() {
    if (!this.canSave) return;

    const formValue = this.filterForm.value;
    const type = this.filterForm.get('type')!.value;
    let value: any;

    if (type === 'date') {
      if (formValue.isMultiple) {
        if (formValue.filterType === DATE_RANGE_FILTER) {
          value = this.dateRangeValuesArray.value.map((g: any) => [
            g.start,
            g.end,
          ]);
        } else {
          value = this.dateValuesArray.value;
        }
      } else {
        if (formValue.filterType === DATE_RANGE_FILTER) {
          const g = this.dateRangeValuesArray.at(0);
          value = [g?.get('start')?.value || '', g?.get('end')?.value || ''];
        } else {
          value = this.dateValuesArray.at(0)?.value || '';
        }
      }
    } else {
      value = formValue.isMultiple ? this.valuesArray.value : formValue.value;
    }

    const newFilter = {
      name: formValue.name,
      columnType: formValue.type,
      filterType: formValue.filterType,
      isMultiple: formValue.isMultiple,
      value,
    };

    this.dialogRef.close(newFilter);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
