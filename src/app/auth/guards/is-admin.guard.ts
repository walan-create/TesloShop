import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const IsAdminGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  //Usamos Router porque si la persona no es admin hay que redireccionar
  const router = inject(Router);

  // ¿Como hago yo para saber que ya pasó el proceso de autentificación?
  // 
  await firstValueFrom( authService.checkStatus() )

  return authService.isAdmin() // Deja acceder a la ruta dependiendo de el booleano que devuelva en base a si tiene rol admin
};
