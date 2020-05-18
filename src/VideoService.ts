import { readFileSync } from 'fs'
import {google, youtube_v3} from 'googleapis'

import Video from './Video'
import YouTubeConnection from './YouTubeConnection'

const API_KEY = 'YOUR API KEY'

export default class VideoService {
  async videoList(): Promise<string> {
    const videoList: Video[] = JSON.parse(readFileSync('videos.json', 'utf8'))
    const ids = videoList.map((v: any) => v.youtube_id)
    const items = await this.listVideos(ids)
    ids.forEach((id: string) => {
      const video = videoList.find(v => id === v.youtube_id)
      if (!video) return
      const youtubeRecord = items.find(v => id === v.id)
      if (!youtubeRecord) return
      const viewCount = this.getViewCount(youtubeRecord)
      video.views = parseInt(viewCount, 10)
      const publishedAt = this.getPublishedAt(youtubeRecord)
      const daysAvailable = Date.now() - Date.parse(publishedAt)
      video.monthlyViews = video.views ? (video.views * 365.0/daysAvailable/12) : 0
    })

    return JSON.stringify(videoList)
  }

  private getViewCount(youtubeRecord?: youtube_v3.Schema$Video): string {
    return (youtubeRecord && youtubeRecord.statistics && youtubeRecord.statistics.viewCount) || "0";
  }

  private getPublishedAt(youtubeRecord?: youtube_v3.Schema$Video): string {
    return (youtubeRecord && youtubeRecord.snippet && youtubeRecord.snippet.publishedAt) || new Date().toLocaleString()
  }

  async listVideos(ids: Video[]): Promise<youtube_v3.Schema$Video[]> {
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