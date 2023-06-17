import { FC } from 'react';

type BrandProps = {
  brand: string;
};

const Brand: FC<BrandProps> = ({ brand }) => {
  return (
    // text-2xl: テキストのサイズを2xlにする
    // md:text-4xl: mdサイズ以上の画面の時にテキストのサイズを4xlにする
    // font-bold: テキストの太さをboldにする
    // tracking-tight: 文字間を詰める
    // md:tracking-tighter: mdサイズ以上の画面の時に文字間をさらに詰める
    // leading-tight: 行間を詰める
    // mb-20: 下側のマージンを20にする
    // mt-8: 上側のマージンを8にする
    <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8">
      {brand}
    </h2>
  );
};

export default Brand;
