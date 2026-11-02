import { Component, input, output } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  host: { class: 'block h-full' },
  selector: 'app-aside',
  imports: [ButtonModule, PanelMenuModule],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  readonly appName = input('MovilCare Express');
  readonly items = input<MenuItem[]>([]);
  readonly showSession = input(false);
  readonly username = input('');
  readonly roleLabel = input('Sin rol');
  readonly permissionCount = input(0);

  readonly navigated = output<void>();
  readonly logoutRequested = output<void>();

  onNavigationClick(event: Event): void {
    const target = event.target;
    if (target instanceof Element && target.closest('.p-panelmenu-item-link')) {
      this.navigated.emit();
    }
  }
}
