import { FC } from 'react';
import { BsGithub, BsTwitter } from 'react-icons/bs';

import Bio from './Bio';
import { Copyright } from './Copyright';
import SnsLink from './SnsButton';

const Header: FC = () => {
  return (
    <div className="bg-stone-50 pt-4 text-stone-900 dark:bg-stone-900 dark:text-stone-50 sm:pt-10 lg:pt-12">
      <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="flex flex-col items-center border-t pt-6">
          <nav className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-start md:gap-6">
            <div
              className={
                'text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600'
              }
            >
              <Bio />
            </div>
          </nav>
          <div className="flex gap-4">
            <SnsLink
              url={'https://twitter.com/tqer39'}
              icon={<BsTwitter size="1.5rem" />}
            />
            <SnsLink
              url={'https://github.com/tqer39'}
              icon={<BsGithub size="1.5rem" />}
            />
          </div>
        </div>

        <div className="py-8 text-center text-sm text-gray-400">
          <Copyright />
        </div>
      </footer>
    </div>
  );
};

export default Header;
