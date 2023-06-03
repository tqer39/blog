import { FC } from 'react';

interface ProfileProps {
  name: string;
  bio: string;
}

const Profile: FC<ProfileProps> = ({ name, bio }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>{bio}</p>
    </div>
  );
};

export default Profile;
