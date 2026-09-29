import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { AuthService } from '@/services/auth.service';
import { getSuccessResponse } from '@/types/api-response';
import type { RegisterInputT } from '@/validators/auth.validator';

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body as RegisterInputT);

    res
      .status(HTTPSTATUS.CREATED)
      .json(getSuccessResponse(user, 'User registered successfully'));
  });
}
