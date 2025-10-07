

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

interface User {
  id: number;
  username: string;
  avatar_url: string;
  online_status: number;
}

interface Notification_props {
  onClose: () => void;
}

export const Notification = ({ onClose }: Notification_props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all users on component mount
//   useEffect(() => {
//     const fetchUsers = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(`https://localhost:8080/api/users`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.status) {
//           setUsers(data.users);
//         } else {
//           setError('Failed to load users');
//         }
//       } catch (err) {
//         setError('Network error. Please try again.');
//         console.error('API Error:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

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

  return (
    <div className="space-y-3">
        <span className="">No notifications for you!</span>
    </div>
  );
};
