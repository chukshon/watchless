import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { VideoService } from '@/services/video.service';
import { getSuccessResponse } from '@/types/api-response';
import type { GetVideoInfoInputT } from '@/validators/video.validator';

export class VideoController {
  static getVideoInfo = asyncHandler(async (req, res) => {
    const { url } = req.body as GetVideoInfoInputT;

    const videoInfo = await VideoService.getVideoInfo(url);

    res
      .status(HTTPSTATUS.OK)
      .json(getSuccessResponse(videoInfo, 'Video info fetched successfully'));
  });
}
