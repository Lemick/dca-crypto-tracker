import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return (control.value > Date.now()) ? {noFutureDateValidator: {value: control.value}} : null;
  };
}

export function numberPositiveValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return (control.value <= 0) ? {numberPositiveValidator: {value: control.value}} : null;
  };
}

