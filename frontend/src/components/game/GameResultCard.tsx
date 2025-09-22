'use client'

import { motion } from "framer-motion"
import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "../Avatar";
import Rematch from "./Rematch";

export default function({ref}: {ref: React.RefObject<HTMLDialogElement | null>}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(()=> {
        if (isOpen)
            dialogRef.current?.showModal();
        else
            dialogRef.current?.close();
    }, [isOpen]);

    const showDialog = ()=> {
        setIsOpen(true);
    };
    
    const closeDialog = ()=> {
        setIsOpen(false);
    };

    

    return (
        // <div>
        //     <button onClick={showDialog} className="py-1 px-2 rounded-[4px] bg-gray-600">Show Dialog</button>
          <motion.dialog ref={ref}
          className="bg-dark-blue border-[1px] border-gray-700 rounded-[8px] mx-auto my-auto px-8 pt-6 pb-10"
          > 
            {/* <button onClick={closeDialog} className="py-1 px-2 rounded-[4px] bg-gray-600">Close</button> */}
            <div className="w-154 h-full flex gap-4 items-end">

              <div className="flex-1 flex flex-col gap-2 items-center">
                <div>
                    <span className="text-gold text-5xl font-bold">Winner</span>
                </div>
                <div className="w-32">
                  <Avatar width={128} url="/avatars/avatar1.png" frame="gold2" />
                </div>
                <span className="bg-gray-700 px-3 py-1 rounded-[8px] border-1 border-gray-500 text-[16px] text-gray-50 font-bold">user_13445</span>
              </div>

              <div className="relative flex-1 flex flex-col gap-4 items-center self-center">
                <Rematch/>
              </div>

              <div className="flex-1 flex flex-col gap-2 items-center">
                <div>
                    <span className="invisible text-gold text-5xl font-bold">Winner</span>
                </div>
                <div className="w-32">
                  <Avatar width={128} url="/avatars/avatar1.png" frame="gold2" />
                </div>
                <div className="h-[34px] flex items-center pl-3 pr-1 gap-1 bg-gray-700  rounded-[8px] border-1 border-gray-500">
                    <span className=" text-[16px] text-gray-50 font-bold">user_13445
                    </span>
                    <Image src='/icons/add-friend.png' width={22} height={22} alt="Add friend" className="w-fit cursor-pointer" />

                </div>
              </div>

            </div>
          
          </motion.dialog>

        // </div>
    );
}