import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { VideoService } from '@/services/video.service';
import { getSuccessResponse } from '@/types/api-response';
import type {
  DownloadAudioInputT,
  GetYoutubeVideoInfoInputT,
} from '@/validators/video.validator';

export class VideoController {
  static getYoutubeVideoInfo = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body as GetYoutubeVideoInfoInputT;

    const youtubeVideoInfo = await VideoService.getYoutubeVideoInfo(youtubeUrl);

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(youtubeVideoInfo, 'Video info fetched successfully')
      );
  });

  static downloadAudio = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body as DownloadAudioInputT;

    const audioPath = await VideoService.downloadAudio(youtubeUrl);
    const videoInfo = await VideoService.getYoutubeVideoInfo(youtubeUrl);

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(
          { ...videoInfo, audioPath },
          'Audio downloaded successfully'
        )
      );
  });
}
