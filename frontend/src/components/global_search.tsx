

// <Modal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//         >
//           {/* Your modal content */}
//           <input
//             type='text'
//             onChange={(e) => {
//               onsearch_change(e.target.value.trim());
//             }}
//             placeholder='Username...'
//             className='w-full py-1.5 pl-3 pr-3 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-600'
//           />
//           {/* <p className='text-sm text-gray-500 mt-2'>Users list</p> */}

//           <div className='max-h-[60vh] overflow-y-auto'>
//           </div>
//         </Modal>




  // const [users, setusers] = useState<User[]>([]);
  // const [filteredUsers, setfilteredusers] = useState<User[]>([]);
  // const { user } = useAuth();
  // const [isLoading, setIsLoading] = useState<boolean>(false)
  // const [error, seterror] = useState<string | null>(null)
  // useEffect(() => {
  //   // setIsLoading(true)
  //   // seterror("")
  //   // setTimeout(()=>{}, 10000)
  //   fetch(`https://localhost:8080/api/users`)
  //   .then((res) => res.json())
  //   .then((u) => {
  //     if (u.status)
  //       setusers(u.users)
  //   })
  //   .catch((err) => console.log('users fetching failed because of: ', err));
  // }, []);
  // const onsearch_change = async (search_input: string) => {
  //   if (search_input && search_input.trim() && user) {
  //     setfilteredusers(
  //       users.filter((_user) =>
  //         _user.id != user.id &&
  //         _user.username.toLowerCase().includes(search_input.toLowerCase()))
  //     );
  //   } else setfilteredusers([]);
  // };






import { Eye, UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  avatar_url: string;
  online_status: number;
}

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

  // Fetch all users on component mount
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
        users.filter((_user) =>
          _user.id !== user.id &&
          _user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users, user]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleViewProfile = (id: number) => {
    router.push(`/profile/${id}`);
  }
  const handleAddFriend = async (user: User) => {
    try {
      
      setLoading(true);
      
      const response = await fetch("https://localhost:8080/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friend_id: user.id }),
      });
      
      console.log('friend_id :', user.id);
      if (response.ok) {
        toast.success(`Friend request sent to ${user.username}`);
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Search Users</h2>
        <button
          onClick={onClose}
          className=" text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search username..."
          className="w-full py-2 pl-4 pr-4 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-600 transition-colors"
        />
      </div>

      {/* Results Container */}
      <div className="max-h-[60vh] overflow-y-auto space-y-1">
        {isLoading && (
          <div className="text-center py-3 text-gray-400">
            Loading users...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && searchTerm && filteredUsers.length === 0 && (
          <div className="text-center  text-gray-400">
            No users found matching "{searchTerm}"
          </div>
        )}

        {!isLoading && !error && !searchTerm && (
          <div className="text-center py-2 text-gray-400">
            Start typing to search for users...
          </div>
        )}
        <div className="mt-6">

        {filteredUsers.map((chat) => (
          <div
          className="flex items-center my-1.5 justify-between w-full p-3 rounded-lg bg-slate-700 hover:bg-slate-800 transition-colors overflow-visible"
          key={chat.id}
          >
            {/* User Info */}
            <div className="flex items-center flex-1 min-w-0 space-x-2">
              <img
                src={chat.avatar_url}
                alt={chat.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                />
              <div className="flex flex-col min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">
                  {chat.username}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {chat.online_status === 1
                    ? 'Online'
                    : chat.online_status === 2
                    ? 'In Game'
                    : 'Offline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 flex-shrink-0 overflow-visible">
              {/* View Profile */}
              <div className="relative group">
                <button
                  onClick={() => {
                    toast.info(`Viewing ${chat.username}'s profile`);
                    handleViewProfile(chat.id);
                  }}
                  className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                  <Eye className="w-5 h-5" />
                </button>
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]">
                  View Profile
                </span>
              </div>

              {/* Add Friend */}
              <div className="relative group">
                <button
                  onClick={() => handleAddFriend(chat)}
                  className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                  >
                  <UserPlus className="w-5 h-5" />
                </button>
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-[60]">
                  Add Friend
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
