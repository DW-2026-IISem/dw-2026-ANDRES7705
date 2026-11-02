import { TestBed } from '@angular/core/testing';
import { Construir } from './construir';

function stubDesktopMedia(matches: boolean): () => void {
  const original = window.matchMedia;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      }) as MediaQueryList,
  });

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: original,
    });
  };
}

describe('Construir', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Construir],
    }).compileComponents();
  });

  async function crearPantalla() {
    const fixture = TestBed.createComponent(Construir);
    await fixture.whenStable();
    return { fixture, compilado: fixture.nativeElement as HTMLElement };
  }

  function botonMenu(compilado: HTMLElement): HTMLButtonElement {
    const boton = compilado.querySelector(
      'app-header button[aria-label="Mostrar u ocultar el menú"]',
    );
    expect(boton).toBeTruthy();
    return boton as HTMLButtonElement;
  }

  function opcionDelMenu(compilado: HTMLElement, etiqueta: string): HTMLElement {
    const opcion = [...compilado.querySelectorAll('a, button')].find(
      (elemento) => elemento.textContent?.trim() === etiqueta,
    );
    expect(opcion).toBeTruthy();
    return opcion as HTMLElement;
  }

  it('should compose the layout and start on Inicio', async () => {
    const { compilado } = await crearPantalla();

    expect(compilado.querySelector('app-header')).toBeTruthy();
    expect(compilado.querySelector('aside app-aside')).toBeTruthy();
    expect(compilado.querySelector('app-footer')).toBeTruthy();
    expect(compilado.querySelector('main h1')?.textContent).toContain('Inicio');
  });

  it('should render MovilCare entities in their domain menu groups', async () => {
    const { fixture, compilado } = await crearPantalla();

    for (const label of [
      'Gestión comercial',
      'Inventario',
      'Servicio técnico',
      'Seguridad y acceso',
    ]) {
      expect(compilado.textContent).toContain(label);
    }

    const labelsByGroup: Record<string, string[]> = {
      'Gestión comercial': [
        'Clientes',
        'Empleados',
        'Ventas',
        'Detalles de venta',
        'Pagos',
        'Garantías',
      ],
      Inventario: ['Tipos de producto', 'Productos', 'Unidades serializadas', 'Repuestos'],
      'Servicio técnico': [
        'Órdenes de servicio',
        'Diagnósticos',
        'Autorizaciones de servicio',
        'Consumos de repuestos',
      ],
      'Seguridad y acceso': [
        'Usuarios',
        'Roles',
        'Recursos',
        'Asignaciones usuario–rol',
        'Asignaciones rol–recurso',
        'Tokens de sesión',
      ],
    };

    for (const [group, labels] of Object.entries(labelsByGroup)) {
      opcionDelMenu(compilado, group).click();
      fixture.detectChanges();
      await fixture.whenStable();
      for (const label of labels) {
        expect(compilado.textContent).toContain(label);
      }
    }

    expect(compilado.textContent).toContain('MovilCare Express');
    expect(compilado.textContent).not.toContain('EnlaceExpress');
  });

  it('should always show the menu button', async () => {
    const { compilado } = await crearPantalla();
    expect(botonMenu(compilado).classList.contains('lg:hidden')).toBe(false);
  });

  it('should change the title without navigating when an option is chosen', async () => {
    const { fixture, compilado } = await crearPantalla();

    opcionDelMenu(compilado, 'Gestión comercial').click();
    fixture.detectChanges();
    await fixture.whenStable();
    opcionDelMenu(compilado, 'Clientes').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compilado.querySelector('main h1')?.textContent).toContain('Clientes');
  });

  it('should open the mobile drawer when the header requests it', async () => {
    const { fixture, compilado } = await crearPantalla();

    expect(fixture.componentInstance.mobileOpen()).toBe(false);
    botonMenu(compilado).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mobileOpen()).toBe(true);
  });

  it('should hide the fixed aside on desktop instead of opening the drawer', async () => {
    const restoreMedia = stubDesktopMedia(true);

    try {
      const { fixture, compilado } = await crearPantalla();
      expect(compilado.querySelector('aside app-aside')).toBeTruthy();

      botonMenu(compilado).click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.sidebarCollapsed()).toBe(true);
      expect(compilado.querySelector('aside')).toBeNull();
      expect(fixture.componentInstance.mobileOpen()).toBe(false);
    } finally {
      restoreMedia();
    }
  });

  it('should close the drawer after choosing an option', async () => {
    const { fixture, compilado } = await crearPantalla();

    botonMenu(compilado).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.mobileOpen()).toBe(true);

    opcionDelMenu(compilado, 'Servicio técnico').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.mobileOpen()).toBe(true);

    opcionDelMenu(compilado, 'Órdenes de servicio').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mobileOpen()).toBe(false);
    expect(compilado.querySelector('main h1')?.textContent).toContain('Órdenes de servicio');
  });
});
