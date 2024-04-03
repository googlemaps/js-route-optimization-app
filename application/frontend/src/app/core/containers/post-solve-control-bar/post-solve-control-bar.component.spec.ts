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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import * as fromUndoRedo from '../../selectors/undo-redo.selectors';
import { PostSolveControlBarComponent } from './post-solve-control-bar.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import Long from 'long';

@Component({
  selector: 'app-generate-button',
  template: '',
})
class MockGenerateButtonComponent {
  @Input() disabled = false;
}

@Component({
  selector: 'app-map-toggle-button',
  template: '',
})
class MockMapToggleButtonComponent {
  @Output() toggleMap = new EventEmitter<void>();
}

@Component({
  selector: 'app-time-navigation',
  template: '',
})
class MockTimeNavigationComponent {
  @Input() range: Range;
  @Input() previousRangeOffset: number;
  @Input() nextRangeOffset: number;
  @Input() timezoneOffset: number;
  @Input() globalDuration: [Long, Long];
  @Output() rangeOffsetChange = new EventEmitter<number>();
}

describe('PostSolveControlBarComponent', () => {
  let component: PostSolveControlBarComponent;
  let fixture: ComponentFixture<PostSolveControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, MaterialModule, RouterTestingModule],
      declarations: [
        MockGenerateButtonComponent,
        MockMapToggleButtonComponent,
        MockTimeNavigationComponent,
        PostSolveControlBarComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: fromUI.selectPage, value: null },
            { selector: RoutesChartSelectors.selectSelectedRange, value: [] },
            { selector: RoutesChartSelectors.selectRangeOffset, value: 0 },
            { selector: RoutesChartSelectors.selectNowRangeOffset, value: 0 },
            {
              selector: ShipmentModelSelectors.selectGlobalDuration,
              value: [Long.ZERO, Long.ZERO],
            },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: fromUndoRedo.selectCanUndo, value: false },
            { selector: fromUndoRedo.selectCanRedo, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(PostSolveControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
