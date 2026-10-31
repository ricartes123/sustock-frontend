import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a short password on sign-up before calling the API', () => {
    component.toggleMode();
    component.password = '1234567';
    component.onSubmit();

    expect(component.error()).toBe('La contraseña debe tener al menos 8 caracteres.');
    expect(component.loading()).toBe(false);
  });

  it('explains rate limiting instead of blaming the form data', () => {
    const message = component['describeError'](new HttpErrorResponse({ status: 429, error: { message: 'ThrottlerException: Too Many Requests' } }));
    expect(message).toBe('Demasiados intentos. Esperá un minuto y volvé a intentar.');
  });
});
