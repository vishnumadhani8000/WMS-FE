  import { Component, destroyPlatform, inject } from '@angular/core';
  import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
  } from '@angular/forms';
  import { InputField } from './shared/components/input-field/input-field';
  import { CommonModule } from '@angular/common';
  import { Button } from "./shared/components/button/button";
  import { SelectField } from './shared/components/select-field/select-field';
import { TextareaField } from './shared/components/textarea-field/textarea-field';


  @Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.html',
    imports: [
      CommonModule,
      ReactiveFormsModule,
      InputField,
      Button,
      SelectField,
      TextareaField
  ]
  })
  export class App {

    private fb = inject(FormBuilder);

    loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required , Validators.minLength(6)]],
      role : ['', Validators.required],
      description : ['', Validators.required]
    });
    
    


    roles = [
      {
        label: 'Admin',
        value: 'admin'
      },
      {
        label: 'User',
        value: 'user'
      },
      {
        label: 'Manager',
        value: 'manager'
      }
    ];
  isSubmitting: any;
  submit(): void {

    if (this.loginForm.invalid) {
  
      this.loginForm.markAllAsTouched();
  
      return;
    }
  
    console.log(this.loginForm.value);
  }

  }