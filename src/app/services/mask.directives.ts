import { Directive, HostListener, Input, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgControl } from '@angular/forms';

type MaskType = 'phoneBr' | 'cpf' | 'cep' | 'cnpj';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective implements OnInit {
  /** Tipo de máscara pronta (phoneBr/cpf/cep/cnpj) OU padrão com '9' como dígito (ex: "(99) 9999-9999") */
  @Input('appMask') mask?: MaskType | string;

  /** Se true, o valor salvo no FormControl será só os dígitos (ex.: "11988887777"). Default: true */
  @Input() maskSaveRaw: boolean = true;

  private lastMasked = '';

  constructor(private el: ElementRef<HTMLInputElement>, private ngControl: NgControl) {}

  ngOnInit(): void {
    // melhora teclado no mobile
    this.el.nativeElement.setAttribute('inputmode', 'numeric');
    this.el.nativeElement.setAttribute('autocomplete', 'off');
  }

  @HostListener('input', ['$event'])
  onInput(e: Event) {
    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '');
    const masked = this.applyMask(digits);
    const selEnd = masked.length;

    // atualiza o que o usuário vê
    input.value = masked;
    this.lastMasked = masked;

    // salva no FormControl: raw (só dígitos) ou masked
    const valueToSet = this.maskSaveRaw ? digits : masked;
    const ctrl = this.ngControl?.control;
    if (ctrl) {
      // evita loop de eventos
      ctrl.setValue(valueToSet, { emitEvent: true, emitModelToViewChange: false });
    }

    // posiciona cursor no fim (simples e robusto)
    requestAnimationFrame(() => input.setSelectionRange(selEnd, selEnd));
  }

  @HostListener('blur')
  onBlur() {
    // re-aplica máscara no blur (útil quando salvando masked)
    const input = this.el.nativeElement;
    const digits = (this.maskSaveRaw ? (this.ngControl?.control?.value ?? '').toString() : input.value).replace(/\D/g, '');
    input.value = this.applyMask(digits);
  }

  private applyMask(digits: string): string {
    const type = this.mask;
    if (!digits) return '';

    // Tipos prontos
    if (type === 'cpf') {
      return this.fit('(999.999.999-99)', digits);
    }
    if (type === 'cep') {
      return this.fit('99999-999', digits);
    }
    if (type === 'cnpj') {
      return this.fit('99.999.999/9999-99', digits);
    }
    if (type === 'phoneBr') {
      // 10 dígitos: (11) 2345-6789 | 11 dígitos: (11) 91234-5678
      const pattern = digits.length > 10 ? '(99) 99999-9999' : '(99) 9999-9999';
      return this.fit(pattern, digits);
    }

    // Padrão customizado (string com '9' como placeholder de dígito)
    if (typeof type === 'string' && type.includes('9')) {
      return this.fit(type, digits);
    }

    // sem máscara definida: só retorna dígitos (ou poderia retornar input bruto)
    return digits;
  }

  /** Aplica um pattern com '9' como placeholder de dígito */
  private fit(pattern: string, digits: string): string {
    let result = '';
    let di = 0;
    for (let pi = 0; pi < pattern.length && di < digits.length; pi++) {
      const pc = pattern[pi];
      if (pc === '9') {
        result += digits[di++];
      } else {
        result += pc;
      }
    }
    // completa caracteres fixos do final (apenas se já completou todos os dígitos)
    // (opcional — aqui mantemos só o necessário)
    return result;
  }
}
