const USER_ROLES =  {
  STUDENT: 'student',
  EXAMINER: 'examiner',
};

const DIFFICULTY_LEVELS =  {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

const EMAIL_VERIFICATION_TIMEOUT =  24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_MIN_LENGTH = 8;

const EXAM_STATUSES = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    COMPLETED: 'completed',
};


export {

  USER_ROLES,

  DIFFICULTY_LEVELS,

  SESSION_TIMEOUT,

  EMAIL_VERIFICATION_TIMEOUT,

  PASSWORD_MIN_LENGTH,

  EXAM_STATUSES
};
