import { FC } from 'react';
import Avatar from './Avatar';
import Profile from './Profile';

const RightPane: FC = () => {
  return (
    <div className="right-pane">
      <Avatar />
      <Profile name='tqer39' bio='プロフィールほげほげ' />
    </div>
  );
};

export default RightPane;
