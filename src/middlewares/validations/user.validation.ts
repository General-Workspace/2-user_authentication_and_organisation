import { body, validationResult } from "express-validator";
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
    .isString()
    .withMessage("Please enter a valid first name")
    .trim()
    .escape(),
  body("lastName")
    .exists()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Please enter a valid last name")
    .trim()
    .escape(),
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
    .withMessage("Please enter a valid phone number")
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
