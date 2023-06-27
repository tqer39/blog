import { FC } from 'react';
import { BsGithub, BsTwitter } from 'react-icons/bs';
import { SiBiolink } from 'react-icons/si';

import { Copyright } from './Copyright';
import SnsLink from './SnsButton';

const Footer: FC = () => {
  return (
    <div className="bg-stone-50 pt-4 text-stone-900 dark:bg-stone-900 dark:text-stone-50 sm:pt-10 lg:pt-12">
      <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="flex flex-col items-center border-t pt-6">
          <div className="flex gap-4">
            <SnsLink
              url={'https://twitter.com/tqer39'}
              icon={<SiBiolink size="1.5rem" />}
            />
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

export default Footer;
