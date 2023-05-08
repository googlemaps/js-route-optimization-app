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
  @Input() timezoneOffset = 0;
  @Input() globalDuration: [Long, Long];
  @Output() rangeOffsetChange = new EventEmitter<number>();

  currentOffsetDate: Date;
  globalStart: Date;
  globalEnd: Date;
  previousRangeOffset: number;
  nextRangeOffset: number;

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.globalDuration) {
      this.globalStart = this.getGlobalStart();
      this.globalEnd = this.getGlobalEnd();
    }

    if (changes.rangeOffset || changes.timezoneOffset) {
      this.currentOffsetDate = new Date((this.rangeOffset + this.timezoneOffset) * 1000);
      this.currentOffsetDate.setTime(
        this.currentOffsetDate.getTime() + this.currentOffsetDate.getTimezoneOffset() * 60 * 1000
      );

      const previousDate = new Date(this.currentOffsetDate);
      previousDate.setDate(previousDate.getDate() - 1);
      this.previousRangeOffset =
        this.globalStart.getTime() <= previousDate.getTime() ? previousDate.getTime() / 1000 : null;

      const nextDate = new Date(this.currentOffsetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      this.nextRangeOffset = nextDate.getTime() / 1000;
      this.nextRangeOffset =
        this.globalEnd.getTime() >= nextDate.getTime() ? nextDate.getTime() / 1000 : null;
    }
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const utcSeconds = (event.value.getTime() + event.value.getTimezoneOffset() * 60 * 1000) / 1000;
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

  getGlobalStart(): Date {
    const date = new Date((this.globalDuration[0].toNumber() + this.timezoneOffset) * 1000);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    return date;
  }

  getGlobalEnd(): Date {
    const date = new Date((this.globalDuration[1].toNumber() + this.timezoneOffset) * 1000);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    return date;
  }

  getFormattedRangeOffset(): string {
    return Number.isFinite(this.rangeOffset)
      ? formatDate((this.rangeOffset + this.timezoneOffset) * 1000, 'longDate', this.locale, 'UTC')
      : '';
  }
}
