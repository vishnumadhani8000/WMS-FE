import { inject } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn,Router,} from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const roleGuard: CanActivateFn = ( route: ActivatedRouteSnapshot,) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const expectedRole = route.data['role'];
    const currentRole = authService.getUserRole();

    if (currentRole === expectedRole) {
        return true;
    }

    router.navigate(['/auth/login']);

    return false;
};