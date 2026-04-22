import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDistanceMatrixDialogComponent } from './download-distance-matrix-dialog.component';

describe('DownloadDistanceMatrixDialogComponent', () => {
  let component: DownloadDistanceMatrixDialogComponent;
  let fixture: ComponentFixture<DownloadDistanceMatrixDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadDistanceMatrixDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadDistanceMatrixDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
