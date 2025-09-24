"use client"

import { Home, Settings, User, MessageSquare, Bell, Search, Power, Gamepad2 } from "lucide-react"

const navigationItems = [
  { icon: Home, label: "Home", id: "home" },
  // { icon: Search, label: "Search", id: "search" },
  // { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Gamepad2, label: "Game", id: "game" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Settings, label: "Settings", id: "settings" },
]

interface SidebarProps {
  activeItem: string
  onItemClick: (id: string) => void
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  return (
    <aside className="flex h-screen w-16 flex-col bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-700 shadow-xl">
      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col items-center py-6 space-y-3" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
                group relative flex h-11 w-11 items-center justify-center rounded-md
                transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-950
                ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white hover:scale-105"
                }
              `}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} className="transition-transform group-hover:scale-110" />
            </button>
          )
        })}
      </nav>

      {/* Power/Logout Button */}
      <div className="pb-6 flex justify-center">
        <button
          className="group relative flex h-11 w-11 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition-all duration-200 ease-in-out hover:bg-red-600 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-950"
          title="Logout"
          aria-label="Logout"
        >
          <Power size={20} className="transition-transform group-hover:scale-110" />
        </button>
      </div>
    </aside>
  )
}
