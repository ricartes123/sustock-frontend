import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

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

  onClose() {
    this.close.emit();
  }
}
