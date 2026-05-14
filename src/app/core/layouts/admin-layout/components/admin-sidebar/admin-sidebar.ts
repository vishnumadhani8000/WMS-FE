import { Component, Input } from '@angular/core';
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
  @Input() isMobile = false;

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
      route: '/vehicle-management'
    },
    {
      title: 'Order Management',
      icon: 'shopping_cart',
      route: '/order-management'
    },
    {
      title: 'City Management',
      icon: 'location_city',
      route: '/city-management'
    },
    {
      title: 'Tracker',
      icon: 'track_changes',
      route: '/tracker'
    }
  ];
}