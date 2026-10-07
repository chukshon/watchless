import { HTTPSTATUS } from '@/constants/http-status-code';
import { asyncHandler } from '@/middleware/async-handler.middleware';
import { AuthService } from '@/services/auth.service';
import { JobsService } from '@/services/jobs.service';
import { VideoService } from '@/services/video.service';
import { getSuccessResponse } from '@/types/api-response';
import type {
  YoutubeUrlInputT,
  IdParamInputT,
} from '@/validators/shared.validator';

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

  static getTranscriptionStatus = asyncHandler(async (req, res) => {
    const { jobId } = req.params as { jobId: string };

    const jobStatus = await JobsService.getJobStatus(jobId);

    res
      .status(HTTPSTATUS.OK)
      .json(
        getSuccessResponse(
          jobStatus,
          'Transcription status fetched successfully'
        )
      );
  });

  static getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params as IdParamInputT;
    const userId = req.user?.userId;

    const video = await VideoService.getVideoById(id, userId!);

    // transform the response to include only necessary fields
    const transformedVideo = VideoService.transformVideo(video!);

    res
      .status(HTTPSTATUS.OK)
      .json(getSuccessResponse(transformedVideo, 'Video fetched successfully'));
  });
}
