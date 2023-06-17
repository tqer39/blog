import { FC } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import Brand from './Brand';
import Bio from './Bio';

const Header: FC = () => {
  return (
    <>
      <div className="bg-white dark:bg-black lg:pb-12">
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
            <div className="inline-flex text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8 text-black-800 dark:text-white-800">
              <Brand brand={"tqer39's blog"} />
            </div>
            <nav className="hidden lg:flex text-lg mb-8 font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700">
              <Bio />
            </nav>
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
