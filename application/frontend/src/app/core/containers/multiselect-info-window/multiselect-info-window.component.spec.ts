import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectInfoWindowComponent } from './multiselect-info-window.component';

describe('MultiselectInfoWindowComponent', () => {
  let component: MultiselectInfoWindowComponent;
  let fixture: ComponentFixture<MultiselectInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectInfoWindowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectInfoWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
