import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { APP_ROUTES } from '../../../../shared/constants/app-routes.constants';

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
  constructor(  private readonly authService: AuthService,
    private readonly router: Router){}
  mobileMenuOpen = signal(false);

  navItems: NavItem[] = [
    { label: 'Products',  icon: 'inventory_2',   route: '/customer/product' },
    { label: 'Cart',      icon: 'shopping_cart', route: '/customer/cart'},
    { label: 'My Orders', icon: 'history',       route: '/customer/my-orders' },
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
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate([
          `/${APP_ROUTES.AUTH.LOGIN}`,
        ]);
      },
      error: () => {
        this.router.navigate([
          `/${APP_ROUTES.AUTH.LOGIN}`,
        ]);
      },
    });
  }

}