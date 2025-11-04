import { useEffect, useState } from "react";
import { toast } from "sonner";

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


  const toggle2FA = async () => {
    // setEnabled(true);
    setshowModal(true);
    console.log('dackchiiii');
    setLoading(true);
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

        <button
          type="button"
          // onClick={() => setEnabled(!enabled)}
          onClick={toggle2FA}
          disabled={loading} // Added a loading state to prevent double clicks.
          className={`${enabled ? "bg-green-500" : "bg-gray-400"
            } relative inline-flex h-8 w-16 items-center rounded-full transition`}
        >
          <span
            className={`${enabled ? "translate-x-9" : "translate-x-1"
              } inline-block h-6 w-6 transform rounded-full bg-white transition`}
          />
        </button>
      </div>

      {showModal && (
             <div
               className="fixed inset-0 bg-black/50 z-50 pt-5 flex justify-center items-center "
               onClick={() => setshowModal(false)}
             >
               <div
                 className="bg-slate-800 rounded-xl mx-2 w-[calc(100%-16px)] md:mx-0 md:w-full md:max-w-lg"
                 onClick={(e) => e.stopPropagation()}
               >
                 {/* <FriendList user={user} onchatselected={onSelect} onClose={() => {setshowModal(false)}} /> */}
               { showqr && <div className="bg-white p-4 rounded-lg">
                 <img
                   src={showqr.qrCode}
                   alt="QR Code"
                   className="mx-auto"
                   style={{ width: 256, height: 256 }}
                 />
               </div>}
               </div>
             </div>
           )}

    </>
  );
}