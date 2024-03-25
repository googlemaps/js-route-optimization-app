import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetComponentComponent } from './dataset.component';

describe('DatasetComponentComponent', () => {
  let component: DatasetComponentComponent;
  let fixture: ComponentFixture<DatasetComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasetComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
