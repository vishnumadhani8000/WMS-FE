import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDialogComponent } from './driver-dialog.component';

describe('DriverDialogComponent', () => {
  let component: DriverDialogComponent;
  let fixture: ComponentFixture<DriverDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
