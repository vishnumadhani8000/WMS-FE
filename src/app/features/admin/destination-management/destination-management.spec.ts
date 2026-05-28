import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationManagement } from './destination-management';

describe('CityManagement', () => {
  let component: DestinationManagement;
  let fixture: ComponentFixture<DestinationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
