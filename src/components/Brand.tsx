import Link from 'next/link';
import { FC } from 'react';

type BrandProps = {
  brand: string;
};

const Brand: FC<BrandProps> = ({ brand }) => {
  return (
    <>
      <Link href="/" aria-label="logo" className={'hover:underline'}>
        {brand}
      </Link>
      .
    </>
  );
};

export default Brand;
