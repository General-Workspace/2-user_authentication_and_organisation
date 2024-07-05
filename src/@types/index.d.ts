import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface SuccessResponseData<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

declare interface ErrorResponseData {
  success: boolean;
  error: {
    type: string;
    message: string;
    statusCode: number;
  };
}

interface RegisterUserRequest {
  id: string;
  username: string;
  password?: string;
  fullname: string;
  [key: string]: unknown;
}

declare type UserResponse = ResponseData<
  SuccessResponseData<RegisterUserRequest> | ErrorResponseData
>;
