import { useState } from "react";

export default function TwoFactorAuth() {
  const [enabled, setEnabled] = useState(false);

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
        onClick={() => setEnabled(!enabled)}
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