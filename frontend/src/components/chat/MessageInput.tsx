import { useEffect, useState, useRef } from 'react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { Send, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface SendMessageProps {
  onSendMessage: (SendMesage: string) => void;
}

const MAX_MESSAGE_LENGTH = 1000;

export const MessageInput = ({ onSendMessage }: SendMessageProps) => {
  const [isopen, setopen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (!emojiData?.emoji) return;
    
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const emoji = emojiData.emoji;
    
    const newMessage = 
      message.substring(0, start) + 
      emoji + 
      message.substring(end);
      setMessage(newMessage);
      input.focus();
      const newPos = start + emoji.length;
      input.setSelectionRange(newPos, newPos);
    setopen(false);
  };

  
  useEffect(()=> {
    if (inputRef.current)
      inputRef.current.focus();
  },[])

  const handleSendMessage = () => {
    const msg = message.trim();
    if (msg) {
      if (msg.length > MAX_MESSAGE_LENGTH) {
        toast.warning('message too long, try some thing smaller!');
        return;
      }
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    if (!isopen) return;
    const handleEsckey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setopen(false);
    };
    document.addEventListener('keydown', handleEsckey);
    return () => {
      document.removeEventListener('keydown', handleEsckey);
    };
  }, [isopen]);

  return (
    <>
      <div className="p-4 relative">
        {isopen && (
          <>
            <div
              onClick={() => setopen(false)}
              className="fixed inset-0 transition-opacity duration-200 ease-out opacity-100"
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-full mb-2 right-4 z-50
                rounded-xl overflow-hidden shadow-2xl
                bg-[#1F2937]
                [&_.EmojiPickerReact]:!bg-[#1F2937]
                [&_.epr-search]:!bg-[#111827]
                [&_.epr-search]:!border-gray-600
                [&_*::-webkit-scrollbar]:hidden
                [&_*]:scrollbar-none
                transform transition-all duration-200 ease-out
                ${isopen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'}`}
            >
              <EmojiPicker 
                width={500} 
                height={400} 
                theme={Theme.DARK}
                onEmojiClick={handleEmojiClick}
              />
            </div>
          </>
        )}
        <div
          className="flex items-center bg-[#1F2937] rounded-2xl px-4 py-2.5 shadow-sm
            border border-gray-600 transition-all duration-200
            focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 
              outline-none text-sm"
          />
          <button
            onClick={() => setopen(true)}
            className="ml-3 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Smile size={20} />
          </button>
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-purple-600 hover:bg-purple-700 active:scale-95 
              rounded-full p-2 transition-all shadow-md"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
