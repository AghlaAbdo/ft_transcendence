import { Search } from "lucide-react";

export const Search_Input = () => {
    return <>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search imad conversations..."
              className="w-full py-3 pl-10 pr-4 bg-[#1F2937] text-white placeholder-gray-400 border border-gray-600 rounded-lg outline-none focus:border-purple-500"
            />
    </>
}