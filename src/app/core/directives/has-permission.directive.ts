import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { Auth } from '../auth/auth';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(Auth);

  @Input() set appHasPermission(permission: string | string[] | undefined | null) {
    this.updateView(permission);
  }

  private updateView(permission: string | string[] | undefined | null) {
    // If no permission is required, show the element
    if (!permission || (Array.isArray(permission) && permission.length === 0)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    const user = this.auth.currentUser();
    const userPermissions = user?.permissions || [];
    
    let hasPermission = false;

    if (Array.isArray(permission)) {
      // Check if user has ANY of the provided permissions (OR logic)
      hasPermission = permission.some(p => userPermissions.includes(p));
    } else {
      hasPermission = userPermissions.includes(permission);
    }

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
