import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface SuccessResponseData<T> {
  success: boolean;
  data: T;
  statusCode: number;
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
}

declare type UserResponse = ResponseData<
  SuccessResponseData<RegisterUserRequest> | ErrorResponseData
>;
