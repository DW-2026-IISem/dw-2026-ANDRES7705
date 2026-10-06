import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class ProductModel extends Model {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare sku: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare descripcion: string | null;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  declare precio: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;
}
