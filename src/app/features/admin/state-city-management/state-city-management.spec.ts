import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateCityManagement } from './state-city-management';

describe('CityManagement', () => {
  let component: StateCityManagement;
  let fixture: ComponentFixture<StateCityManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateCityManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateCityManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
