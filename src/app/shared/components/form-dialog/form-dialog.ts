import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

import { ButtonConfig } from '../button/button.config';
import { Button } from "../button/button";


@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDividerModule,
    Button
],
  templateUrl: './form-dialog.html',
  styleUrls: ['./form-dialog.scss']
})
export class FormDialog {
  @Input({ required: true }) title: string;
  @Input({ required: true }) subtitle: string;

  @Input({ required: true }) closeButtonConfig: ButtonConfig;
  @Input({ required: true }) cancelButtonConfig: ButtonConfig;
  @Input({ required: true }) submitButtonConfig: ButtonConfig;

}