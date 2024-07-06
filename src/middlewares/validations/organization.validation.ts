import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

interface CustomError {
  field: string;
  message: string;
}

const errorFormatter = ({
  msg,
  param,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any): CustomError => {
  return {
    field: param,
    message: msg,
  };
};

type ValidateOrganizationResponse = Response<unknown, Record<string, unknown>>;

/**
 * @description validate organization creation
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

export const createOrganizationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Please enter a valid name")
    .trim()
    .escape(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a strings")
    .trim()
    .escape(),
  (req: Request, res: ValidateOrganizationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        errors: errors.mapped(),
      });
    }
    return next();
  },
];

export const getOrganizationValidation = [
  param("orgId")
    .exists()
    .withMessage("Organization ID is required")
    .notEmpty()
    .withMessage("Organization ID cannot be empty")
    .isString()
    .withMessage("Organization ID must be a string")
    .trim()
    .escape(),

  (req: Request, res: ValidateOrganizationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        errors: errors.mapped(),
      });
    }
    return next();
  },
];
