export enum QUESTION_TYPES {
  STRING = 'string',
  BOOL = 'boolean',
  NUMBER = 'number',
  PHOTO = 'photo',
  OPTIONS = 'options',
}

export class IssuesQuestionsDTO {
  question: string;
  type: QUESTION_TYPES;
  options: string[];
  required: boolean;
}
