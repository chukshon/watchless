import { HTTPSTATUS } from '@/constants/http-status-code';
import { getSuccessResponse } from '@/types/api-response';
import type {
  LoginInputT,
  RegisterInputT,
  ResendEmailVerificationInputT,
  VerifyEmailQueryT,
} from '@/validators/auth.validator';

import { asyncHandler } from '@/middleware/async-handler.middleware';
import type { ValidatedRequest } from '@/middleware/validate-request.middleware';
import { AuthService } from '@/services/auth.service';

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const registeredUser = await AuthService.register(
      req.body as RegisterInputT
    );

    res
      .status(HTTPSTATUS.CREATED)
      .json(getSuccessResponse(registeredUser, 'User registered successfully'));
  });

  static login = asyncHandler(async (req, res) => {
    const loggedInUser = await AuthService.login(req.body as LoginInputT);

    res.json(getSuccessResponse(loggedInUser, 'User logged in successfully'));
  });

  static verifyEmail = asyncHandler(async (req, res) => {
    const { token } = (req as ValidatedRequest)
      .validatedQuery as VerifyEmailQueryT;

    const result = await AuthService.verifyEmail(token);

    res.json(getSuccessResponse(result));
  });

  static resendEmailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body as ResendEmailVerificationInputT;
    const result = await AuthService.resendEmailVerification(email);

    res.json(getSuccessResponse(result, result.message));
  });

  static getLoggedInUser = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const loggedInUser = await AuthService.getUserById(userId!);

    res
      .status(HTTPSTATUS.OK)
      .json(getSuccessResponse(loggedInUser, 'Profile fetched successfully'));
  });
}
