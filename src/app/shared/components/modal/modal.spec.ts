import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { provideLucideIcons } from '../../../core/providers/lucide-icons.provider';

describe('Modal', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideLucideIcons()] }));

  const render = (isOpen: boolean) => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('isOpen', isOpen);
    fixture.componentRef.setInput('title', 'Nuevo cliente');
    fixture.detectChanges();
    const close = vi.fn();
    fixture.componentInstance.close.subscribe(close);
    return { fixture, close };
  };

  it('is announced as a dialog named by its title', () => {
    const { fixture } = render(true);
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const title = fixture.nativeElement.querySelector(`#${dialog.getAttribute('aria-labelledby')}`);

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(title?.textContent?.trim()).toBe('Nuevo cliente');
    expect(fixture.nativeElement.querySelector('button[aria-label="Cerrar"]')).not.toBeNull();
  });

  it('closes with Escape only while open', () => {
    const open = render(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(open.close).toHaveBeenCalledTimes(1);

    open.fixture.destroy();
    const closed = render(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed.close).not.toHaveBeenCalled();
  });
});
