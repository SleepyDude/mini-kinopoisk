import { ReviewModelAttrs, ReviewModelCreationAttrs } from '@hotels2023nestjs/shared';
import { Model, Table, Column, DataType, Index, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Profile } from '../profiles/profiles.model';


@Table({ tableName: 'reviews' })
export class Review extends Model<ReviewModelAttrs, ReviewModelCreationAttrs> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Index
    @Column({ type: DataType.INTEGER, allowNull: false })
    film_id: number;

    @Column({ type: DataType.STRING })
    title: string;

    @Column({ type: DataType.TEXT })
    text: string;

    // @Column({ type: DataType.INTEGER })
    @Column({ type: DataType.TEXT, defaultValue: "" })
    path: string;

    @ForeignKey(() => Profile)
    @Column({ type: DataType.INTEGER, allowNull: false })
    profile_id: number;

    @BelongsTo(() => Profile)
    profile: Profile;

    // @ForeignKey(() => Review)
    // @Column({ type: DataType.INTEGER })
    // parent_id: number;

    // @BelongsTo(() => Review, { as: "parent", targetKey: 'parent_id' })
    // parent: Review;

    // @BelongsToMany( () => Review, () => ReviewChildParent, 'child_id', 'parent_id')
    // parents: Review[];

    // @HasMany(() => ReviewChildParent, 'child_id')
    // child_parents: ReviewChildParent[];

    // @HasMany(() => Review, { as: "childs", sourceKey: 'id' })
    // childs: Review[];
}