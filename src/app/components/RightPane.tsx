import { FC } from 'react';
import Avatar from './Avatar';
import Profile from './Profile';
import getGravatarUrl from '../utils/gravatar';

const RightPane: FC = async () => {
  const email = process.env.GRAVATAR_EMAIL_ADDRESS || '';
  const avatarUrl = await getGravatarUrl(email);

  return (
    <div className="right-pane">
      <Avatar avatarUrl={avatarUrl} />
      <Profile name="tqer39" bio="プロフィールほげほげ" />
    </div>
  );
};

export default RightPane;
