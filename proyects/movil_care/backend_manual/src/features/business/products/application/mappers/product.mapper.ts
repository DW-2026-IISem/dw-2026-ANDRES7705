import { Product } from '../../domain/entities/product.entity.js';
import { CreateProductDto } from '../dto/create-product.dto.js';

export class ProductMapper {
  static toEntity(dto: CreateProductDto): Product {
    return new Product({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      precio: dto.precio,
      isActive: true,
    });
  }

  static toResponse(product: Product) {
    return {
      id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      isActive: product.isActive,
    };
  }
}
