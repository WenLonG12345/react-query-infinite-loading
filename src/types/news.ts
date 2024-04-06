export type ITopHeadline = {
  source: {
    id: string;
    name: string;
  }
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export type ITopHeadlineReq = {
  page: number;
  pageSize: number;
  apiKey: string;
}

export type ITopHeadlineRes = {
  status: string;
  totalResults: number;
  articles: ITopHeadline[];
}