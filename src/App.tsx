import { useInfiniteQuery } from '@tanstack/react-query';
import { getTopHeadline } from './api';
import './App.css';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useInView } from 'react-intersection-observer';

function App() {
  const [searchTerms, setSearchTerms] = useState('news');
  const debouncedSearchTerms = useDebounce(searchTerms, 500);

  const queryParams = {
    pageSize: 15,
    apiKey: import.meta.env.VITE_API_KEY,
    q: debouncedSearchTerms,
  };

  const articleQuery = useInfiniteQuery({
    queryKey: ['headlines', queryParams],
    queryFn: ({ pageParam }) =>
      getTopHeadline({
        page: pageParam,
        ...queryParams,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const allData = allPages.map((a) => a.articles).flat();

      if (allData.length >= lastPage.totalResults) return undefined;

      return allPages.length + 1;
    },
  });

  const isDataLoading =
    articleQuery.isLoading ||
    articleQuery.isFetchingNextPage ||
    articleQuery.fetchStatus === 'fetching';

  const initialLoading =
    articleQuery.isFetching && !articleQuery.isFetchingNextPage;

  const totalArticles = (articleQuery.data?.pages ?? [])
    .flat()
    .map((i) => i.articles)
    .flat();

  const { inView, ref } = useInView({
    threshold: 0.9,
    skip: isDataLoading || !articleQuery.hasNextPage,
    delay: 500,
  });

  useEffect(() => {
    if (articleQuery.isError) return;
    if (isDataLoading) return;
    if (totalArticles.length === 0) return;
    if (inView) {
      articleQuery.fetchNextPage();
    }
  }, [inView, articleQuery.isError, isDataLoading]);

  return (
    <div>
      <div className="sticky top-0 flex flex-col gap-2 px-2 py-4 bg-black rounded-md search-container">
        <h2>Search Anything on News</h2>
        <input
          className="w-full p-2 text-black bg-gray-400 rounded-md outline-primary"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto news-container">
        {totalArticles.length === 0 ? (
          <div className="loader-container">
            {initialLoading ? (
              <div className="loader" />
            ) : (
              <div>No articles at this moment</div>
            )}
          </div>
        ) : (
          totalArticles
            .filter((a) => a.content !== '[Removed]')
            ?.map((article) => (
              <div
                key={article.title}
                className="flex flex-row gap-2 px-2 py-4 my-2 bg-gray-700 rounded-md cursor-pointer md:gap-4"
                onClick={() => window.open(article.url, '_blank', 'noreferrer')}
              >
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-[120px] min-w-[120px] md:w-[250px] md:min-w-[250px] object-contain"
                />
                <div className="flex flex-col gap-2">
                  <div className="font-semibold line-clamp-3">
                    {article.title}
                  </div>
                  <div className="text-sm text-gray-400 line-clamp-3">
                    {article.description}
                  </div>
                  <div className="text-sm text-gray-400">
                    {dayjs(article.publishedAt).format('YYYY/MM/DD HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))
        )}

        <span ref={ref} />

        {totalArticles.length !== 0 && (
          <div className="loader-container">
            {isDataLoading ? (
              <div className="loader" />
            ) : articleQuery.hasNextPage ? (
              <div>No more articles at this moment</div>
            ) : (
              <button className="" onClick={() => articleQuery.fetchNextPage()}>
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
