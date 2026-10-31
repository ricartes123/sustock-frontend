import { Component, ElementRef, EventEmitter, HostListener, Input, Output, effect, viewChild } from '@angular/core';
import { Button } from '../button/button';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [Button],
    templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
    @Input() visible = false;
    @Input() title = '';
    @Input() detail = '';
    @Input() message = '';
    @Input() confirmLabel = 'Confirmar';
    @Input() cancelLabel = 'Volver';
    @Input() isLoading = false;

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    private cancelButton = viewChild('cancelButton', { read: ElementRef });

    constructor() {
        // The safe choice gets the focus, so Enter right after opening never runs the action.
        effect(() => {
            this.cancelButton()?.nativeElement.querySelector('button')?.focus();
        });
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        if (this.visible) this.onCancel();
    }

    onConfirm() {
        if (!this.isLoading) this.confirm.emit();
    }

    onCancel() {
        if (!this.isLoading) this.cancel.emit();
    }
}
