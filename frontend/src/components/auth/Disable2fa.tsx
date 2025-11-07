import { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { setegid, setSourceMapsEnabled } from 'process';
import { setEnvironmentData } from 'worker_threads';

interface qrCode {
  manualEntryKey: string;
  message: string;
  qrCode: string
}

interface Qrporps {
    qr: qrCode;
    onclose: () => void;
    onVerificationSuccess: () => void;
}


export default function QrMOdal ({qr, onclose, onVerificationSuccess}: Qrporps) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(qr.manualEntryKey);
    setCopied(true);
    toast.success('Key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    setIsVerifying(true);
    try {
      const response = await fetch('https://localhost:8080/api/auth/2fa/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
    'Content-Type': 'application/json', 
  },
        body: JSON.stringify({token : code }),
      });

      if (response.ok) {
        onVerificationSuccess();
        onclose();
      } else {
        toast.error('Invalid code. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className='bg-slate-800 p-5 rounded-xl relative max-w-2xl'>
      <button
        onClick={onclose}
        className='absolute top-3 right-3 text-gray-400 hover:text-white '
      >
        <X size={20} />
      </button>
      <div className='flex gap-4 mb-4'>
        {/* QR Code */}
        <div className='bg-white p-3 rounded-lg flex items-center justify-center'>
          <img
            src={qr.qrCode}
            alt='QR Code'
            className='w-40 h-40'
          />
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <label className='block text-xs font-medium text-gray-300 mb-2'>
            Manual key:
          </label>
          <div className='flex items-center gap-2'>
            <div className='flex-1 bg-gray-700 px-3 py-2.5 rounded-lg border border-gray-600'>
              <code className='text-purple text-xs font-mono break-all'>
                {qr.manualEntryKey}
              </code>
            </div>
            <button
              onClick={handleCopyKey}
              className='bg-gray-700 hover:bg-gray-600 p-2.5 rounded-lg border border-gray-600 transition-colors'
            >
              {copied ? (
                <Check size={18} className='text-green' />
              ) : (
                <Copy size={18} className='text-gray-400' />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-xs font-medium text-gray-300 mb-2'>
          Enter the 6-digit code:
        </label>
        <input
          type='text'
          maxLength={6}
          value={code}
          onChange={(e) => {
            const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
            setCode(numbersOnly);
          }}
          placeholder='000000'
          className='w-full px-3 py-2.5 bg-gray-700 text-white text-center text-xl font-mono tracking-widest rounded-lg border border-gray-600 outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all'
        />
      </div>

      <div className='flex gap-2'>
        <button
          onClick={onclose}
          className='flex-1 px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || isVerifying}
          className='flex-1 px-3 py-2.5 bg-purple hover:bg-light-purple disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors'
        >
          {isVerifying ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>
    </div>
  );
};