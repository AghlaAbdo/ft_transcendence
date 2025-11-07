import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QrModal from "./QrModal"
import Switcher4 from "../toggle_button";

interface qrCode {
  manualEntryKey: string;
  message: string;
  qrCode: string
}

export default function TwoFactorAuth() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setshowModal] = useState<boolean>(false);
  const [showqr, setshowqr] = useState<qrCode>();


  const handlechange = () => {

  }
  const toggle2FA = async () => {
    setshowModal(true);
    // if (showqr)
    //     return ;
    // setLoading(true);
    try {
      const response = await fetch('https://localhost:8080/api/auth/2fa/setup', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data: qrCode = await response.json();
        console.log('data: ', data);
        setshowqr(data);
        //  setUser(data.user);
      } else {
        console.log('error in 2fa setup');
        //  router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      //  router.push('/login');
    } finally {
      //  setIsLoading(false);
    }
  };
  return (
    <>
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-md flex items-center justify-between">

        <div>
          <h3 className="text-2xl font-bold text-white">Two-Factor Authentication</h3>
          <p className="text-gray-400 text-lg">
            Add an extra layer of security to your account
          </p>
        </div>


    {/* <Switcher4 /> */}

      <label className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            type='checkbox'
            // checked={enabled}
            // onChange={setEnabled(!enabled)}
            className='sr-only'
          />
          <div
            className={`box block h-8 w-14 rounded-full ${
              enabled ? 'bg-primary' : 'bg-gray-300'
            }`}
          ></div>
          <div
            className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 transition ${
              enabled ? 'translate-x-full' : ''
            }`}
          ></div>
        </div>
      </label>
    
      {/* <Switcher4 isChecked={enabled}/> */}

      </div>

      {showModal && showqr && (
             <div
               className="fixed inset-0 bg-black/50 z-50 pt-5 flex justify-center items-center "
               onClick={() => setshowModal(false)}
             >
               <div
                 className="bg-slate-800 rounded-xl mx-2 w-[calc(100%-16px)] md:mx-0 md:w-full md:max-w-lg"
                 onClick={(e) => e.stopPropagation()}
               >
                <QrModal onclose={()=>setshowModal(false)} qr={showqr}/>
                 {/* <FriendList user={user} onchatselected={onSelect} onClose={() => {setshowModal(false)}} /> */}
               {/* { showqr } */}
               </div>
             </div>
           )}
    </>
  );
}