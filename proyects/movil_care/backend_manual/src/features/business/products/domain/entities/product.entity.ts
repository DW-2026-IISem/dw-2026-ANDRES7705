export interface ProductProps {
  id?: number | null;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  isActive?: boolean;
}

export class Product {
  readonly id: number | null;
  readonly sku: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precio: number;
  readonly isActive: boolean;

  constructor(props: ProductProps) {
    this.id = props.id ?? null;
    this.sku = props.sku;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.precio = props.precio;
    this.isActive = props.isActive ?? true;
  }
}
