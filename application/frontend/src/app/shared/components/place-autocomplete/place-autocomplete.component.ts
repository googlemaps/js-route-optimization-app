/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';
import { ILatLng } from 'src/app/core/models';
import { isPlaceId, PlacesService } from 'src/app/core/services';
import { isLatLngString, stringToLatLng, toDispatcherLatLng } from 'src/app/util';

/** Mimic the Angular material error state implementation to play nice with the material stepper */
class PlaceAutocompleteComponentBase {
  stateChanges: Subject<void>;
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const _PlaceAutocompleteComponentBase = mixinErrorState(PlaceAutocompleteComponentBase);

@Component({
  selector: 'app-place-autocomplete',
  templateUrl: './place-autocomplete.component.html',
  styleUrls: ['./place-autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatFormFieldControl, useExisting: PlaceAutocompleteComponent }],
})
export class PlaceAutocompleteComponent
  extends _PlaceAutocompleteComponentBase
  implements
    DoCheck,
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    MatFormFieldControl<PlaceAutocompleteComponent>,
    CanUpdateErrorState
{
  private static nextId = 0;

  @HostBinding() id = `app-place-autocomplete-${PlaceAutocompleteComponent.nextId++}`;
  @ViewChild('input', { read: ElementRef, static: true }) searchEl: ElementRef<HTMLInputElement>;
  @Input() bounds: google.maps.LatLngBounds;
  private previousBounds: google.maps.LatLngBounds;

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
    return this.search.value === '';
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
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

  @Input()
  get value(): any {
    return this.getPlace();
  }
  set value(obj: any) {
    this.writeValue(obj);
    this.stateChanges.next();
  }

  @HostBinding('attr.aria-describedby') describedBy = '';

  controlType = 'app-place-autocomplete';
  focused = false;
  stateChanges = new Subject<void>();
  readonly form: UntypedFormGroup;
  readonly search: UntypedFormControl;
  private readonly location: UntypedFormControl;
  private readonly placeId: UntypedFormControl;
  private autocomplete: google.maps.places.Autocomplete;
  private subscription: Subscription;
  private autocompleteSelection = true;
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onChange = (_value: any): void => {};
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onTouched = (): void => {};

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    @Optional() @Self() ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    fb: UntypedFormBuilder,
    private placesService: PlacesService,
    private fm: FocusMonitor,
    private zone: NgZone
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
    this.form = fb.group({
      search: (this.search = fb.control('')),
      location: (this.location = fb.control(null)),
      placeId: (this.placeId = fb.control(null)),
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
    this.subscription = this.form.valueChanges.subscribe(() => {
      if (this.form.dirty) {
        this.onChange(this.getPlace());
      }
    });
    this.zone.runOutsideAngular(() => {
      this.searchEl.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          this.checkForPlaceIdOrLatLng(event);
        }
      });

      this.autocomplete = this.placesService.createAutocomplete(this.searchEl.nativeElement, {
        fields: ['geometry.location'],
        types: ['geocode', 'establishment'],
        strictBounds: false,
        bounds: this.bounds,
      });

      this.autocomplete.addListener('place_changed', () => {
        this.zone.run(() => {
          const placeResult = this.autocomplete.getPlace();
          const location = toDispatcherLatLng(placeResult?.geometry?.location);
          const search = this.searchEl.nativeElement.value;
          if (this.autocompleteSelection) {
            this.form.setValue({
              search: search || '',
              location: location || null,
              placeId: placeResult?.place_id || null,
            });
          }
          this.autocompleteSelection = true;
          // Ensure input title is updated
          this.changeDetector.markForCheck();
        });
      });
    });
  }

  checkForPlaceIdOrLatLng(event: KeyboardEvent): void {
    const value = this.searchEl.nativeElement.value;

    // if user enters a place ID, get the details
    if (isPlaceId(value)) {
      const placeId = (event.target as HTMLInputElement).value;
      this.placesService.getDetails(placeId).then((placeResult) => {
        this.form.setValue({
          search: placeResult.formatted_address,
          location: toDispatcherLatLng(placeResult.geometry?.location),
          placeId: placeResult.place_id,
        });

        this.searchEl.nativeElement.value = placeResult.formatted_address;
        this.autocompleteSelection = false;
        // Ensure input title is updated
        this.changeDetector.markForCheck();
      });

      return;
    }

    // if user enters a valid lat,lng pair, parse it
    if (isLatLngString(value)) {
      this.form.setValue({
        search: value,
        location: stringToLatLng(value),
        placeId: null,
      });
      this.autocompleteSelection = false;
      this.changeDetector.markForCheck();
    }
  }

  ngDoCheck(): void {
    if (this.previousBounds !== this.bounds) {
      this.previousBounds = this.bounds;
      if (this.autocomplete) {
        this.autocomplete.setBounds(this.bounds);
      }
    }
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy(): void {
    this.fm.stopMonitoring(this.elementRef.nativeElement);
    this.stateChanges.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
      google.maps.event.clearInstanceListeners(this.searchEl.nativeElement);
    }
  }

  writeValue(obj: ILatLng): void {
    if (!this.isEqual(obj, this.location.value)) {
      this.form.setValue(
        {
          search: '',
          location: obj != null ? obj : null,
          placeId: null,
        },
        { emitEvent: false }
      );

      // Ensure input title is updated
      this.changeDetector.markForCheck();
    }
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
      this.focus();
    }
  }

  focus(): void {
    this.elementRef.nativeElement.querySelector('input').focus();
  }

  getPlace(): any {
    return this.form.valid ? this.location.value : null;
  }

  private isEqual(a?: ILatLng, b?: ILatLng): boolean {
    if (a === b) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }
    return a.latitude === b.latitude && a.longitude === b.longitude;
  }
}
