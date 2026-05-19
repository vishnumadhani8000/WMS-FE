import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './customer-header.html',
  styleUrls: ['./customer-header.scss'],
})
export class CustomerHeader {
  mobileMenuOpen = signal(false);

  navItems: NavItem[] = [
    { label: 'Products',  icon: 'inventory_2',   route: '/customer/product' },
    { label: 'Cart',      icon: 'shopping_cart', route: '/customer/cart',   badge: 3 },
    { label: 'My Orders', icon: 'history',       route: '/orders' },
  ];

  toggleMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}