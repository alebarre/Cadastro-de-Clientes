import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de política de senha.
 * Regras padrão:
 * - mínimo de 8 caracteres
 * - ao menos 1 maiúscula, 1 minúscula, 1 dígito e 1 especial
 *
 * @param min tamanho mínimo (default 8)
 */
export function passwordPolicyValidator(min: number = 8): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value || '';
    const errors: string[] = [];

    if (v.length < min) errors.push(`mínimo de caracteres: ${min}`);
    if (!/[A-Z]/.test(v)) errors.push('1 maiúscula');
    if (!/[a-z]/.test(v)) errors.push('1 minúscula');
    if (!/\d/.test(v)) errors.push('1 dígito');
    if (!/[^A-Za-z0-9]/.test(v)) errors.push('1 especial');

    return errors.length ? { policy: errors.join(' | ') } : null;
  };
}

/**
 * Função utilitária para gerar feedback textual de política de senha
 * sem precisar de FormControl (ex: ForgotComponent).
 */
export function passwordPolicyText(value: string, min: number = 8): string | null {
  const errors: string[] = [];

  if (!value || value.length < min) errors.push(`mín. ${min}`);
  if (!/[A-Z]/.test(value)) errors.push('1 maiúscula');
  if (!/[a-z]/.test(value)) errors.push('1 minúscula');
  if (!/\d/.test(value)) errors.push('1 dígito');
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('1 especial');

  return errors.length ? errors.join(' | ') : null;
}
