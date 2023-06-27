import { FC } from 'react';
import { BsGithub, BsTwitter } from 'react-icons/bs';
import { SiBiolink } from 'react-icons/si';

import { Copyright } from './Copyright';
import SnsLink from './SnsButton';

const Footer: FC = () => {
  return (
    <div className="border-stone-200  bg-stone-50 pt-4 text-stone-900 dark:border-stone-500 dark:bg-stone-900 dark:text-stone-50 sm:pt-10 lg:pt-12">
      <footer className="">
        <div className="flex flex-col items-center border-t  border-stone-200 pt-6  dark:border-stone-500">
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
        <div className="py-8 text-center text-sm text-stone-400">
          <Copyright />
        </div>
      </footer>
    </div>
  );
};

export default Footer;
