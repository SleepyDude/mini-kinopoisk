import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'tokens' })
export class Token extends Model<Token> {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id: number;

  @ApiProperty({
    example: 'sfg#gr.seg632.r42Rfas',
    description: 'Refresh token',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  refreshToken: string;
}
