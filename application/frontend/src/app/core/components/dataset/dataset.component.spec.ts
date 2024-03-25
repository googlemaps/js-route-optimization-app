import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetComponentComponent } from './dataset.component';
import { provideMockStore } from '@ngrx/store/testing';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';

describe('DatasetComponentComponent', () => {
  let component: DatasetComponentComponent;
  let fixture: ComponentFixture<DatasetComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasetComponentComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectScenarioName, value: '' }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
