import {
  ProfilePublic,
  ReviewModelAttrs,
  ReviewTreePublic,
} from '@shared/interfaces';

export class ReviewTreeDto implements ReviewTreePublic {
  id: number;
  filmId: number;
  title: string;
  text: string;
  path: string;
  depth: number;
  childsNum: number;
  parentId: number;
  profile: ProfilePublic;
  createdAt: string;
  updatedAt: string;
  childs: ReviewTreePublic[];

  constructor(reviewModel: ReviewModelAttrs) {
    this.id = reviewModel.id;
    this.filmId = reviewModel.filmId;
    this.title = reviewModel.title;
    this.text = reviewModel.text;
    this.path = reviewModel.path;
    this.depth = reviewModel.depth;
    this.childsNum = reviewModel.childsNum;
    this.parentId = reviewModel.parentId;
    this.profile = reviewModel.profile;
    this.createdAt = reviewModel.createdAt;
    this.updatedAt = reviewModel.updatedAt;
    this.childs = [];
  }
}
