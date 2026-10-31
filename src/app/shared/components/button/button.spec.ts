import { TestBed } from '@angular/core/testing';
import { Button, ButtonVariant } from './button';

describe('Button', () => {
  const render = (variant: ButtonVariant, title?: string) => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', variant);
    if (title) fixture.componentRef.setInput('title', title);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  };

  it('names an icon-only button after its tooltip', () => {
    const button = render('icon-danger', 'Archivar');

    expect(button.getAttribute('aria-label')).toBe('Archivar');
    expect(button.getAttribute('title')).toBe('Archivar');
  });

  it('leaves text buttons named by their text', () => {
    const button = render('primary', 'Guardar cambios');

    expect(button.hasAttribute('aria-label')).toBe(false);
    expect(button.getAttribute('title')).toBe('Guardar cambios');
  });
});
