import { useEffect, useState } from "react";
import { Smile, Send } from "lucide-react";

interface SendMessageProps {
  onSendMessage: (SendMesage: string) => void;
}

const MAX_MESSAGE_LENGTH = 1000;

export const MessageInput = ({onSendMessage}: SendMessageProps) => {
  const [message, setMessage] = useState<string>("");
  const handleSendMessage = () => {
    const msg = message.trim();
    if (msg) {
      // if (msg.length > 1000)
        // handle it here
      onSendMessage(message);
      setMessage("");
    }
  };
  return (
    <>
      <div className="p-4">
        <div
          className="flex items-center bg-[#1F2937] rounded-2xl px-4 py-2.5 shadow-sm
               border border-gray-600  transition-all duration-200
               focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 
                 outline-none text-sm"
          />
          <button className="ml-3 text-gray-400 hover:text-gray-200 transition-colors">
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

// this evening no coffee okey ?