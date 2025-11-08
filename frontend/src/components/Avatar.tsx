import Image from 'next/image';

export default function Avatar({
  width,
  url,
  frame,
}: {
  width: number;
  url: string;
  frame: string;
}) {
  return (
    <div className={`w-full relative`}>
      <Image
        width={width}
        height={width}
        src={url}
        alt='Avatar'
        className='w-full rounded-full p-[12%]'
        unoptimized
      />
      <Image
        width={width}
        height={width}
        src={`/frames/${frame}.png`}
        alt='Frame'
        className='absolute inset-0 w-full pointer-events-none'
      />
    </div>
  );
}
