import { MoreVertical } from "lucide-react";
export const HeaderInfos = () => {
  return (
    <>
      <div className="flex py-2.5 px-5 items-center rounded-t-[20px] bg-[#1F2937]">
        {/* chat header infos */}
        {/* here to put the name and online status */}

        <img
          src="/avatars/avatar6.png"
          alt="Imad"
          className="w-12 h-12 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold"> user_name</h3>
              <p className="text-sm text-gray-400 truncate">Online</p>
            </div>
            <div>
              <button className="cursor-pointer">
                <MoreVertical />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
