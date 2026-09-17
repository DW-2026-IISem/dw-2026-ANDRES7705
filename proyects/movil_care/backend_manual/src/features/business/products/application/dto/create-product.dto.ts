import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'IPH15-128-BLK' })
  @IsString()
  @IsNotEmpty({ message: 'sku es requerido' })
  @MaxLength(50)
  sku!: string;

  @ApiProperty({ example: 'iPhone 15 128GB' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Dispositivo móvil de 128GB',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ example: 2500000 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'precio debe ser un número' },
  )
  @IsPositive({ message: 'precio debe ser mayor que 0' })
  precio!: number;
}
