import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';
import { saveScenarioName } from '../../actions/dispatcher.actions';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetComponentComponent implements OnInit {
  scenarioName: string;

  constructor(private store: Store, private detectRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.store.select(selectScenarioName).subscribe((value) => {
      this.scenarioName = value;
      this.detectRef.markForCheck();
    });
  }

  onSave(): void {
    this.store.dispatch(saveScenarioName({ scenarioName: this.scenarioName }));
  }
}
