import React from 'react';
import { Wifi, Battery } from 'lucide-react';

export default function StatusBar({ time = '9:41' }) {
  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-2 text-white text-[13px] font-semibold tracking-tight select-none z-20">
      <span>{time}</span>
      <div className="flex items-center space-x-2 text-neutral-200">
        {/* Cellular bars */}
        <div className="flex items-end space-x-0.5 h-3">
          <div className="w-0.5 h-1 bg-current rounded-sm"></div>
          <div className="w-0.5 h-1.5 bg-current rounded-sm"></div>
          <div className="w-0.5 h-2 bg-current rounded-sm"></div>
          <div className="w-0.5 h-3 bg-current rounded-sm"></div>
        </div>
        <Wifi size={14} className="stroke-[2.2]" />
        <div className="flex items-center">
          <div className="w-5 h-2.5 border border-current rounded-[3px] p-[1px] flex items-center">
            <div className="w-3 h-full bg-current rounded-[1px]"></div>
          </div>
          <div className="w-[1.5px] h-1 bg-current rounded-r-sm"></div>
        </div>
      </div>
    </div>
  );
}
