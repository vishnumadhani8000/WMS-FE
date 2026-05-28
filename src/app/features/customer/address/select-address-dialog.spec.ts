import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAddressDialog } from './select-address-dialog';

describe('Address', () => {
  let component: SelectAddressDialog;
  let fixture: ComponentFixture<SelectAddressDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAddressDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectAddressDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
