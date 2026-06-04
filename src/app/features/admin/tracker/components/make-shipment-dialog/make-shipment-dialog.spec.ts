import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeShipmentDialog } from './make-shipment-dialog';

describe('MakeShipmentDialog', () => {
  let component: MakeShipmentDialog;
  let fixture: ComponentFixture<MakeShipmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeShipmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeShipmentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
