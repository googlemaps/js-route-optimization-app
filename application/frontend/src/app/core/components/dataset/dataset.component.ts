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

  scenarioName = '';
  originalScenarioName = '';

  constructor(private store: Store, private detectRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.store.select(selectScenarioName).subscribe((value) => {
      this.scenarioName = value;
      this.originalScenarioName = value;
      this.updateInputSize();
      this.detectRef.markForCheck();
    });
  }

  updateInputSize(): void {
    this.resizeText.nativeElement.textContent = this.scenarioName;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.scenarioInput.nativeElement.blur();
      this.save();
    } else if (event.key === 'Escape') {
      this.reset();
      this.updateInputSize();
      this.scenarioInput.nativeElement.blur();
    }
  }

  reset(): void {
    this.scenarioName = this.originalScenarioName;
  }

  save(): void {
    this.store.dispatch(saveScenarioName({ scenarioName: this.scenarioName }));
  }
}
