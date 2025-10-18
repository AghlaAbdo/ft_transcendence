import { useState } from "react";
import { toast } from "sonner";

export default function TwoFactorAuth() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  const toggle2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://localhost:8080/api/users/2fa', {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify( {enable : !enabled })
      });

      const data : {status: boolean, message: string} = await response.json();

      if (response.ok) {
        setEnabled(!enabled);
        toast.success(`${data.message}`);
      } else {
        toast.error('Failed to update 2FA status');
      }
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  }
  return (
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
        className={`${
          enabled ? "bg-green-500" : "bg-gray-400"
        } relative inline-flex h-8 w-16 items-center rounded-full transition`}
      >
        <span
          className={`${
            enabled ? "translate-x-9" : "translate-x-1"
          } inline-block h-6 w-6 transform rounded-full bg-white transition`}
        />
      </button>
    </div>
  );
}