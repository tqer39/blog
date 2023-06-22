'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import { BlogPost } from '@/lib/notion';

type Props = {
  article: BlogPost[0];
};

const BlogCard: FC<Props> = ({ article }) => {
  return (
    <>
      <Link
        href={`/article/${article.article_id}`}
        passHref
        className="group overflow-hidden rounded-xl"
      >
        <div className="sm:flex">
          <div className="relative h-44 w-full flex-shrink-0 overflow-hidden rounded-xl sm:w-56">
            <Image
              className="absolute left-0 top-0 h-full w-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Image Description"
            />
          </div>
          <div className="mt-4 grow px-4 sm:ml-6 sm:mt-0 sm:px-0">
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-gray-300 dark:group-hover:text-white">
              {article.title}
            </h3>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Produce professional, reliable streams easily leveraging
              innovative broadcast studio
            </p>
            <p className="mt-4 inline-flex items-center gap-x-1.5 font-medium text-blue-600 decoration-2 hover:underline">
              Read more
              <svg
                className="h-2.5 w-2.5"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </p>
          </div>
        </div>
      </Link>
    </>
  );
};

export default BlogCard;
