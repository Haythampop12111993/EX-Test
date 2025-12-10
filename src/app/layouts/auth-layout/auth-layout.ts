import { ChangeDetectionStrategy, Component, ChangeDetectorRef, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Locale } from '../../core/i18n/locale';

@Component({
  selector: 'app-auth-layout',
  imports: [NgClass, TranslateModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  readonly slides: readonly { src: string; titleKey: string; descriptionKey: string }[] = [
    {
      src: '/images/agri-hero.svg',
      titleKey: 'overlay.slide1.title',
      descriptionKey: 'overlay.slide1.description',
    },
    {
      src: '/images/agri-hero-2.svg',
      titleKey: 'overlay.slide2.title',
      descriptionKey: 'overlay.slide2.description',
    },
    {
      src: '/images/agri-hero-3.svg',
      titleKey: 'overlay.slide3.title',
      descriptionKey: 'overlay.slide3.description',
    },
  ];
  activeIndex = 0;
  private readonly cdr = inject(ChangeDetectorRef);
  previousIndex = 0;
  readonly locale = inject(Locale);

  select(index: number) {
    if (index >= 0 && index < this.slides.length) {
      this.previousIndex = this.activeIndex;
      this.activeIndex = index;
      this.cdr.markForCheck();
    }
  }

  private readonly auto = interval(3000)
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.previousIndex = this.activeIndex;
      this.activeIndex = (this.activeIndex + 1) % this.slides.length;
      this.cdr.markForCheck();
    });

  setLang(lang: 'ar' | 'en') {
    this.locale.setLang(lang);
    this.cdr.markForCheck();
  }
}
