declare module "youtube-transcript/dist/youtube-transcript.esm.js" {
  export class YoutubeTranscript {
    static fetchTranscript(
      url: string,
      options?: { lang?: string }
    ): Promise<Array<{ text: string; duration: number; offset: number; lang: string }>>;
  }
  export function fetchTranscript(
    url: string,
    options?: { lang?: string }
  ): Promise<Array<{ text: string; duration: number; offset: number; lang: string }>>;
}
