import { Injectable, signal, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class Locale {
  private readonly translate = inject(TranslateService);
  readonly lang = signal<'ar' | 'en'>('ar');
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    this.translate.addLangs(['ar', 'en']);
    const saved = (localStorage.getItem('LANG') as 'ar' | 'en' | null) ?? null;
    if (saved === 'ar' || saved === 'en') {
      this.lang.set(saved);
    }
    this.translate.setDefaultLang(this.lang());
    this.translate.use(this.lang());
    document.documentElement.setAttribute('dir', this.dir());
  }

  setLang(lang: 'ar' | 'en') {
    this.lang.set(lang);
    this.translate.use(lang);
    document.documentElement.setAttribute('dir', this.dir());
    localStorage.setItem('LANG', lang);
  }
}
