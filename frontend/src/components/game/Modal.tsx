import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-[rgba(0,_0,_0,_0.5)] flex items-center justify-center z-50'>
      <div className='bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-gray-100 text-2xl'>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
