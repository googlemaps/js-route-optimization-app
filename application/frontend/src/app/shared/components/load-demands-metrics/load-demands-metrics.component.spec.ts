import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDemandsMetricsComponent } from './load-demands-metrics.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

describe('LoadDemandsMetricsComponent', () => {
  let component: LoadDemandsMetricsComponent;
  let fixture: ComponentFixture<LoadDemandsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [LoadDemandsMetricsComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            kpis: {
              shipmentKpis: {
                total: 1,
                selected: 1,
                demands: [
                  {
                    selected: 10,
                    total: 20,
                    type: 'weight',
                  },
                  {
                    selected: 5,
                    total: 5,
                    type: 'volume',
                  },
                ],
                pickups: 1,
                deliveries: 1,
                dwellTime: 1,
              },
              vehicleKpis: {
                total: 1,
                selected: 1,
                capacities: [
                  {
                    selected: 20,
                    total: 20,
                    type: 'weight',
                  },
                  {
                    selected: 10,
                    total: 15,
                    type: 'volume',
                  },
                ],
              },
            },
          },
        },
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(LoadDemandsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse KPIs object into an array', () => {
    expect(component.kpiData).toEqual([
      {
        demand: 10,
        capacity: 20,
        type: 'weight',
      },
      {
        demand: 5,
        capacity: 10,
        type: 'volume',
      },
    ]);
  });
});
