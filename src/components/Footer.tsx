import React from 'react';
import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060911] py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Cloud Uploads</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>HTML5 Canvas & WebWorkers</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <HardDrive className="w-4 h-4 text-teal-400" />
            <span>100% Local In-Memory</span>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <span>The Everything Image Studio • Built with React 19, Vite & Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
};
