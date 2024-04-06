import axios from 'axios';
import { ITopHeadlineRes, ITopHeadlineReq } from './types/news';

export const getTopHeadline = async (
  params: ITopHeadlineReq,
): Promise<ITopHeadlineRes> => {
  return (await axios.get('https://newsapi.org/v2/everything', { params }))
    .data;
};
