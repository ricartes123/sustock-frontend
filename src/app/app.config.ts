import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, LOCALE_ID} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import localeDe from '@angular/common/locales/de';
import localeEsCl from '@angular/common/locales/es-CL';
import localePt from '@angular/common/locales/pt';
import localeEsMx from '@angular/common/locales/es-MX';

registerLocaleData(localeEsAr);
registerLocaleData(localeDe);
registerLocaleData(localeEsCl);
registerLocaleData(localePt);
registerLocaleData(localeEsMx);
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { initializeSession } from './core/initializers/session.initializer';
import { provideLucideIcons } from './core/providers/lucide-icons.provider';
import { provideHotToastConfig } from '@ngxpert/hot-toast';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAppInitializer(initializeSession),
    provideLucideIcons(),
    provideHotToastConfig({
      position: 'top-center',
      style: {
        background: 'rgba(17, 24, 39, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '16px',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }
    }),
  ]
};
