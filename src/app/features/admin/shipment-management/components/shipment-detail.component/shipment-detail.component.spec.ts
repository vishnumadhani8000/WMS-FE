import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentDetailComponent } from './shipment-detail.component';

describe('ShipmentDetailComponent', () => {
  let component: ShipmentDetailComponent;
  let fixture: ComponentFixture<ShipmentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
