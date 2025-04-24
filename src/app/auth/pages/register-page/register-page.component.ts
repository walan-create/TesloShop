import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { FormUtils } from 'src/utils/form-utils';

@Component({
  selector: 'register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {

  //--------------- Inyección de dependencias -------------------
  fb = inject(FormBuilder); // Inyecta el servicio FormBuilder para manejar formularios reactivos.
  hasError = signal<boolean>(false); // Señal para manejar el estado de error en el formulario.
  isPosting = signal<boolean>(false); // Señal para manejar el estado de carga (posting).
  router = inject(Router); // Inyecta el servicio Router para la navegación.
  authService = inject(AuthService); // Inyecta el servicio AuthService para manejar la autenticación.

  //--------------- Definición del formulario -------------------
  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]], // Campo de email con validaciones: requerido y formato de email.
    fullName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]], // Campo de contraseña con validaciones: requerido y longitud mínima de 6 caracteres.
    password2: ['', Validators.required],
  },
  {
    //Añadimos Validadores a nivel global del formulario
    validators: [FormUtils.isFieldOneEqualFieldTwo('password', 'password2')],
  });

  onSubmit() {
    // Verifica si el formulario es inválido.
    if (this.registerForm.invalid) {
      this.hasError.set(true); // Activa la señal de error.
      setTimeout(() => {
        this.hasError.set(false); // Desactiva la señal de error después de 2 segundos.
      }, 2000);
      return; // Detiene la ejecución si el formulario no es válido.
    }

    // Extrae los valores del formulario.
    const { email = '', password = '' , fullName = ''} = this.registerForm.value;

    // Llama al servicio de autenticación para iniciar sesión.
    this.authService
      .register(email!, password!, fullName!) // Llama al método `login` del servicio AuthService.
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/'); // Si la autenticación es exitosa, redirige al usuario a la página principal.
        } else {
          this.hasError.set(true); // Si falla, activa la señal de error.
          setTimeout(() => {
            this.hasError.set(false); // Desactiva la señal de error después de 2 segundos.
          }, 2000);
        }
        return;
      });
  }
}
