import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-autocomplete-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './autocomplete-field.component.html',
  styleUrl: './autocomplete-field.component.scss',
})
export class AutocompleteFieldComponent implements OnInit, OnDestroy, OnChanges {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) placeholder!: string;
  @Input({ required: true }) searchFn!: (term: string) => Observable<any[]>;
  @Input() displayField = 'nome';
  @Input() required = false;
  @Input() selectedItem: any = null;
  @Input() initialLabel = '';
  @Output() selected = new EventEmitter<any>();
  @Output() addNew = new EventEmitter<void>();

  searchControl = new FormControl('');
  filteredItems: any[] = [];
  showDropdown = false;
  selectedValue: any = null;
  loading = false;
  focused = false;

  private destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem'] && changes['selectedItem'].currentValue) {
      this.selectedValue = changes['selectedItem'].currentValue;
      this.searchControl.setValue(this.selectedValue[this.displayField], { emitEvent: false });
    }
    if (changes['initialLabel'] && changes['initialLabel'].currentValue && !this.selectedValue) {
      this.searchControl.setValue(changes['initialLabel'].currentValue, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    if (this.initialLabel && !this.selectedValue) {
      this.searchControl.setValue(this.initialLabel, { emitEvent: false });
    }
    if (this.selectedValue) {
      this.searchControl.setValue(this.selectedValue[this.displayField], { emitEvent: false });
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => {
      const searchTerm = (term || '').trim();
      if (searchTerm.length >= 2) {
        this.loading = true;
        this.searchFn(searchTerm).pipe(takeUntil(this.destroy$)).subscribe(items => {
          this.filteredItems = items;
          this.showDropdown = true;
          this.loading = false;
        });
      } else {
        this.filteredItems = [];
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus(): void {
    this.focused = true;
    const val = this.searchControl.value;
    if (val && val.length >= 2) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.focused = false;
      this.showDropdown = false;
    }, 200);
  }

  selectItem(item: any): void {
    this.selectedValue = item;
    this.selected.emit(item);
    this.searchControl.setValue(item[this.displayField], { emitEvent: false });
    this.showDropdown = false;
  }

  clearSelection(): void {
    this.selectedValue = null;
    this.selected.emit(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.showDropdown = false;
  }

  onAddNew(): void {
    this.showDropdown = false;
    this.addNew.emit();
  }
}
