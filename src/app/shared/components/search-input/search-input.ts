import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-search-input',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './search-input.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInput),
            multi: true
        }
    ],
    styles: [`:host { display: block; }`]
})
export class SearchInput implements ControlValueAccessor {
    @Input() placeholder: string = 'Buscar...';
    @Output() search = new EventEmitter<void>();

    value: string = '';
    
    onChange: (value: string) => void = () => {};
    onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(newValue: string): void {
        this.value = newValue;
        this.onChange(newValue);
    }

    onSearch(): void {
        this.search.emit();
    }
}
