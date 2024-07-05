import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorResponseData, SuccessResponseData } from "../../@types";

class ResponseHandler {
  constructor(private res: Response) {}

  public successResponse<T>(
    statusCode = StatusCodes.OK,
    message: string,
    data: T
  ) {
    const successResponse: SuccessResponseData<T> = {
      status: "success",
      message,
      data,
      statusCode,
    };
    this.res.status(statusCode).json(successResponse);
  }

  public errorResponse(
    status: string,
    message: string,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    const errorResponse: ErrorResponseData = {
      status,
      message,
      statusCode,
    };
    this.res.status(statusCode).json(errorResponse);
  }
}

const response = (res: Response) => {
  return new ResponseHandler(res);
};

export default response;
