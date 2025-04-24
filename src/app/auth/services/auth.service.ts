import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

// Definimos un tipo para representar los posibles estados de autenticación
type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
// Base URL para las solicitudes HTTP
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {

  //--------------- Señales y estado reactivo -------------------
  private _authStatus = signal<AuthStatus>('checking'); // Estado de autenticación
  private _user = signal<User | null>(null); // Datos del usuario autenticado
  private _token = signal<string | null>(localStorage.getItem('token')); // Token de autenticación

  // Inyección del servicio HttpClient para realizar solicitudes HTTP
  private http = inject(HttpClient);

  //--------------- Recursos y computados -------------------
  // Recurso para verificar el estado de autenticación al montar el servicio
  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  });

  // Computed para obtener el estado de autenticación de forma reactiva
  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';
    if (this._user()) return 'authenticated';
    return 'not-authenticated';
  });

  // Computed para obtener los datos del usuario de forma reactiva
  user = computed<User | null>(() => this._user());

  // Computed para obtener el token de forma reactiva
  token = computed<string | null>(() => this._token());

  //--------------- Métodos principales -------------------

  // Método para iniciar sesión
  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/login`, {
        email: email,
        password: password,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)), // Manejo de éxito
        catchError((error: any) => this.handleAuthError(error)) // Manejo de errores
      );
  }

  // Método para registrar un nuevo usuario
  register(email: string, password: string, fullName: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/register`, {
        email: email,
        password: password,
        fullName: fullName,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)), // Manejo de éxito
        catchError((error: any) => this.handleAuthError(error)) // Manejo de errores
      );
  }

  // Método para verificar el estado de autenticación
  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }
    return this.http
      .get<AuthResponse>(`${baseUrl}/auth/check-status`)
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)), // Manejo de éxito
        catchError((error: any) => this.handleAuthError(error)) // Manejo de errores
      );
  }

  // Método para cerrar sesión
  logout() {
    this._user.set(null); // Limpia los datos del usuario
    this._token.set(null); // Limpia el token
    this._authStatus.set('not-authenticated'); // Cambia el estado a no autenticado
    // localStorage.removeItem('token'); // Opcional: elimina el token del almacenamiento local
  }

  //--------------- Métodos privados -------------------

  // Manejo de éxito en las solicitudes de autenticación
  private handleAuthSuccess(resp: AuthResponse) {
    this._user.set(resp.user); // Guarda los datos del usuario
    this._authStatus.set('authenticated'); // Cambia el estado a autenticado
    this._token.set(resp.token); // Guarda el token
    localStorage.setItem('token', resp.token); // Persiste el token en el almacenamiento local
    return true;
  }

  // Manejo de errores en las solicitudes de autenticación
  private handleAuthError(error: any) {
    this.logout(); // Limpia el estado en caso de error
    return of(false); // Devuelve `false` como resultado
  }
}
