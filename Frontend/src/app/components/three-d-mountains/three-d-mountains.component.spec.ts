import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDMountainsComponent } from './three-d-mountains.component';

describe('ThreeDMountainsComponent', () => {
  let component: ThreeDMountainsComponent;
  let fixture: ComponentFixture<ThreeDMountainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeDMountainsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeDMountainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
