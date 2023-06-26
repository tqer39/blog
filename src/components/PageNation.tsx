import Link from 'next/link';
import { FC } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import pagination, { PageInfo } from '@/lib/pagination';

type PaginationProps = {
  articles: number;
  current: number;
  last: number;
  perPage: number;
};

const Pagination: FC<PaginationProps> = ({
  articles,
  current,
  last,
  perPage,
}) => {
  const pageInfo: PageInfo = pagination(current, last);

  return (
    <div className="flex items-center justify-between border-t bg-stone-50 px-4 py-3 text-stone-900 dark:bg-stone-900 dark:text-stone-50 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {current === 1 ? 1 : current * perPage - (perPage - 1)}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {current * perPage < articles ? current * perPage : articles}
            </span>{' '}
            of <span className="font-medium">{articles}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <a
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </a>
            {pageInfo.length > 0 ? (
              pageInfo.map((page) => {
                if (page === '...') {
                  return (
                    <div
                      key={page}
                      className="relative z-10 inline-flex cursor-pointer items-center px-4 py-2 text-sm font-semibold text-white focus:z-20 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {page}
                    </div>
                  );
                } else {
                  return (
                    <Link
                      key={page}
                      href={`/articles/${page}`}
                      className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {page}
                    </Link>
                  );
                }
              })
            ) : (
              <div>no data</div>
            )}
            <a
              href="#"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
