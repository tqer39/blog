import React from 'react';

export const Copyright: React.FC = () => {
  const year = new Date().getFullYear();
  return <p>&copy; {year} My Blog</p>;
};
