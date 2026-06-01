import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ]
})
export class AdminSidebar {

  @Input() isOpen = true;
  @Input() isMobile : boolean = false;
  @Output() sidebarClose = new EventEmitter<void>();  
  menus = [
    {
      title: 'Driver Management',
      icon: 'local_shipping',
      route: '/admin/driver-management' 
    },
    {
      title: 'Product Management',
      icon: 'inventory_2', 
      route: '/admin/product-management'
    },
    {
      title: 'Vehicle Management',
      icon: 'directions_car',
      route: '/admin/vehicle-management'
    },
    {
      title: 'Order Management',
      icon: 'shopping_cart',
      route: '/admin/order-management'
    },
    {
      title: 'Destination Management',
      icon: 'location_city',
      route: '/admin/destination-management'
    },
    {
      title: 'Tracker',
      icon: 'track_changes',
      route: '/tracker'
    }
  ];

  closeSidebar() {
    this.sidebarClose.emit();
  }
}