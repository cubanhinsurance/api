import { array, binary, boolean, number, object, string } from 'joi';
import { QUESTION_TYPES } from '../dtos/questions.dto';
import { HABILITIES_SCHEMA } from './habilities.schema';

export const ISSUE_QUESTION_SCHEMA = object({
  question: string().required(),
  type: string()
    .valid(...Object.values(QUESTION_TYPES))
    .optional()
    .default(QUESTION_TYPES.STRING),
  required: boolean().optional().default(false),
  options: array().items(string()).optional().options({ convert: true }),
});

export const HABILITY_RULE_AND = array()
  .items(number())
  .min(1)
  .required()
  .description('Listado de ids de habilidades requeridas en cojunto (AND)');

export const ISSUE_RULE = array()
  .items(HABILITY_RULE_AND)
  .optional()
  .min(1)
  .allow(null)
  .description('Listado de conjuntos para aplicar el operador OR');

export const CREATE_ISSUE_TREE_NODE_SCHEMA = object({
  name: string().required(),
  description: string().optional(),
  avatar: binary().optional(),
  questions: array().items(ISSUE_QUESTION_SCHEMA).optional(),
  rules: ISSUE_RULE,
});

export const UPDATE_ISSUE_TREE_NODE_SCHEMA = object({
  name: string().optional(),
  description: string().optional(),
  avatar: binary().optional(),
  questions: array().items(ISSUE_QUESTION_SCHEMA).optional(),
  rules: ISSUE_RULE,
}).optional();

export const ISSUE_SCHEMA = object({
  id: number().required(),
  name: string().required(),
  description: string().optional(),
  avatar: string().optional(),
  parent: number().optional(),
  questions: array()
    .items(
      object({
        question: string(),
        type: string()
          .valid(...Object.values(QUESTION_TYPES))
          .required(),
        options: array().items(string()).optional(),
        required: boolean().required(),
      }),
    )
    .optional(),
  rules: array().items(array().items(HABILITIES_SCHEMA)),
});

export const ISSUE_SCHEMA_LIST = ISSUE_SCHEMA.keys({
  path: string(),
});

export const ISSUE_TREE_SCHEMA = array().items(
  ISSUE_SCHEMA.keys({
    childs: array().items(ISSUE_SCHEMA).optional(),
  }),
);
