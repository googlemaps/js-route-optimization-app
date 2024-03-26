import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';
import { saveScenarioName } from '../../actions/dispatcher.actions';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetComponent implements AfterViewInit {
  @ViewChild('scenarioInput') scenarioInput: ElementRef;
  @ViewChild('resizeText') resizeText: ElementRef;
  scenarioName: string;

  constructor(private store: Store, private detectRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.store.select(selectScenarioName).subscribe((value) => {
      this.scenarioName = value;
      this.updateInputSize();
      this.detectRef.markForCheck();
    });
  }

  updateInputSize(): void {
    // this.scenarioInput.nativeElement.size = this.scenarioName.length || 1;
    this.resizeText.nativeElement.textContent = this.scenarioName;
  }

  onSave(): void {
    this.store.dispatch(saveScenarioName({ scenarioName: this.scenarioName }));
  }
}
