import { Routes } from '@angular/router';
import { IsAdminGuard } from '@auth/guards/is-admin.guard';
import { NotAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [
      // () => { //Caso de ejemplo del cuerpo de un guard
      //   console.log('Hola Mundo');
      //   return false; // Si un guard devuelve falso, la ruta no se va a mostrar
      // },
      NotAuthenticatedGuard,
    ],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'),
    canMatch: [IsAdminGuard],
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes'),
  },
];
