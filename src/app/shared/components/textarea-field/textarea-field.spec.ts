import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaField } from './textarea-field';

describe('TextareaField', () => {
  let component: TextareaField;
  let fixture: ComponentFixture<TextareaField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextareaField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
