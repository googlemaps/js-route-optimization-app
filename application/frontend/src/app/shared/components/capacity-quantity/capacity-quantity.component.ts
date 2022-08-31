/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewEncapsulation,
  DoCheck,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  ValidatorFn,
  NgForm,
  FormGroupDirective,
} from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { getCapacityQuantityRoot, getCapacityQuantityUnit, toFiniteOrNull } from 'src/app/util';
import { ErrorStateMatcher, mixinErrorState, CanUpdateErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import * as Long from 'long';
import { CapacityQuantityFormValue } from '../../models/capacity-quantity';

/**
 * @returns map of validation errors (nonNegativeInteger) if present, otherwise null.
 */
export const nonNegativeIntegerCapacityQuantityValidator: ValidatorFn = (control: FormControl) => {
  const { value } = (control.value || {}) as CapacityQuantityFormValue;
  if (value != null && !/^\s*\d*\s*$/.test(value.toString())) {
    return { nonNegativeInteger: true };
  }
  return null;
};

/** Mimic the Angular material error state implementation to play nice with the material stepper */
class CapacityQuantityComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-denylist, id-match
const _CapacityQuantityComponentMixinBase = mixinErrorState(CapacityQuantityComponentBase);

@Component({
  selector: 'app-capacity-quantity',
  templateUrl: './capacity-quantity.component.html',
  styleUrls: ['./capacity-quantity.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: CapacityQuantityComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CapacityQuantityComponent
  extends _CapacityQuantityComponentMixinBase
  implements
    ControlValueAccessor,
    MatFormFieldControl<CapacityQuantityFormValue>,
    DoCheck,
    OnInit,
    OnDestroy,
    CanUpdateErrorState
{
  private static nextId = 0;
  @Input() unitsByType: { [type: string]: string[] };
  private _previousUnitsByType: { [type: string]: string[] };

  @Input() unitAbbreviations?: { [unit: string]: string };

  @Input()
  get value(): CapacityQuantityFormValue {
    return this.getQuantity(this.form.value);
  }
  set value(obj: any) {
    this.writeValue(obj);
    this.stateChanges.next();
  }

  @HostBinding() id = `app-capacity-quantity-${CapacityQuantityComponent.nextId++}`;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  get empty(): boolean {
    return this.quantityValue.value == null;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  @HostBinding('class.selectable-unit')
  get selectableUnit(): boolean {
    return this.unitOptions && this.unitOptions.length > 0;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(req) {
    this._required = Boolean(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = Boolean(value);
    if (this._disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.stateChanges.next();
  }
  private _disabled = false;

  @HostBinding('attr.aria-describedby') describedBy = '';

  controlType = 'app-capacity-quantity';
  focused = false;
  readonly quantityValue: FormControl;
  readonly quantityTypeRoot: FormControl;
  readonly quantityTypeUnit: FormControl;
  stateChanges = new Subject<void>();
  get typeRoot(): string {
    return this.quantityTypeRoot.value;
  }
  get typeUnit(): string {
    return this.quantityTypeUnit.value;
  }
  unitOptions: string[];
  private readonly form: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onChange = (_value: any): void => {};
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onTouched = (): void => {};

  constructor(
    protected elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    fb: FormBuilder,
    private fm: FocusMonitor
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
    this.form = fb.group({
      value: (this.quantityValue = fb.control(null)),
      root: (this.quantityTypeRoot = fb.control(null)),
      unit: (this.quantityTypeUnit = fb.control(null)),
    });
    fm.monitor(elementRef.nativeElement, true).subscribe((origin) => {
      const focused = !!origin;
      if (!focused && this.focused && !this.disabled && !this.ngControl.touched) {
        this.onTouched();
      }
      this.focused = focused;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.quantityTypeRoot.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
        this.updateUnitOptions();
      }),
      this.form.valueChanges.subscribe((value) => {
        if (this.form.dirty) {
          this.onChange(this.getQuantity(value));
        }
      })
    );
  }

  ngDoCheck(): void {
    if (this.unitsByType !== this._previousUnitsByType) {
      this._previousUnitsByType = this.unitsByType;
      this.updateUnitOptions();
    }
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy(): void {
    this.fm.stopMonitoring(this.elementRef.nativeElement);
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
    this.stateChanges.complete();
  }

  writeValue(obj: CapacityQuantityFormValue): void {
    this.quantityValue.setValue(
      obj && obj.value != null ? Long.fromValue(obj.value).toNumber() : null,
      { emitEvent: false }
    );
    this.quantityTypeRoot.setValue(getCapacityQuantityRoot(obj && obj.type), { emitEvent: false });
    this.quantityTypeUnit.setValue(getCapacityQuantityUnit(obj && obj.type), { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elementRef.nativeElement.querySelector('input').focus();
    }
  }

  private createUnitOptions(typeRoot?: string): string[] {
    return this.unitsByType && this.unitsByType[typeRoot];
  }

  private getQuantity(value: {
    value?: number;
    root?: string;
    unit?: string;
  }): CapacityQuantityFormValue {
    return {
      type: value != null ? [value.root, value.unit].filter(Boolean).join('_') : null,
      value: value != null ? toFiniteOrNull(value.value) : null,
    };
  }

  private updateUnitOptions(): void {
    const typeRoot = this.quantityTypeRoot.value;
    this.unitOptions = this.createUnitOptions(typeRoot);
    if (
      this.quantityTypeUnit.value != null ||
      this.unitOptions == null ||
      !this.unitOptions.length
    ) {
      return;
    }

    // Default to the first unit option if defined
    const unit = this.unitOptions[0];
    if (unit != null) {
      this.quantityTypeUnit.setValue(unit, { emitEvent: false });
    }
  }
}
