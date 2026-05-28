import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverManagement } from './driver-management';

describe('DriverManagement', () => {
  let component: DriverManagement;
  let fixture: ComponentFixture<DriverManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
