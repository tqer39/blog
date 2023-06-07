import gravatar from 'gravatar';

const getGravatarUrl = (email: string) => {
  const options = {
    s: '200',
    r: 'pg',
    d: 'mm',
  };

  return gravatar.url(email, options, true);
};

export default getGravatarUrl;
