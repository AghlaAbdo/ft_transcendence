import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLayout } from "@/context/LayoutContext";

export default function(){
    const [rematch, setRematch] = useState<"sent" | "accepted" | "rejected" | "recived" | null>(null);
    const [dots, setDots] = useState("");
    const {setHideHeaderSidebar} = useLayout();

    useEffect(() => {
        const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
        }, 500);
        return () => {
            clearInterval(interval);
            setHideHeaderSidebar(false);
        }
    }, []);

    const handleRematch = ()=> {
        console.log("rematch!!");
        setRematch("recived");
        // setTimeout(()=>setRematch("sent"), 3000);
        // setTimeout(()=>setRematch("rejected"), 6000);
        // setTimeout(()=>setRematch("accepted"), 9000);
    };


    return (<>
        {!rematch && ( <>
            <button onClick={handleRematch} className="w-full max-w-30 text-center bg-green py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold cursor-pointer">Rematch</button>
            <Link href='/game' className="w-full max-w-30 text-center bg-red py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold">Return</Link>
        </>)}
        {rematch === "recived" && ( <>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-[18px] text-pink text-center font-bold w-89 absolute bottom-[-36px] right-auto left-auto">
                <span className="font-bold text-gold">user_9823</span> Wants to play again!
            </motion.span>
            <button onClick={handleRematch} className="w-full max-w-30 text-center bg-green py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold cursor-pointer">Rematch</button>
            <Link href='/game' className="w-full max-w-30 text-center bg-red py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold">Return</Link>
        </>)}
        {rematch === 'sent' && (<>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-2xl text-pink font-bold w-full max-w-32">
                Waiting for response{dots}
            </motion.span>
            <Link href='/game' className="w-full max-w-30 text-center bg-red py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold">Return</Link>
        </>)}
        {rematch === "accepted" && (<>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-3xl text-gold text-center font-bold">
                Challenge Accpeted!
            </motion.span>
        </>)}
        {rematch === "rejected" && (<>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-2xl text-red text-center font-bold">
                Request Rejected
            </motion.span>
            <Link href='/game' className="w-full max-w-30 text-center bg-red py-1 px-2 rounded-[8px] text-[20px] text-gray-50 font-bold">Return</Link>
        </>)}
    </>);
}