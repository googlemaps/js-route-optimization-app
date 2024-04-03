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

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Renderer2,
  RendererFactory2,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import * as noUiSlider from 'nouislider';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RangeSliderTooltip, RangeSliderConnect } from '../../models';

/**
 * Range slider that supports multiple handles
 *
 * @remarks
 * Relatively minimalist, purpose-built wrapper around noUiSlider.
 * If Angular Material or better supported Angular slider component
 * were to become available, this should be swapped out in its favor.
 */
@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent
  implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  @Input() min = 0;
  @Input() max = 1;
  @Input() step: number;
  @Input() start: number | number[] = [0, 1];
  @Input() tooltips?: RangeSliderTooltip[];
  @Input() connect?: RangeSliderConnect | RangeSliderConnect[];
  @Input() disabled = false;
  @Output() handleActivate = new EventEmitter<void>();
  @Output() handleRelease = new EventEmitter<void>();
  @Output() handleMove = new EventEmitter<void>();
  @ViewChild('slider', { read: ElementRef, static: true }) sliderEl: ElementRef<HTMLElement>;
  private readonly renderer: Renderer2;
  private controlDisabled = false;
  private slider: noUiSlider.noUiSlider;
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onChange = (_value: any): void => {};
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  private onTouched = (): void => {};

  constructor(rendererFactory: RendererFactory2, private zone: NgZone) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.updateDisabled();
    }
    if (
      changes.max ||
      changes.min ||
      changes.step ||
      changes.tooltips ||
      changes.connect ||
      changes.start.firstChange
    ) {
      this.configureSlider();
    }
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.slider = noUiSlider.create(this.sliderEl.nativeElement, this.createOptions());
      this.configureSlider();
    });
  }

  ngOnDestroy(): void {
    if (this.slider) {
      this.slider.destroy();
    }
  }

  writeValue(obj: number[]): void {
    if (this.slider && Array.isArray(obj)) {
      this.slider.set(obj);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.controlDisabled = isDisabled;
    this.updateDisabled();
  }

  private configureSlider(): void {
    if (this.slider) {
      this.updateDisabled();

      this.slider.updateOptions(this.createOptions());
      this.slider.off('start.handleActivate');
      this.slider.on('start.handleActivate', () => this.zone.run(() => this.handleActivate.emit()));
      this.slider.off('slide.handleMove');
      this.slider.on('slide.handleMove', () => this.zone.run(() => this.handleMove.emit()));
      this.slider.off('end.handleRelease');
      this.slider.on('end.handleRelease', () => this.zone.run(() => this.handleRelease.emit()));
      this.slider.off('start.onTouched');
      this.slider.on('start.onTouched', () => this.zone.run(() => this.onTouched()));
      this.slider.off('slide.onChange');
      this.slider.on('slide.onChange', (e) => this.zone.run(() => this.onChange(e)));

      this.configureDynamicTooltipPositions();
    }
  }

  private updateDisabled(): void {
    if (this.slider) {
      if (this.disabled || this.controlDisabled) {
        this.sliderEl.nativeElement.setAttribute('disabled', 'true');
      } else {
        this.sliderEl.nativeElement.removeAttribute('disabled');
      }
    }
  }

  private createOptions(): noUiSlider.Options {
    return {
      start: this.start != null ? this.start : [0, 1],
      range: { min: this.min, max: this.max },
      step: Number.isFinite(this.step) ? this.step : null,
      connect: this.connect == null ? true : (this.connect as any),
      tooltips: this.tooltips,
      animate: false,
    };
  }

  private configureDynamicTooltipPositions(): void {
    this.slider.off('end.tooltip-position');
    this.slider.off('update.tooltip-position');
    const tooltipEls = this.sliderEl.nativeElement.querySelectorAll('.noUi-tooltip');
    const touchAreaEls = this.sliderEl.nativeElement.querySelectorAll('.noUi-touch-area');
    if (tooltipEls.length === 2 && touchAreaEls.length === 2) {
      this.slider.on('end.tooltip-position', () =>
        this.calculateTooltipPositions(tooltipEls, touchAreaEls)
      );
      this.slider.on('update.tooltip-position', () =>
        this.calculateTooltipPositions(tooltipEls, touchAreaEls)
      );
    }
  }

  private calculateTooltipPositions(
    tooltipEls: NodeListOf<Element>,
    touchAreaEls: NodeListOf<Element>
  ): void {
    const firstTooltipEl = tooltipEls[0];
    const secondTooltipEl = tooltipEls[1];
    const firstRect = firstTooltipEl.getClientRects()[0];
    const secondRect = secondTooltipEl.getClientRects()[0];
    const firstTouchRect = touchAreaEls[0].getClientRects()[0];
    const secondTouchRect = touchAreaEls[1].getClientRects()[0];
    if (
      firstTouchRect &&
      secondTouchRect &&
      firstRect &&
      secondRect &&
      firstTouchRect.left &&
      secondTouchRect.left &&
      firstRect.width &&
      secondRect.width &&
      secondTouchRect.left - firstTouchRect.left <= firstRect.width / 2 + secondRect.width / 2
    ) {
      this.renderer.addClass(firstTooltipEl, 'first-tooltip-shift');
      this.renderer.addClass(secondTooltipEl, 'second-tooltip-shift');
    } else {
      this.renderer.removeClass(firstTooltipEl, 'first-tooltip-shift');
      this.renderer.removeClass(secondTooltipEl, 'second-tooltip-shift');
    }
  }
}
