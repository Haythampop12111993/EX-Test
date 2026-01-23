import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Locale } from './core/i18n/locale';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly locale = inject(Locale);
  protected readonly title = signal('ExSystem');
}
