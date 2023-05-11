// import { ApiProperty } from '@nestjs/swagger';
// import { Blob } from 'buffer';
// import {  AutoIncrement, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

// interface DbFilesCreationAttrs {
//     fileName: string;
//     path2File: string;
// }
 
// @Table( {tableName: 'files'}) 
// export class DatabaseFile extends Model<DatabaseFile, DbFilesCreationAttrs> {
    
//     @ApiProperty({example: '1', description: 'Unique identifier'})
//     @AutoIncrement
//     @Unique
//     @PrimaryKey
//     @Column( {type: DataType.INTEGER, primaryKey: true}) 
//     id: number;
    
//     @ApiProperty({example: 'UUID строка', description: 'UUID имя файла'}) 
//     @Column( {type: DataType.STRING, allowNull: false})    
//     fileName: string;

//     @ApiProperty({example: '/src/fdge43terg.jpg', description: 'Путь к файлу в fs'}) 
//     @Column( {type: DataType.STRING, allowNull: false})    
//     path2File: string;

//     @ApiProperty({example: '0024dd23-8da4-4e69-bb6f-2ad62ecf2609', description: 'Внутренний UUID профиля'}) 
//     @Column( {type: DataType.STRING, allowNull: true})    
//     essenceProfileUUID: string;

// }