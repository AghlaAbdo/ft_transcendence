'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import { useLayout } from '@/context/LayoutContext';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {

  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {

    try {
      const response = await fetch('https://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message);
        return;
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Network error during logout');
      console.error('Logout error:', error);
      // router.push('/login');
    }
  }

  const pathName = usePathname();
  const linkBase =
    'p-[14px] hover:[&>svg]:stroke-gray-50 flex items-center justify-center';
  const linkActive = 'bg-purple rounded-lg [&>svg]:stroke-gray-50';
  const { hideSidebar } = useLayout();
  return (
    <motion.nav
      initial={false}
      animate={{
        x: hideSidebar ? -72 : 0,
        opacity: hideSidebar ? 0 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      className={`z-11 bg-gray-800 py-4 pb-10 w-[72px] fixed top-0 left-0 h-full md:flex flex-col justify-between items-center`}
    >
      <div className='flex flex-col items-center gap-[70px] z-1000'>
        <Link href='/home'>
          <Image
            src="/logo2.png"
            alt="Logo"
            width={57}
            height={57}
            className="object-contain"
          />
        </Link>

        <div className='navLinks flex flex-col items-center gap-2'>
          <Link
            className={`${linkBase} ${((pathName == '/') || (pathName == '/home')) ? linkActive : ''}`}
            href='/'
          >
            {/* Dashboard Icon */}
            <svg
              width='22'
              height='22'
              viewBox='0 0 16 16'
              fill='none'
              stroke='#6B7280'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M2 2H7.33333V7.33333H2V2Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8.66667 2H14V7.33333H8.66667V2Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8.66667 8.66667H14V14H8.66667V8.66667Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M2 8.66667H7.33333V14H2V8.66667Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
          <Link
            className={`${linkBase} ${pathName.startsWith('/profile') ? linkActive : ''}`}
            href={user ? `/profile/${user.id}` : "/login"}
          >
            {/* Profile Icon */}
            <svg
              width='22'
              height='22'
              viewBox='0 0 16 16'
              fill='none'
              stroke='#6B7280'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12.6667 14V12.6667C12.6667 11.9594 12.3858 11.2811 11.8857 10.781C11.3856 10.281 10.7073 10 10 10H6.00004C5.2928 10 4.61452 10.281 4.11442 10.781C3.61433 11.2811 3.33337 11.9594 3.33337 12.6667V14'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8.00004 7.33333C9.4728 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.4728 2 8.00004 2C6.52728 2 5.33337 3.19391 5.33337 4.66667C5.33337 6.13943 6.52728 7.33333 8.00004 7.33333Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
          <Link
            className={`${linkBase} ${pathName.startsWith('/game') ? linkActive : ''}`}
            href='/game'
          >
            {/* Game Icon */}
            <svg
              width='22'
              height='22'
              viewBox='0 0 17 16'
              fill='none'
              stroke='#6B7280'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M4.66998 7.33333H7.33665'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M6.00331 6V8.66667'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M10.67 8H10.6766'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M12.67 6.66667H12.6766'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M12.2166 3.33333H5.12331C4.4635 3.33348 3.82717 3.57825 3.33734 4.0203C2.8475 4.46236 2.53895 5.07032 2.47131 5.72666C2.46731 5.76133 2.46465 5.79399 2.45998 5.82799C2.40598 6.27733 2.00331 9.63733 2.00331 10.6667C2.00331 11.1971 2.21403 11.7058 2.5891 12.0809C2.96417 12.4559 3.47288 12.6667 4.00332 12.6667C4.66998 12.6667 5.00332 12.3333 5.33665 12L6.27931 11.0573C6.52931 10.8073 6.86839 10.6667 7.22198 10.6667H10.118C10.4716 10.6667 10.8107 10.8073 11.0606 11.0573L12.0033 12C12.3366 12.3333 12.67 12.6667 13.3366 12.6667C13.8671 12.6667 14.3758 12.4559 14.7509 12.0809C15.1259 11.7058 15.3366 11.1971 15.3366 10.6667C15.3366 9.63666 14.934 6.27733 14.88 5.82799C14.8753 5.79466 14.8726 5.76133 14.8686 5.72733C14.8012 5.07087 14.4927 4.46275 14.0028 4.02055C13.513 3.57836 12.8766 3.3335 12.2166 3.33333Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
          <Link
            className={`${linkBase} ${pathName.startsWith('/chat') ? linkActive : ''}`}
            href='/chat'
          >
            {/*Chat Icon */}
            <svg
              width='22'
              height='22'
              viewBox='0 0 17 16'
              fill='none'
              stroke='#6B7280'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M14.67 10C14.67 10.3536 14.5295 10.6928 14.2795 10.9428C14.0294 11.1929 13.6903 11.3333 13.3366 11.3333H5.33665L2.66998 14V3.33333C2.66998 2.97971 2.81046 2.64057 3.06051 2.39052C3.31056 2.14048 3.64969 2 4.00332 2H13.3366C13.6903 2 14.0294 2.14048 14.2795 2.39052C14.5295 2.64057 14.67 2.97971 14.67 3.33333V10Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
          <Link
            className={`${linkBase} ${pathName.startsWith('/leaderboard') ? linkActive : ''}`}
            href='/leaderboard'
          >
            {/* Leaderboard Icon */}
            <svg
              width='22'
              height='22'
              viewBox='0 0 16 16'
              fill='none'
              stroke='#6B7280'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M5.33333 6V14H2.66667C2.31304 14 1.97391 13.8595 1.72386 13.6095C1.47381 13.3594 1.33333 13.0203 1.33333 12.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H5.33333Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M10.6667 4V14H5.33337V4C5.33337 3.64638 5.47385 3.30724 5.7239 3.05719C5.97395 2.80714 6.31309 2.66667 6.66671 2.66667H9.33337C9.687 2.66667 10.0261 2.80714 10.2762 3.05719C10.5262 3.30724 10.6667 3.64638 10.6667 4Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M14.6667 8V14H10.6667V8C10.6667 7.64638 10.8071 7.30724 11.0572 7.05719C11.3072 6.80714 11.6464 6.66667 12 6.66667H13.3333C13.687 6.66667 14.0261 6.80714 14.2761 7.05719C14.5262 7.30724 14.6667 7.64638 14.6667 8Z'
                strokeWidth='1.33333'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
        </div>
      </div>

      <div>
        <Link
          className={`${linkBase} ${pathName.startsWith('/settings') ? linkActive : ''}`}
          href='/settings'
        >
          {/* Settings Icon */}
          <svg
            width='22'
            height='22'
            viewBox='0 0 16 16'
            fill='none'
            stroke='#6B7280'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M8.14667 1.33331H7.85333C7.49971 1.33331 7.16057 1.47379 6.91053 1.72384C6.66048 1.97389 6.52 2.31302 6.52 2.66665V2.78665C6.51976 3.02046 6.45804 3.25011 6.34103 3.45254C6.22401 3.65497 6.05583 3.82307 5.85333 3.93998L5.56667 4.10665C5.36398 4.22367 5.13405 4.28528 4.9 4.28528C4.66595 4.28528 4.43603 4.22367 4.23333 4.10665L4.13333 4.05331C3.82738 3.87682 3.46389 3.82894 3.12267 3.92019C2.78145 4.01143 2.49037 4.23434 2.31333 4.53998L2.16667 4.79331C1.99018 5.09927 1.9423 5.46276 2.03354 5.80398C2.12478 6.1452 2.34769 6.43628 2.65333 6.61331L2.75333 6.67998C2.95485 6.79632 3.12241 6.96337 3.23937 7.16453C3.35632 7.3657 3.4186 7.59396 3.42 7.82665V8.16665C3.42093 8.40159 3.35977 8.63261 3.2427 8.83632C3.12563 9.04002 2.95681 9.20917 2.75333 9.32665L2.65333 9.38665C2.34769 9.56368 2.12478 9.85476 2.03354 10.196C1.9423 10.5372 1.99018 10.9007 2.16667 11.2066L2.31333 11.46C2.49037 11.7656 2.78145 11.9885 3.12267 12.0798C3.46389 12.171 3.82738 12.1231 4.13333 11.9466L4.23333 11.8933C4.43603 11.7763 4.66595 11.7147 4.9 11.7147C5.13405 11.7147 5.36398 11.7763 5.56667 11.8933L5.85333 12.06C6.05583 12.1769 6.22401 12.345 6.34103 12.5474C6.45804 12.7499 6.51976 12.9795 6.52 13.2133V13.3333C6.52 13.6869 6.66048 14.0261 6.91053 14.2761C7.16057 14.5262 7.49971 14.6666 7.85333 14.6666H8.14667C8.50029 14.6666 8.83943 14.5262 9.08948 14.2761C9.33953 14.0261 9.48 13.6869 9.48 13.3333V13.2133C9.48024 12.9795 9.54196 12.7499 9.65898 12.5474C9.77599 12.345 9.94418 12.1769 10.1467 12.06L10.4333 11.8933C10.636 11.7763 10.866 11.7147 11.1 11.7147C11.3341 11.7147 11.564 11.7763 11.7667 11.8933L11.8667 11.9466C12.1726 12.1231 12.5361 12.171 12.8773 12.0798C13.2186 11.9885 13.5096 11.7656 13.6867 11.46L13.8333 11.2C14.0098 10.894 14.0577 10.5305 13.9665 10.1893C13.8752 9.84809 13.6523 9.55701 13.3467 9.37998L13.2467 9.32665C13.0432 9.20917 12.8744 9.04002 12.7573 8.83632C12.6402 8.63261 12.5791 8.40159 12.58 8.16665V7.83331C12.5791 7.59837 12.6402 7.36734 12.7573 7.16364C12.8744 6.95994 13.0432 6.79079 13.2467 6.67331L13.3467 6.61331C13.6523 6.43628 13.8752 6.1452 13.9665 5.80398C14.0577 5.46276 14.0098 5.09927 13.8333 4.79331L13.6867 4.53998C13.5096 4.23434 13.2186 4.01143 12.8773 3.92019C12.5361 3.82894 12.1726 3.87682 11.8667 4.05331L11.7667 4.10665C11.564 4.22367 11.3341 4.28528 11.1 4.28528C10.866 4.28528 10.636 4.22367 10.4333 4.10665L10.1467 3.93998C9.94418 3.82307 9.77599 3.65497 9.65898 3.45254C9.54196 3.25011 9.48024 3.02046 9.48 2.78665V2.66665C9.48 2.31302 9.33953 1.97389 9.08948 1.72384C8.83943 1.47379 8.50029 1.33331 8.14667 1.33331Z'
              strokeWidth='1.33333'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z'
              strokeWidth='1.33333'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Link>

        <button
          type='button'
          onClick={handleLogout}
          className={`${linkBase} ${pathName === '/logout' ? linkActive : ''} block w-full`}

        >
          {/* Logout Icon */}
          <svg
            width='22'
            height='22'
            viewBox='0 0 16 16'
            fill='none'
            stroke='#6B7280'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M8 1.33331V7.99998'
              strokeWidth='1.33333'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M12.2667 4.40002C13.1044 5.2381 13.6753 6.30547 13.9072 7.46755C14.1391 8.62962 14.0218 9.83435 13.5699 10.9298C13.118 12.0253 12.3519 12.9624 11.3681 13.623C10.3844 14.2836 9.22703 14.6381 8.04204 14.6419C6.85705 14.6456 5.6975 14.2983 4.70961 13.6439C3.72173 12.9894 2.94975 12.0571 2.49103 10.9645C2.03231 9.87191 1.9074 8.66794 2.13205 7.50443C2.35669 6.34093 2.92084 5.26999 3.75333 4.42669'
              strokeWidth='1.33333'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
        {/* <Link
          href='/logout'
        >
        </Link> */}
      </div>
    </motion.nav>
  );
}
