import Link from 'next/link';
import React, { FC } from 'react';

type SnsLinkProps = {
  icon: React.JSX.Element;
  url: string;
};

const SnsLink: FC<SnsLinkProps> = ({ icon, url }) => {
  return (
    <>
      <Link
        href={url}
        passHref
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-400 transition duration-300 hover:text-stone-500 active:text-stone-600 dark:text-stone-500 dark:duration-300 hover:dark:text-stone-400"
      >
        {icon}
      </Link>
    </>
  );
};

export default SnsLink;
