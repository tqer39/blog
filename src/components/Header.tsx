import { FC } from 'react';

import Bio from './Bio';
import Brand from './Brand';
import ThemeSwitcher from './ThemeSwitcher';

const Header: FC = () => {
  return (
    <>
      <div className=" bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-50 lg:pb-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <header className="flex items-center justify-between py-4 md:py-8">
            {/*
            text-2xl: テキストのサイズを2xlにする
            md:text-4xl: mdサイズ以上の画面の時にテキストのサイズを4xlにする
            font-bold: テキストの太さをboldにする
            tracking-tight: 文字間を詰める
            md:tracking-tighter: mdサイズ以上の画面の時に文字間をさらに詰める
            leading-tight: 行間を詰める
            mb-20: 下側のマージンを20にする
            mt-8: 上側のマージンを8にする
          */}
            <div className="mb-20 mt-8 inline-flex text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
              <Brand brand={"tqer39's blog"} />
            </div>
            <div className="-ml-8 hidden flex-col gap-2.5 sm:flex-row sm:justify-center lg:flex lg:justify-start">
              <ThemeSwitcher />
            </div>
          </header>
        </div>
      </div>
    </>
  );
};

export default Header;
