import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.scss'],
  imports: [
    MatIconModule,
    MatButtonModule
  ]
})
export class AdminHeader {

  @Output() toggleSidebar = new EventEmitter<void>();

}