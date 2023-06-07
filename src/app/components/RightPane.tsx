import { FC } from 'react';
import Avatar from './Avatar';
import Profile from './Profile';
import getGravatarUrl from '../utils/gravatar';

const RightPane: FC = () => {
  const email = process.env.NEXT_PUBLIC_GRAVATAR_EMAIL_ADDRESS || '';
  const avatarUrl = getGravatarUrl(email);

  return (
    <div className="right-pane">
      <Avatar avatarUrl={avatarUrl} />
      <Profile name="tqer39" bio="プロフィールほげほげ" />
    </div>
  );
};

export default RightPane;
