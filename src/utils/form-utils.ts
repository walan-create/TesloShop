import { AbstractControl, FormArray, FormGroup, ValidationErrors } from "@angular/forms";

//Esta funcion va a simular el proceso que podria ser llegar a nuestro backend, recibir la respuesta, etc.
async function sleep() {
  return new Promise( resolve => {
    setTimeout(() => {
      resolve(true)
    }, 2500);
  })
}

// Clase para usar metodos estáticos (sin inyección de dependencia mediante service)
export class FormUtils {

  // Expresiones regulares para validar elementos
  static namePattern = '([a-zA-Z]+) ([a-zA-Z]+)';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';

  // Verifica si un campo específico dentro de un FormArray es válido.
  static isValidField( form: FormGroup, fieldName: string): boolean | null {
    return (
      !!form.controls[fieldName].errors && form.controls[fieldName].touched
    );
  }

  // Obtiene el mensaje de error asociado a un campo específico de un FormGroup.
  static getFieldError( form: FormGroup, fieldName: string ): string | null {

    if ( !form.controls[fieldName] ) return null;
    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  //Verifica si un campo específico de un formulario reactivo (FormGroup) es válido.
  static isValidFieldInArray( formArray: FormArray, pos:number): boolean | null {
    return (
      !!formArray.controls[pos].errors && formArray.controls[pos].touched
    );
  }

  // Obtiene el mensaje de error asociado a un campo específico de un ArrayGroup.
  static getFieldErrorInArray( formArray: FormArray, pos: number ): string | null {

    if ( formArray.controls.length === 0 ) return null;
    const errors = formArray.controls[pos].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static getTextError(errors : ValidationErrors) {
    for ( const key of Object.keys(errors) ) {
      switch(key) {
        case 'required':
          return 'Este campo es requerido';
        //----------------------------------
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres.`;
        //----------------------------------
        case 'min':
          return `Valor mínimo de ${errors['min'].min}.`;
        //----------------------------------
        case 'email':
          return `El valor ingresado no es un correo electronico.`;
        //----------------------------------
        case 'emailTaken':
          return 'El correo elecctrónico ya está siendo usado por otro usuario';
          //----------------------------------
        case 'noStrider':
          return 'El nombre "Strider" no está permitido'
         //----------------------------------
        case 'pattern':
          if (errors['pattern'].requiredPattern === FormUtils.emailPattern) {
            return 'El correo electrónico no luce como un correo electronico';
          }
        return 'Error de patrón contra expresión regular';
        //----------------------------------
        default:
          return `Error de validación no controlado ${key}`;
      }
    }
      return null;
  }

  //Verifica que 2 campos de un formulario sean iguales
  static isFieldOneEqualFieldTwo(field1: string, field2: string) {
    //Creamos la funcion a regresar
    return (formGroup: AbstractControl) => {
      const field1Value = formGroup.get(field1)?.value;
      const field2Value = formGroup.get(field2)?.value;

      return field1Value === field2Value ? null : { passwordsNotEqual: true };
    };
  }

  // Validación personalizada asíncrona
  static async checkingServerResponse(control: AbstractControl): Promise<ValidationErrors | null> {

    await sleep(); //2 segundo y medio

    const formValue = control.value; // Tomamos el valor del formulario

    //'hola@mundo.com' simula la busqueda de un correo en el backend
    if (formValue === 'hola@mundo.com') {
      return {
        emailTaken: true, // El correo ya existe en la BD
      };
    }

    return null;
  }

  //Validación personalizada random
  static async notStrider(control: AbstractControl): Promise<ValidationErrors | null> {
    await sleep(); //2 segundo y medio

    const formValue = control.value;

    return formValue === 'Strider' ? {noStrider: true} : null;
  }



  
}
