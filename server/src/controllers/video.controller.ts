import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { AuthService } from '@/services/auth.service';
import { JobsService } from '@/services/jobs.service';
import { VideoService } from '@/services/video.service';
import { getSuccessResponse } from '@/types/api-response';
import type { YoutubeUrlInputT } from '@/validators/shared.validator';

export class VideoController {
  static getYoutubeVideoInfo = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body as YoutubeUrlInputT;

    const youtubeVideoInfo = await VideoService.getYoutubeVideoInfo(youtubeUrl);

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(youtubeVideoInfo, 'Video info fetched successfully')
      );
  });

  static downloadAudio = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body as YoutubeUrlInputT;

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

  static transcribeAudio = asyncHandler(async (req, res) => {
    const { youtubeUrl } = req.body as YoutubeUrlInputT;
    const userId = req.user?.userId;

    const user = await AuthService.getUserById(userId!);
    const videoInfo = await VideoService.getYoutubeVideoInfo(youtubeUrl);

    const job = await JobsService.addTranscriptionJob(
      youtubeUrl,
      videoInfo,
      user
    );

    res.status(HTTPSTATUS.OK).json(
      getSuccessResponse(
        {
          jobId: job.jobId,
          videoInfo,
        },
        'Transcription job created successfully'
      )
    );
  });
}
