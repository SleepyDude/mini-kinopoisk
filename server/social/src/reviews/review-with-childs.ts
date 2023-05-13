import { Profile } from '@hotels2023nestjs/shared';
import { Review } from '../../models/reviews.model';

export class ReviewWithChilds {
  profile: Profile;
  childs: ReviewWithChilds[];
  id: number;
  film_id: number;
  title: string;
  text: string;
  path: string;
  depth: number;
  childsNum: number;
  parent_id: number;
  createdAt: string;
  updatedAt: string;

  constructor(reviewModel: Review) {
    this.id = reviewModel.id;
    this.film_id = reviewModel.film_id;
    this.title = reviewModel.title;
    this.text = reviewModel.text;
    this.path = reviewModel.path;
    this.depth = reviewModel.depth;
    this.childsNum = reviewModel.childsNum;
    this.parent_id = reviewModel.parent_id;
    this.profile = reviewModel.profile;
    this.createdAt = reviewModel.createdAt;
    this.updatedAt = reviewModel.updatedAt;
    this.childs = [];
  }
}
