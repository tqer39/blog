import { FC, useEffect, useState } from 'react';
import { getGravatarUrl } from '../utils/gravatar';
import Image from 'next/image';

const Avatar: FC = () => {
  const email = process.env.NEXT_PUBLIC_GRAVATAR_EMAIL_ADDRESS || '';
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const fetchGravatarUrl = async () => {
      const gravatarUrl = await getGravatarUrl(email); // getGravatarUrlはGravatarのURLを生成する非同期関数
      setSrc(gravatarUrl);
    };
    fetchGravatarUrl();
  }, [email]);

  return (
    <div className="rounded-full overflow-hidden w-20 h-20">
      {src && (
        <Image src={src} alt={'avatar'} width={80} height={80} priority />
      )}
    </div>
  );
};

export default Avatar;
