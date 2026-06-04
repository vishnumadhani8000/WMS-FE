import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentManagement } from './shipment-management';

describe('Shipment', () => {
  let component: ShipmentManagement;
  let fixture: ComponentFixture<ShipmentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
