import { FC } from 'react';
import Image from 'next/image';

interface AvatarProps {
  avatarUrl: string;
}

const Avatar: FC<AvatarProps> = ({avatarUrl}) => {
  return (
    <Image
      src={avatarUrl}
      alt={'avatar'}
      width={80}
      height={80}
      className="rounded-full overflow-hidden w-20 h-20"
    />
  );
};

export default Avatar;
