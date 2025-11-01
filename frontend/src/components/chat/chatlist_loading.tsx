'use client';
import React from 'react';

export default function ChatListSkeleton() {
  return (
    <div className='h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2'>
      <div className="w-full md:w-1/4 outline-none flex flex-col bg-[#021024] rounded-[20px] my-2 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="h-6 w-24 bg-slate-700/70 rounded-md" />
          {/* Placeholder for plus button */}
          {/* <div className="h-8 w-8 bg-slate-700/70 rounded-lg" /> */}
        </div>

        {/* Search input placeholder */}
        <div className="p-4">
          <div className="h-10 bg-slate-700/70 rounded-lg" />
        </div>

        {/* Chat list skeleton items */}
        <div className="px-4 pb-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center p-3 my-1 rounded-md bg-slate-800/40"
            >
              {/* avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-700/60 mr-3" />
              {/* username + last message */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-2/5 bg-slate-700/60 rounded" />
                  <div className="h-3 w-1/4 bg-slate-700/40 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-slate-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Desktop placeholder for chat window */}
      <div className='hidden md:flex flex-1 bg-[#021024] rounded-[20px] flex-col my-2 items-center justify-center'>
        <div className="text-gray-400 text-center">
          <div className="h-6 w-48 bg-slate-700/40 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
