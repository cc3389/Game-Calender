export type GameScreenshot = {
  id: string;
  url: string;
  thumbUrl?: string;
};

export type GameVideo = {
  id: string;
  name: string;
  previewUrl: string | null;
  /** MP4 直链（RAWG / 旧 Steam） */
  videoUrl?: string;
  /** Steam 预告 HLS */
  hlsUrl?: string;
};

export type GameMediaSlide =
  | {
      kind: "image";
      id: string;
      url: string;
      thumbUrl: string;
    }
  | {
      kind: "video";
      id: string;
      name: string;
      thumbUrl: string | null;
      mp4Url?: string;
      hlsUrl?: string;
    };

export type GameDetailMedia = {
  id: string;
  tags: string[];
  descriptionEn: string | null;
  descriptionZh: string | null;
  descriptionZhHtml: string | null;
  /** 轮播顺序：视频优先，其后截图 */
  slides: GameMediaSlide[];
  screenshots: GameScreenshot[];
  videos: GameVideo[];
};
