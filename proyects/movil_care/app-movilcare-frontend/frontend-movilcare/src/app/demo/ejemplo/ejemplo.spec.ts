import { TestBed } from '@angular/core/testing';
import { Ejemplo } from './ejemplo';

describe('Ejemplo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ejemplo],
    }).compileComponents();
  });

  it('should render the initial product and derived price', async () => {
    const fixture = TestBed.createComponent(Ejemplo);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Café molido 500 g');
    expect(fixture.componentInstance.precioFinal()).toBe(21420);
    expect(fixture.nativeElement.textContent).toContain('21.420');
  });

  it('should update the base and tax-included prices', async () => {
    const fixture = TestBed.createComponent(Ejemplo);
    await fixture.whenStable();

    const increase = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.trim() === '+1000',
    ) as HTMLButtonElement;
    increase.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.producto().precio).toBe(19000);
    expect(fixture.componentInstance.precioFinal()).toBe(22610);
    expect(fixture.nativeElement.textContent).toContain('19.000');
    expect(fixture.nativeElement.textContent).toContain('22.610');
  });

  it('should toggle the active status message', async () => {
    const fixture = TestBed.createComponent(Ejemplo);
    await fixture.whenStable();

    const toggle = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.trim() === 'Cambiar estado',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Inactivo');
    expect(fixture.nativeElement.textContent).toContain('el borrado lógico lo oculta');
  });

  it('should update the preview when the product name changes', async () => {
    const fixture = TestBed.createComponent(Ejemplo);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      '#nombre-producto',
    ) as HTMLInputElement;

    input.value = 'Café de prueba';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Vista previa: Café de prueba');
  });
});
