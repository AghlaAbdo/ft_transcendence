interface NoChatsProps {
  isSearching: boolean;
}

export const NoChats = ({ isSearching }: NoChatsProps) => {
  return (
    <div className='text-center'>
      <div className='mb-4'>
        {isSearching ? (
          // Search icon for "no results" state
          <svg
            className='mx-auto h-16 w-16 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        ) : (
          // Chat bubble icon for "no chats" state
          <svg
            className='mx-auto h-16 w-16 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            />
          </svg>
        )}
      </div>
      <h3 className='text-lg font-semibold text-gray-300 mb-2'>
        {isSearching ? 'No Friends or Chats Found' : 'No Chats Yet'}
      </h3>
      <p className='text-sm text-gray-500'>
        {isSearching
          ? 'Try searching with a different name'
          : 'Search for friends above to start chatting'}
      </p>
    </div>
  );
};
