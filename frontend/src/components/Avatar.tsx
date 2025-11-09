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
    <div className='relative w-full aspect-square overflow-hidden rounded-full'>
      <div className='aspect-square overflow-hidden rounded-full m-[12%]'>
        <img
          width={width}
          height={width}
          src={url}
          alt='Avatar'
          className='w-full h-full object-cover'
        />
      </div>
      <img
        width={width}
        height={width}
        src={frame}
        alt='Frame'
        className='absolute inset-0 w-full h-full pointer-events-none object-contain'
      />
    </div>
  );
}
