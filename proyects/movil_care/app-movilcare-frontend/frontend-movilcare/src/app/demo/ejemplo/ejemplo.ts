import { Component, computed, effect, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

export interface Producto {
  nombre: string;
  precio: number;
  activo: boolean;
}

@Component({
  host: { class: 'block' },
  selector: 'app-ejemplo',
  imports: [
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    TagModule,
  ],
  templateUrl: './ejemplo.html',
  styleUrl: './ejemplo.css',
})
export class Ejemplo {
  protected readonly producto = signal<Producto>(productoInicial());

  protected readonly precioFinal = computed(() =>
    Math.round(this.producto().precio * 1.19),
  );

  protected readonly precioFormateado = computed(() =>
    formatoMoneda(this.producto().precio),
  );

  protected readonly precioFinalFormateado = computed(() =>
    formatoMoneda(this.precioFinal()),
  );

  protected readonly estadoTexto = computed(() =>
    this.producto().activo ? 'Activo' : 'Inactivo',
  );

  private readonly registro = effect(() => {
    const { nombre, precio, activo } = this.producto();
    console.log(
      `[ejemplo] ${nombre} · precio ${precio} · ${activo ? 'activo' : 'inactivo'}`,
    );
  });

  protected cambiarNombre(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.producto.update((actual) => ({ ...actual, nombre: input.value }));
    }
  }

  protected variarPrecio(delta: number): void {
    this.producto.update((actual) => ({
      ...actual,
      precio: Math.max(0, actual.precio + delta),
    }));
  }

  protected alternarEstado(): void {
    this.producto.update((actual) => ({ ...actual, activo: !actual.activo }));
  }

  protected reiniciar(): void {
    this.producto.set(productoInicial());
  }
}

function productoInicial(): Producto {
  return { nombre: 'Café molido 500 g', precio: 18000, activo: true };
}

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}
