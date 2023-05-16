const REVIEW_TREE =
  '\
Review 1\n\
├── Review 3\n\
│   └── Review 5\n\
├── Review 4\n\
└── Review 6\n\
Review 2';

const Review1 = {
  id: 1,
  film_id: 28,
  title: 'Review1 title',
  text: 'Review1 text',
  path: '',
  depth: 0,
  childsNum: 3,
  parent_id: null,
  profile: {
    id: 2,
    username: 'Bob',
  },
};

const Review2 = {
  id: 2,
  film_id: 13,
  title: 'Review2 title',
  text: 'Review2 text',
  path: '',
  depth: 0,
  childsNum: 0,
  parent_id: null,
  profile: {
    id: 2,
    username: 'Bob',
  },
};
