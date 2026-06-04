import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

import { AuthService } from '../../../../../features/auth/services/auth.service';
import { APP_ROUTES } from '../../../../../shared/constants/app-routes.constants';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class AdminHeader {
constructor(  
    private readonly authService : AuthService,
    private readonly router :Router
){}
  @Output() toggleSidebar = new EventEmitter<void>();

  goToProfile(): void {
    this.router.navigate([
      `/admin/${APP_ROUTES.ADMIN.PROFILE}`,
    ]);
    
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