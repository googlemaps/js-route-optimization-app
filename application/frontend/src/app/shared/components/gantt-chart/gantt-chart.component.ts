/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { RoutesChartService } from 'src/app/core/services/routes-chart.service';
import {
  GanttColumnHeaderDirective,
  GanttColumnHeadersOverlayDirective,
  GanttRowColumnHeaderDirective,
  GanttRowDirective,
} from '../../directives';
import { ChartColumnLabelFormatter, day, UnitStep } from '../../models';

interface GanttColumn {
  label: string;
}

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GanttChartComponent<T = any>
  implements OnChanges, AfterViewInit, AfterViewChecked, OnDestroy
{
  @Input() value: T[];
  @Input() range: number = day.ranges[day.defaultRangeIndex].value;
  @Input() marker?: number;
  @Input() unitStep: UnitStep = day.ranges[day.defaultRangeIndex].unitStep;
  @Input() timezoneOffset: number;

  @ContentChild(GanttColumnHeaderDirective, { static: true })
  columnHeaderDir: GanttColumnHeaderDirective;
  @ContentChild(GanttColumnHeadersOverlayDirective, { static: true })
  columnHeadersOverlayDir: GanttColumnHeadersOverlayDirective;
  @ContentChild(GanttRowColumnHeaderDirective, { static: true })
  rowColumnHeaderDir: GanttRowColumnHeaderDirective;
  @ContentChild(GanttRowDirective, { static: true }) rowDir: GanttRowDirective;

  get columnHeaderTemplate(): TemplateRef<any> {
    return this.columnHeaderDir?.template;
  }

  get columnHeadersOverlayTemplate(): TemplateRef<any> {
    return this.columnHeadersOverlayDir?.template;
  }

  get rowColumnHeaderTemplate(): TemplateRef<any> {
    return this.rowColumnHeaderDir?.template;
  }

  get rowTemplate(): TemplateRef<any> {
    return this.rowDir?.template;
  }

  private initialized = false;
  private resizeObserver: ResizeObserver;

  hasMarker = false;
  markerPercent = 0;
  columns: GanttColumn[] = [];
  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewPort: CdkVirtualScrollViewport;
  viewPortWidth = 0;
  @ViewChild('headerOverlay') headerOverlay: ElementRef;
  @ViewChild('rowColumnHeader') rowColumnHeader: ElementRef;

  get inverseTranslation(): string {
    return this.viewPort ? -this.viewPort.getOffsetToRenderedContentStart() + 'px' : '0';
  }

  @Input() columnLabelFormatter: ChartColumnLabelFormatter = day.columnLabelFormatter;
  @Input() trackBy: (index: number, item: T) => any = (index) => index;

  constructor(
    private domSanitizer: DomSanitizer,
    private zone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private service: RoutesChartService
  ) {}

  getMarkerElementLeft(el: HTMLElement): SafeStyle {
    const left = 'calc(' + this.markerPercent + '% - ' + el.clientWidth / 2 + 'px)';
    return this.domSanitizer.bypassSecurityTrustStyle(left);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.marker || changes.range) {
      this.hasMarker = this.marker != null && this.marker >= 0 && this.marker <= this.range;
      this.markerPercent = this.hasMarker ? (100 * this.marker) / this.range : 0;
    }
    if ((changes.range || changes.unitStep || changes.columnLabelFormatter) && this.initialized) {
      this.columns = this.getColumns();
    }
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.columns = this.getColumns();
    this.resizeObserver = new ResizeObserver((entries) => {
      if (entries.length) {
        this.zone.run(() => {
          this.viewPortWidth = entries[0].target.clientWidth;
          this.changeDetector.markForCheck();
        });
      }
    });
    this.resizeObserver.observe(this.viewPort.getElementRef().nativeElement);
  }

  ngAfterViewChecked(): void {
    this.calculateDimensions();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private calculateDimensions(): void {
    const scrollElement = this.viewPort.elementRef.nativeElement;
    const scrollBounds = scrollElement.getBoundingClientRect();
    const headerBounds = this.headerOverlay.nativeElement.getBoundingClientRect();
    const rowHeaderBounds = this.rowColumnHeader.nativeElement.getBoundingClientRect();

    this.service.scrollDimensions = {
      top: scrollBounds.y + headerBounds.height,
      bottom: scrollBounds.y - scrollElement.offsetTop + headerBounds.height + scrollBounds.height,
      left: scrollBounds.x + rowHeaderBounds.width,
      right: scrollBounds.right,
    };

    this.service.scrollContainer = this.viewPort;
  }

  private getColumns(): GanttColumn[] {
    if (!(this.range > 0 && this.unitStep && this.unitStep.value > 0)) {
      return [];
    }
    const columns = [];
    const unitStep = this.unitStep.value;
    const columnCount = Math.ceil(this.range / unitStep);
    for (let i = 0; i < columnCount; i++) {
      const labelStart = this.columnLabelFormatter(i, [
        i * unitStep + this.timezoneOffset,
        (i + 1) * unitStep - 1 + this.timezoneOffset,
      ]);
      const labelEnd = this.columnLabelFormatter(i + 1, [
        (i + 1) * unitStep - 1 + this.timezoneOffset,
        (i + 2) * unitStep - 1 + this.timezoneOffset,
      ]);
      columns.push({
        label: `${labelStart} - ${labelEnd}`,
      });
    }
    return columns;
  }
}
