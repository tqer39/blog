import { FC } from 'react';
import { getGravatarUrl } from '../utils/gravatar';
import Avatar from './Avatar';

const RightPane: FC = () => {
  const email = process.env.GRAVATAR_EMAIL_ADDRESS || '';
  const avatarUrl = getGravatarUrl(email);

  return (
    <div className="right-pane">
      <Avatar src={avatarUrl} alt={'avatar'} />
    </div>
  );
};

export default RightPane;
