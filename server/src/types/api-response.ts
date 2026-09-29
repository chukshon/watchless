export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: unknown;
}

export const getSuccessResponse = <T>(
  data: T,
  message = 'Success',
): SuccessResponse<T> => ({
  success: true,
  message,
  data,
});

export const getErrorResponse = (
  message: string,
  errors?: unknown,
  errorCode?: string,
): ErrorResponse => ({
  success: false,
  message,
  ...(errorCode !== undefined ? { errorCode } : {}),
  ...(errors !== undefined ? { errors } : {}),
});
