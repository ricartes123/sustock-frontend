import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './empty-state.html'
})
export class EmptyState {
  @Input() icon: string = 'package-open';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() showAction: boolean = false;
}
