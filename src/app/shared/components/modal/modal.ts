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
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
