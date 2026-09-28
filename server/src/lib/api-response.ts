export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
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
): ErrorResponse => ({
  success: false,
  message,
  ...(errors !== undefined ? { errors } : {}),
});
