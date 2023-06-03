import { FC } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar: FC<AvatarProps> = ({ src, alt }) => {
  return (
    <div className="rounded-full overflow-hidden w-20 h-20">
      <Image src={src} alt={alt} width={80} height={80} />
    </div>
  );
};

export default Avatar;
