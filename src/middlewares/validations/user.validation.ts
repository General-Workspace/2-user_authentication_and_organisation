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

/**
 * @description validate user registration
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

type ValidateUserResponse = Response<unknown, Record<string, unknown>>;

export const registerValidation = [
  body("firstName")
    .exists()
    .withMessage("First name is required")
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isString()
    .withMessage("First name must be a string")
    .trim()
    .escape(),
  body("lastName")
    .exists()
    .withMessage("Last name is required")
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isString()
    .withMessage("Last name must be a string")
    .trim()
    .escape(),
  body("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .isString()
    .withMessage("Email must be a string")
    .normalizeEmail()
    .trim()
    .escape(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .trim()
    .escape(),
  body("phone")
    .optional()
    .isString()
    .withMessage("Phone number must be a string")
    .trim()
    .escape(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        errors: errors.mapped(),
      });
    }
    return next();
  },
];

export const loginValidation = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail()
    .trim()
    .escape(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Please enter a valid password")
    .trim()
    .escape(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        errors: errors.array(),
      });
    }
    return next();
  },
];

export const getUserProfileValidation = [
  param("id")
    .exists()
    .withMessage("User ID is required")
    .notEmpty()
    .withMessage("User ID cannot be empty")
    .isString()
    .withMessage("Please enter a valid user ID")
    .trim()
    .escape(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        errors: errors.array(),
      });
    }
    return next();
  },
];
