import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHeader } from './customer-header';

describe('CustomerHeader', () => {
  let component: CustomerHeader;
  let fixture: ComponentFixture<CustomerHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
