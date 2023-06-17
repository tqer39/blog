import { FC } from 'react';

export const Copyright: FC = () => {
  const year = new Date().getFullYear();
  return <p>&copy; {year} blog, tqer39. All rights reserved.</p>;
};
