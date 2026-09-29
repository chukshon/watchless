import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import type { ValidatedRequest } from '@/middleware/validate-request.middleware';
import { AuthService } from '@/services/auth.service';
import { getSuccessResponse } from '@/types/api-response';
import type {
  LoginInputT,
  RegisterInputT,
  VerifyEmailQueryT,
} from '@/validators/auth.validator';

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
}
