import { Menu } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";

export default function MobileSidebarToggle() {
  const { hideSidebar, hideHeaderSidebar, setHideSidebar } = useLayout();

  if (hideHeaderSidebar)
    return <></>

  return (
    <div className="fixed top-0 w-[72px] bg-bg-color z-10 flex justify-center items-center h-[72px] border-b border-[#374151]">
    <button
      onClick={() => setHideSidebar(!hideSidebar)}
      className="md:hidden fixed top-4 left-4 z-[2000] bg-gray-800 p-2 rounded-lg cursor-pointer"
    >
      {hideSidebar &&
        <Menu className="md:invisible text-white" size={24} />
      }
    </button>

    </div>
  );
}
