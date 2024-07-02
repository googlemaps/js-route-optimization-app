import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDemandsMetricsComponent } from './load-demands-metrics.component';

describe('LoadDemandsMetricsComponent', () => {
  let component: LoadDemandsMetricsComponent;
  let fixture: ComponentFixture<LoadDemandsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadDemandsMetricsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadDemandsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
