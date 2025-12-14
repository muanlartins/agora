import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  canDeactivate(component: HasUnsavedChanges): Observable<boolean> | boolean {
    if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
      return confirm('Você tem alterações não salvas. Deseja sair sem salvar?');
    }
    return true;
  }
}
