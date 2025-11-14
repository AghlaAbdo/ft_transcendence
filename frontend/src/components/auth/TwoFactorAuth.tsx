import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Disable2fa from './Disable2fa';
import QrModal from './QrModal';

interface qrCode {
  manualEntryKey: string;
  message: string;
  qrCode: string;
}

export default function TwoFactorAuth() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean>(
    user?.is_2fa_enabled || false
  );
  const [showModal, setshowModal] = useState<boolean>(false);
  const [showqr, setshowqr] = useState<qrCode | null>();
  const [showdisableModal, setshowdisable] = useState<boolean>(false);

  useEffect(() => {
    if (user && enabled !== user.is_2fa_enabled) {
      setEnabled(user.is_2fa_enabled);
    }
  }, [user]);

  const handleToggleChange = async () => {
  if (!user) return;
  
  if (!enabled) {
    try {
      await fetchQRCode();
    } catch (error) {
      toast.error('Failed to enable 2FA. Please try again.');
    }
  } else {
    setshowdisable(true);
  }
};

  const fetchQRCode = async () => {
    try {
      const response = await fetch(
        `/api/auth/2fa/setup`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data: qrCode = await response.json();
        setshowqr(data);
        setshowModal(true);
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('Failed to setup 2FA');
    }
  };

  const handledisable = () =>{
    setEnabled(false);
    setshowdisable(false);
    toast.success('2FA disabled successfully!');
  }
  const handleVerificationSuccess = () => {
    setEnabled(true);
    setshowModal(false);
    setshowqr(null);
    toast.success('2FA enabled successfully!');
  };

  return (
    <>
      <div className='rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-md flex items-center justify-between'>
        <div>
          <h3 className='text-2xl font-bold text-white'>
            Two-Factor Authentication
          </h3>
          <p className='text-gray-400 text-lg'>
            Add an extra layer of security to your account
          </p>
        </div>

        <label className='flex cursor-pointer select-none items-center'>
          <div className='relative'>
            <input
              type='checkbox'
              checked={enabled}
              onChange={handleToggleChange}
              className='sr-only'
            />
            <div
              className={`box block h-8 w-14 rounded-full ${
                enabled ? 'bg-green-500' : 'bg-slate-600'
              }`}
            ></div>
            <div
              className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                enabled ? 'translate-x-full' : ''
              }`}
            ></div>
          </div>
        </label>

      </div>

      {showModal && showqr && (
        <div
          className='fixed inset-0 bg-black/50 z-50 pt-5 flex justify-center items-center'
          onClick={() => setshowModal(false)}
        >
          <div
            className='bg-slate-800 rounded-xl mx-2 w-[calc(100%-16px)] md:mx-0 md:w-full md:max-w-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <QrModal
              onclose={() => setshowModal(false)}
              qr={showqr}
              onVerificationSuccess={handleVerificationSuccess}
            />
          </div>
        </div>
      )}

      {showdisableModal && (
        <div
          className='fixed inset-0 bg-black/50 z-50 pt-5 flex justify-center items-center'
          onClick={() => setshowdisable(false)}
        >
          <div
            className='bg-slate-800 rounded-xl mx-2 w-[calc(100%-16px)] md:mx-0 md:w-full md:max-w-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <Disable2fa
            onclose={() => setshowdisable(false)}
            handledisable={handledisable}
            />
          </div>
        </div>
      )}
    </>
  );
}
