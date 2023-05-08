import { ApiProperty } from '@nestjs/swagger';
import { Blob } from 'buffer';
import {  AutoIncrement, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

interface DbFilesCreationAttrs {
    filename: string;
    path: string;
    content: Blob; 
}
 
@Table( {tableName: 'files'}) 
export class DatabaseFile extends Model<DatabaseFile, DbFilesCreationAttrs> {
    
    @ApiProperty({example: '1', description: 'Unique identifier'})
    @AutoIncrement
    @Unique
    @PrimaryKey
    @Column( {type: DataType.INTEGER, primaryKey: true}) 
    id: number;
    
    @ApiProperty({example: 'UUID строка', description: 'UUID имя файла'}) 
    @Column( {type: DataType.STRING, allowNull: false})    
    filename: string;

    @ApiProperty({example: 'textblock', description: 'Essence table'}) 
    @Column( {type: DataType.INTEGER, allowNull: true})    
    essenceProfileId: number;

}