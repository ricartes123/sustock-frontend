import { TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  const render = (inputs: Partial<ConfirmDialog> = {}) => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('title', 'Anular venta');
    fixture.componentRef.setInput('confirmLabel', 'Anular venta');
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));
    return { fixture, component: fixture.componentInstance, buttons };
  };

  it('offers a way back next to the action and focuses it', async () => {
    const { fixture, buttons } = render();
    await fixture.whenStable();

    expect(buttons().map(b => b.textContent?.trim())).toEqual(['Volver', 'Anular venta']);
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('emits cancel on "Volver" and on Escape, and confirm only on the action', () => {
    const { component, buttons } = render();
    const cancel = vi.fn();
    const confirm = vi.fn();
    component.cancel.subscribe(cancel);
    component.confirm.subscribe(confirm);

    buttons()[0].click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(confirm).not.toHaveBeenCalled();

    buttons()[1].click();
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('ignores both choices while the action is running', () => {
    const { component, buttons } = render({ isLoading: true });
    const cancel = vi.fn();
    const confirm = vi.fn();
    component.cancel.subscribe(cancel);
    component.confirm.subscribe(confirm);

    component.onConfirm();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(buttons()[1].textContent?.trim()).toBe('Procesando...');
  });

  it('does not react to Escape while hidden', () => {
    const { fixture, component } = render();
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    const cancel = vi.fn();
    component.cancel.subscribe(cancel);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cancel).not.toHaveBeenCalled();
  });
});
