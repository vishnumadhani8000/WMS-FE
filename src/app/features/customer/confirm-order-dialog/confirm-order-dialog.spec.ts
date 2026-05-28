import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOrderDialog } from './confirm-order-dialog';

describe('ConfirmOrderDialog', () => {
  let component: ConfirmOrderDialog;
  let fixture: ComponentFixture<ConfirmOrderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmOrderDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmOrderDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
