import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[currencyMask]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyMaskDirective),
    multi: true,
  }],
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  private onChange!: (value: number | null) => void;
  private onTouched!: () => void;
  private innerValue: number | null = null;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null): void {
    this.innerValue = value;
    this.el.nativeElement.value = this.format(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const value = digits === '' ? null : parseInt(digits, 10) / 100;
    this.innerValue = value;
    this.onChange(value);
    input.value = this.format(value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    this.el.nativeElement.value = this.format(this.innerValue);
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.innerValue !== null && this.innerValue !== undefined) {
      this.el.nativeElement.value = this.innerValue
        .toFixed(2)
        .replace('.', ',');
    }
  }

  private format(value: number | null): string {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
