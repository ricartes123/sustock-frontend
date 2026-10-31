import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './modal.html'
})
export class Modal {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Input() maxWidth: string = 'max-w-2xl';
  @Input() minHeight: string = '';
  @Output() close = new EventEmitter<void>();

  readonly titleId = `modal-title-${nextModalId++}`;

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) this.onClose();
  }

  onClose() {
    this.close.emit();
  }
}
