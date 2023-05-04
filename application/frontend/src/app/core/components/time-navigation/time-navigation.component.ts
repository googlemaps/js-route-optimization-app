/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Range } from 'src/app/shared/models';

@Component({
  selector: 'app-time-navigation',
  templateUrl: './time-navigation.component.html',
  styleUrls: ['./time-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TimeNavigationComponent implements OnChanges {
  @Input() range: Range;
  @Input() rangeOffset: number;
  @Input() nowRangeOffset: number;
  @Input() previousRangeOffset: number;
  @Input() nextRangeOffset: number;
  @Input() timezoneOffset = 0;
  @Output() rangeOffsetChange = new EventEmitter<number>();

  currentOffsetDate: Date;

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.rangeOffset || changes.timezoneOffset) {
      this.currentOffsetDate = new Date((this.rangeOffset + this.timezoneOffset) * 1000);
      this.currentOffsetDate.setTime(this.currentOffsetDate.getTime() + (this.currentOffsetDate.getTimezoneOffset() * 60 * 1000));
    }
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const utcSeconds = (event.value.getTime() + (event.value.getTimezoneOffset() * 60) * 1000) / 1000;
    this.rangeOffsetChange.emit(utcSeconds + this.timezoneOffset);
  }

  onNextClick(): void {
    this.rangeOffsetChange.emit(this.nextRangeOffset);
  }

  onPreviousClick(): void {
    this.rangeOffsetChange.emit(this.previousRangeOffset);
  }

  onNowClick(): void {
    this.rangeOffsetChange.emit(this.nowRangeOffset);
  }

  getFormattedRangeOffset(): string {
    return Number.isFinite(this.rangeOffset)
      ? formatDate((this.rangeOffset + this.timezoneOffset) * 1000, 'longDate', this.locale, 'UTC')
      : '';
  }
}
