import gravatar from 'gravatar';

export const getGravatarUrl = async (email: string) => {
  const options = {
    s: '200',
    r: 'pg',
    d: 'mm',
  };

  return gravatar.url(email, options, true);
}
