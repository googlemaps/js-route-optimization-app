import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MapSelection } from '../../models/map';

@Component({
  selector: 'app-multiselect-info-window',
  templateUrl: './multiselect-info-window.component.html',
  styleUrl: './multiselect-info-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectInfoWindowComponent implements OnChanges {
  @Input() selections: MapSelection[] = [];

  currentIndex: number = 0;
  currentSelection?: MapSelection;

  constructor(private detectorRef: ChangeDetectorRef) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.currentIndex = 0;
    this.currentSelection = this.selections[this.currentIndex];
    this.detectorRef.markForCheck();
  }

  previous(): void {
    this.currentIndex -= 1;
    this.currentSelection = this.selections[this.currentIndex];
    this.detectorRef.markForCheck();
  }

  next(): void {
    this.currentIndex += 1;
    this.currentSelection = this.selections[this.currentIndex];
    this.detectorRef.markForCheck();
  }
}
