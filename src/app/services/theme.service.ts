import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'agora-theme';
  private readonly DEFAULT_THEME: Theme = 'dark';

  private themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  get isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    this.storeTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') {
      return this.DEFAULT_THEME;
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return this.DEFAULT_THEME;
  }

  private storeTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light');
    body.classList.add(`theme-${theme}`);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FAFAF8');
    }
  }
}
