import Joi from "joi";
import { operations } from "../../config/globals";

export class CalculatorSchema {

  // For validating the POST request to API /init
  static initSchema = Joi.object({
    num1: Joi.number().required(),
    num2: Joi.number().required(),
    operator: Joi.string().valid(...operations).required()
  });

  // For validating the POST request to API /operation
  static operationSchema = Joi.object({
    id: Joi.number().required(),
    num: Joi.number().required(),
    operator: Joi.string().valid(...operations).required()
  });

  // For validating the PUT request to API /undo
  static undoSchema = Joi.object({
    id: Joi.number().required()
  });

}