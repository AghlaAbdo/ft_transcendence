import { Search } from "lucide-react";
// import {useState, useEffect} from 'react'

interface search_props {
  onsearchchange_2: () => void;
  searchquery_2: string;
}
export const Search_Input = ({onsearchchange_2, searchquery_2}: search_props) => {
    return <>
    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              // onChange={(e)=>{SetSearchQuery(e.target.value)}}
              placeholder="Search or start conversation..."
              className="w-full py-2 pl-10 pr-4 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-600"
            />
    </>
}