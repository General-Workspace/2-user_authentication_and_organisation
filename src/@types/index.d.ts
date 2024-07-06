import { Request, Response } from "express";
import { User } from "@prisma/client";

declare type ResponseData<T> = Response<T>;

declare interface SuccessResponseData<T> {
  status: string;
  message: string;
  data: T;
  statusCode: number;
}

declare interface ErrorResponseData {
  status: string;
  message: string;
  statusCode: number;
}

interface RegisterUserRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | undefined;
  [key: string]: unknown;
}

interface LoginResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

declare type UserResponse = ResponseData<
  SuccessResponseData<RegisterUserRequest> | ErrorResponseData
>;

declare interface UserObject extends Request {
  user: User;
}

// Organisation interface definitions
declare type OrganisationResponse = ResponseData<
  SuccessResponseData<Organisation> | ErrorResponseData
>;

declare interface Organisation {
  orgId: string;
  name: string;
  description: string;
  userId: string;
}

declare interface OrganisationObject extends Request {
  organisation: Organisation;
}
