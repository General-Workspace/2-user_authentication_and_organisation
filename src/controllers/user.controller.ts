import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import response from "../utils/lib/response.lib";
import prisma from "../config/prisma.config";
import bcryptHelper from "../utils/helpers/bcrypt.helper";
// import jwtService from "../utils/helpers/jwt.helper";
import { RegisterUserRequest, UserResponse } from "../@types";
import { UserHelperFunction } from "../utils/helpers/userHelper.helper";

type RegisterUser = Request<unknown, unknown, RegisterUserRequest, unknown>;
class UserService {
  /**
   * @description Registers a new user
   * @param {RegisterUser} req - The request object
   * @param {UserResponse} res - The response object
   * @returns {Promise<ResponseData<RegisterUserResponse>>} - The response object
   */
  // @tryCatch
  public registerUser = tryCatch(
    async (req: RegisterUser, res: UserResponse): Promise<unknown> => {
      const { username, password, fullname } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (user) {
        return response(res).errorResponse(
          "Conflict",
          "User already exists",
          StatusCodes.CONFLICT
        );
      }

      const hashedPassword = await bcryptHelper.hashPassword(
        password as string
      );

      const userHelper = new UserHelperFunction(fullname as string);
      // set the fullname
      userHelper.fullName = fullname as string;
      // get the fullname
      const getFullName = userHelper.fullName;

      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          fullname: getFullName as string,
        },
      });

      const registerUserResponse: RegisterUserRequest = {
        id: newUser.id,
        username: newUser.username,
        fullname: newUser.fullname as string,
      };

      return response(res).successResponse(
        registerUserResponse,
        StatusCodes.CREATED
      );
    }
  );
}

export const userService = new UserService();
