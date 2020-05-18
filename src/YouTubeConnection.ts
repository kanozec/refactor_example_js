import { google, youtube_v3 } from "googleapis";
import Video from "./Video";

const API_KEY = 'AIzaSyCZaoOcS5dL7KpYFZhHB_cO5r1oNVqiqcM'

export default class YouTubeConnection {
  public async listVideos(ids: Video[]): Promise<youtube_v3.Schema$Video[]> {
    const youtube = google.youtube({
      version: 'v3',
      auth: API_KEY
    })
    const res = await youtube.videos.list({
      id: ids.join(','),
      part: 'snippet, contentDetails, statistics'
    })
    return res.data.items || []
  }
}