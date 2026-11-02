import { Component, signal } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../../layout/aside/aside';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

@Component({
  host: { class: 'block' },
  selector: 'app-construir',
  imports: [Aside, ButtonModule, CardModule, DrawerModule, Footer, Header],
  templateUrl: './construir.html',
  styleUrl: './construir.css',
})
export class Construir {
  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly title = signal('Inicio');

  readonly items: MenuItem[] = [
    {
      label: 'Gestión comercial',
      icon: 'pi pi-briefcase',
      items: [
        { label: 'Clientes', icon: 'pi pi-address-book', command: () => this.seleccionar('Clientes') },
        { label: 'Empleados', icon: 'pi pi-id-card', command: () => this.seleccionar('Empleados') },
        { label: 'Ventas', icon: 'pi pi-shopping-cart', command: () => this.seleccionar('Ventas') },
        {
          label: 'Detalles de venta',
          icon: 'pi pi-list',
          command: () => this.seleccionar('Detalles de venta'),
        },
        { label: 'Pagos', icon: 'pi pi-credit-card', command: () => this.seleccionar('Pagos') },
        { label: 'Garantías', icon: 'pi pi-verified', command: () => this.seleccionar('Garantías') },
      ],
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        {
          label: 'Tipos de producto',
          icon: 'pi pi-tags',
          command: () => this.seleccionar('Tipos de producto'),
        },
        { label: 'Productos', icon: 'pi pi-mobile', command: () => this.seleccionar('Productos') },
        {
          label: 'Unidades serializadas',
          icon: 'pi pi-barcode',
          command: () => this.seleccionar('Unidades serializadas'),
        },
        { label: 'Repuestos', icon: 'pi pi-wrench', command: () => this.seleccionar('Repuestos') },
      ],
    },
    {
      label: 'Servicio técnico',
      icon: 'pi pi-wrench',
      items: [
        {
          label: 'Órdenes de servicio',
          icon: 'pi pi-file-edit',
          command: () => this.seleccionar('Órdenes de servicio'),
        },
        {
          label: 'Diagnósticos',
          icon: 'pi pi-search',
          command: () => this.seleccionar('Diagnósticos'),
        },
        {
          label: 'Autorizaciones de servicio',
          icon: 'pi pi-check-square',
          command: () => this.seleccionar('Autorizaciones de servicio'),
        },
        {
          label: 'Consumos de repuestos',
          icon: 'pi pi-cog',
          command: () => this.seleccionar('Consumos de repuestos'),
        },
      ],
    },
    {
      label: 'Seguridad y acceso',
      icon: 'pi pi-shield',
      items: [
        { label: 'Usuarios', icon: 'pi pi-users', command: () => this.seleccionar('Usuarios') },
        { label: 'Roles', icon: 'pi pi-key', command: () => this.seleccionar('Roles') },
        { label: 'Recursos', icon: 'pi pi-list', command: () => this.seleccionar('Recursos') },
        {
          label: 'Asignaciones usuario–rol',
          icon: 'pi pi-user-plus',
          command: () => this.seleccionar('Asignaciones usuario–rol'),
        },
        {
          label: 'Asignaciones rol–recurso',
          icon: 'pi pi-lock',
          command: () => this.seleccionar('Asignaciones rol–recurso'),
        },
        {
          label: 'Tokens de sesión',
          icon: 'pi pi-history',
          command: () => this.seleccionar('Tokens de sesión'),
        },
      ],
    },
  ];

  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }

    this.mobileOpen.set(true);
  }

  protected seleccionar(titulo: string): void {
    this.title.set(titulo);
    this.mobileOpen.set(false);
  }
}
