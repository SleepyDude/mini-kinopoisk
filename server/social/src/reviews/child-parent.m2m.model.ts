import { Model, Table, Column, DataType, Index, ForeignKey } from 'sequelize-typescript';
import { Review } from './reviews.model';

interface ReviewChildParentsCreationAttrs {
    child_id: number;
    parent_id: number;
}

@Table({ tableName: 'review_child_parents', createdAt: false, updatedAt: false })
export class ReviewChildParent extends Model<ReviewChildParent, ReviewChildParentsCreationAttrs> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Index
    @ForeignKey(() => Review)
    @Column({ type: DataType.INTEGER, allowNull: false })
    child_id: number;

    @ForeignKey(() => Review)
    @Column({ type: DataType.INTEGER, allowNull: false })
    parent_id: number;

}