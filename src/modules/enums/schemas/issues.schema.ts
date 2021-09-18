import * as joi from 'joi';
import { QUESTION_TYPES } from '../dtos/questions.dto';
import { HABILITIES_SCHEMA } from './habilities.schema';

export const ISSUE_QUESTION_SCHEMA = joi.object({
  question: joi.string().required(),
  type: joi
    .string()
    .valid(...Object.values(QUESTION_TYPES))
    .optional()
    .default(QUESTION_TYPES.STRING),
  required: joi.boolean().optional().default(false),
  options: joi
    .array()
    .items(joi.string())
    .optional()
    .options({ convert: true }),
});

export const HABILITY_RULE_AND = joi
  .array()
  .items(joi.number())
  .min(1)
  .required()
  .description('Listado de ids de habilidades requeridas en cojunto (AND)');

export const ISSUE_RULE = joi
  .array()
  .items(HABILITY_RULE_AND)
  .optional()
  .min(1)
  .allow(null)
  .description('Listado de conjuntos para aplicar el operador OR');

export const CREATE_ISSUE_TREE_NODE_SCHEMA = joi.object({
  name: joi.string().required(),
  description: joi.string().optional(),
  avatar: joi.binary().optional(),
  questions: joi.array().items(ISSUE_QUESTION_SCHEMA).optional(),
  rules: ISSUE_RULE,
});

export const UPDATE_ISSUE_TREE_NODE_SCHEMA = joi
  .object({
    name: joi.string().optional(),
    description: joi.string().optional(),
    avatar: joi.binary().optional(),
    questions: joi.array().items(ISSUE_QUESTION_SCHEMA).optional(),
    rules: ISSUE_RULE,
  })
  .optional();

export const ISSUE_SCHEMA = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
  description: joi.string().optional(),
  avatar: joi.string().optional(),
  parent: joi.number().optional(),
  questions: joi
    .array()
    .items(
      joi.object({
        question: joi.string(),
        type: joi
          .string()
          .valid(...Object.values(QUESTION_TYPES))
          .required(),
        options: joi.array().items(joi.string()).optional(),
        required: joi.boolean().required(),
      }),
    )
    .optional(),
  rules: joi.array().items(joi.array().items(HABILITIES_SCHEMA)),
});

export const ISSUE_SCHEMA_LIST = ISSUE_SCHEMA.keys({
  path: joi.string(),
});

export const ISSUE_TREE_SCHEMA = joi.array().items(
  ISSUE_SCHEMA.keys({
    childs: joi.array().items(ISSUE_SCHEMA).optional(),
  }),
);
