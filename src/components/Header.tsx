import Link from 'next/link';
import { FC } from 'react';

const Header: FC = () => {
  return (
    <div className="bg-white lg:pb-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <header className="flex items-center justify-between py-4 md:py-8">
          <a
            href="/"
            className="text-black-800 inline-flex items-center gap-2.5 text-2xl font-bold md:text-3xl"
            aria-label="logo"
          >
            tqer39's blog
          </a>
          <nav className="hidden gap-12 lg:flex">
            <Link
              href={'https://bento.me/tqer39'}
              target="_blank"
              className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
            >
              Bio
            </Link>
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Header;
