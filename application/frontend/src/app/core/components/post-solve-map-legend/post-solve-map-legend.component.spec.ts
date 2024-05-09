import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSolveMapLegendComponent } from './post-solve-map-legend.component';

describe('PostSolveMapLegendComponent', () => {
  let component: PostSolveMapLegendComponent;
  let fixture: ComponentFixture<PostSolveMapLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostSolveMapLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostSolveMapLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
