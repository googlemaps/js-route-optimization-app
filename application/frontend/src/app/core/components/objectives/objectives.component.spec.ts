import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectivesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObjectivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
