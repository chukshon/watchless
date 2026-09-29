export type VideoInfoT = {
  title: string;
  videoUrl: string;
  description: string;
  duration: number;
  author: string;
  thumbnail: string;
  audioPath?: string;
};

export type YoutubeDlOutputT = {
  title: string;
  description?: string;
  duration: number;
  uploader: string;
  thumbnail: string;
} & Record<string, unknown>;
