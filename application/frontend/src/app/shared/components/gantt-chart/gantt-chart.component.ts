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

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
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
import { DOCUMENT } from '@angular/common';

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
  implements OnInit, OnChanges, AfterViewInit, AfterViewChecked, OnDestroy
{
  @ViewChild('headerOverlay') headerOverlay: ElementRef;
  @ViewChild('rowColumnHeader') rowColumnHeader: ElementRef;
  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewPort: CdkVirtualScrollViewport;
  @ViewChild('simulatorHandleContainer') simulatorHandleContainer: ElementRef;

  @Input() value: T[];
  @Input() range: number = day.ranges[day.defaultRangeIndex].value;
  @Input() marker?: number;
  @Input() unitStep: UnitStep = day.ranges[day.defaultRangeIndex].unitStep;
  @Input() timezoneOffset: number;
  @Input() travelSimulatorActive: boolean;
  @Input() travelSimulatorValue: number;
  @Input() columnLabelFormatter: ChartColumnLabelFormatter = day.columnLabelFormatter;
  @Input() trackBy: (index: number, item: T) => any = (index) => index;
  @Output() dragSimulatorHandle = new EventEmitter<number>();

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

  hasTravelSimulator = false;
  travelSimulatorPercent = 0;
  isDraggingSimulator = false;
  dragPosition: [number, number];

  columns: GanttColumn[] = [];
  viewPortWidth = 0;

  get inverseTranslation(): string {
    return this.viewPort ? -this.viewPort.getOffsetToRenderedContentStart() + 'px' : '0';
  }

  private onMouseMoveFn = this.onMouseMove.bind(this) as (event: MouseEvent) => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private domSanitizer: DomSanitizer,
    private zone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private service: RoutesChartService
  ) {}

  getMarkerElementLeft(el: HTMLElement): SafeStyle {
    const left = 'calc(' + this.markerPercent + '% - ' + el.clientWidth / 2 + 'px)';
    return this.domSanitizer.bypassSecurityTrustStyle(left);
  }

  getSimulatorHandleLeft(el: HTMLElement): SafeStyle {
    const left = 'calc(' + this.travelSimulatorPercent + '% - ' + el.clientWidth / 2 + 'px)';
    return this.domSanitizer.bypassSecurityTrustStyle(left);
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('mousemove', this.onMouseMoveFn);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.marker || changes.range) {
      this.hasMarker = this.marker != null && this.marker >= 0 && this.marker <= this.range;
      this.markerPercent = this.hasMarker ? (100 * this.marker) / this.range : 0;
    }
    if (changes.travelSimulatorActive || changes.travelSimulatorValue || changes.range) {
      this.hasTravelSimulator =
        this.travelSimulatorActive &&
        this.travelSimulatorValue != null &&
        this.travelSimulatorValue >= 0 &&
        this.travelSimulatorValue <= this.range;
      this.travelSimulatorPercent = this.hasTravelSimulator
        ? (100 * this.travelSimulatorValue) / this.range
        : 0;
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
          this.viewPort.checkViewportSize();
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
    this.document.removeEventListener('mousemove', this.onMouseMoveFn);
  }

  onSimulatorMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }
    this.isDraggingSimulator = true;
    this.dragPosition = [event.x, event.y];
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(_event: MouseEvent): void {
    this.isDraggingSimulator = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDraggingSimulator) {
      return;
    }

    const bounds: DOMRect = this.simulatorHandleContainer.nativeElement.getBoundingClientRect();
    const relativeX = event.x - bounds.left;

    if (relativeX < 0 || relativeX > bounds.width) {
      return;
    }

    this.zone.run(() => {
      this.dragSimulatorHandle.emit((relativeX / bounds.width) * this.range);
    });
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
