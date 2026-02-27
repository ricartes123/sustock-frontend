import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stock-warning',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stock-warning.component.html',
})
export class StockWarningComponent {
    @Input() visible = false;
    @Input() message = 'La acción podría poner en peligro la credibilidad de los datos de su inventario. El stock del producto quedará en negativo.';
    @Input() title = 'Advertencia de Inventario';
    @Input() isLoading = false;

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
