import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private translate = inject(TranslateService);
    private readonly LANGUAGE_KEY = 'sustock_lang';

    constructor() {
        this.initLanguage();
    }

    private initLanguage() {
        const savedLang = localStorage.getItem(this.LANGUAGE_KEY);
        // Prefer saved lang, default to Spanish
        const langToSet = savedLang || 'es';

        this.translate.addLangs(['es', 'en']);
        this.translate.setDefaultLang('es');
        this.translate.use(langToSet);
    }

    setLanguage(lang: 'es' | 'en') {
        this.translate.use(lang);
        localStorage.setItem(this.LANGUAGE_KEY, lang);
    }

    get currentLanguage(): string {
        return this.translate.currentLang;
    }
}
