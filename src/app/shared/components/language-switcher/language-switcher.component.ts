import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Locale } from '../../../core/i18n/locale';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="inline-flex rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm p-1">
      <button type="button"
              (click)="setLang('ar')"
              class="px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
              [ngClass]="locale.lang() === 'ar' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'">
        العربية
      </button>
      <button type="button"
              (click)="setLang('en')"
              class="px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300"
              [ngClass]="locale.lang() === 'en' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'">
        English
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly locale = inject(Locale);

  setLang(lang: 'ar' | 'en') {
    this.locale.setLang(lang);
  }
}
