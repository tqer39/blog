import gravatar from 'gravatar';

export const getGravatarUrl = (email: string): string => {
  const options = {
    s: '200',
    r: 'pg',
    d: 'mm',
  };

  return gravatar.url(email, options, true);
}
