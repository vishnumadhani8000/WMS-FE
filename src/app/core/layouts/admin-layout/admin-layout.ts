import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { AdminHeader } from './components/admin-header/admin-header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebar,
    AdminHeader
  ]
})
export class AdminLayout {

  sidebarOpen = true;
  isMobile = false;

  constructor() {
    this.checkScreen();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }

  checkScreen() {
    this.isMobile = window.innerWidth <= 768;

    this.sidebarOpen = !this.isMobile;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}