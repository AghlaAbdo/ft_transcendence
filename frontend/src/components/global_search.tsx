
import { useEffect, useState } from 'react';
import { Eye, Loader2, Search, UserPlus, X } from 'lucide-react';
import { User, useAuth } from '@/hooks/useAuth';
import UserCard from './User_card';

interface GlobalSearchProps {
  onClose: () => void;
}

export const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://localhost:8080/api/users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status) {
          setUsers(data.users);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm && searchTerm.trim() && user) {
      setFilteredUsers(
        users.filter(
          (_user) =>
            _user.id !== user.id &&
            _user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users, user]);

  return (
    <div className='py-1 flex flex-col rounded-xl border border-slate-700'>
      {/* Search Header */}
      <div className='flex items-center justify-between px-5 py-1'>
        <h2 className='text-xl font-medium text-white'>Search Users</h2>
        <button
          onClick={onClose}
          className='text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200'
          aria-label='Close search'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      {/* Search Input */}
      <div className='px-5 py-1.5'>
        <div className='relative group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search username...'
            className='w-full py-2 pl-11 pr-4 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 z-[1]'
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              aria-label='Clear search'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      {/* Results Container */}
      <div className='flex-1 overflow-y-auto px-5 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden'>
        {isLoading && (
          <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
            <Loader2 className='w-8 h-8 animate-spin mb-3' />
            <p className='text-sm'>Searching users...</p>
          </div>
        )}

        {error && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3'>
                {error}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && searchTerm && filteredUsers.length === 0 && (
          <div className='flex items-center justify-center py-2'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center'>
                <Search className='w-8 h-8 text-gray-500' />
              </div>
              <p className='text-gray-400 text-sm'>
                No users found matching{' '}
                <span className='text-white font-medium'>"{searchTerm}"</span>
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && !searchTerm && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center'>
                <Search className='w-8 h-8 text-gray-500' />
              </div>
              <p className='text-gray-400 text-sm'>
                Start typing to search for users
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <div className='mt-3 space-y-1 max-h-64 '>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className='animate-in fade-in slide-in-from-bottom-2 duration-200'
              >
                <UserCard _user={user} onClose={onClose} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
