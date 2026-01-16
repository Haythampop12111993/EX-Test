import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from './shared/components/language-switcher/language-switcher.component';
import { LogoutButtonComponent } from './shared/components/logout-button/logout-button.component';
import { HomeButtonComponent } from './shared/components/home-button/home-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LanguageSwitcherComponent, LogoutButtonComponent, HomeButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ExSystem');
}
