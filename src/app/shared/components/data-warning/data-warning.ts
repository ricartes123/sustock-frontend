import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from "../button/button";

@Component({
    selector: 'app-data-warning',
    standalone: true,
    imports: [CommonModule, Button],
    templateUrl: './data-warning.html',
})
export class DataWarning {
    @Input() visible = false;
    @Input() message = '';
    @Input() title = 'Advertencia de Inventario';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
