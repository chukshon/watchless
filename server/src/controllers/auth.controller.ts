import { HTTPSTATUS } from '@/constants/http-status-code';
import { getSuccessResponse } from '@/types/api-response';
import type { LoginInputT, RegisterInputT } from '@/validators/auth.validator';

import { asyncHandler } from '@/middleware/async-handler.middleware';
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

    res
      .status(HTTPSTATUS.OK)
      .json(getSuccessResponse(loggedInUser, 'User logged in successfully'));
  });
}
