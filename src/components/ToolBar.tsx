import { Scissors, Minimize2, RefreshCw, Maximize2, Type, Sliders } from 'lucide-react';
import type { ToolTab } from '../types';

interface ToolBarProps {
  activeTab: ToolTab;
  onSelectTab: (tab: ToolTab) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({ activeTab, onSelectTab }) => {
  const tools: Array<{
    id: ToolTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isFlagship?: boolean;
  }> = [
    {
      id: 'bg-remover',
      label: 'Background Remover',
      icon: Scissors,
      isFlagship: true,
    },
    {
      id: 'compress',
      label: 'The Compressor',
      icon: Minimize2,
    },
    {
      id: 'convert',
      label: 'The Converter',
      icon: RefreshCw,
    },
    {
      id: 'resize',
      label: 'The Resizer',
      icon: Maximize2,
    },
    {
      id: 'watermark',
      label: 'The Watermarker',
      icon: Type,
    },
    {
      id: 'adjust',
      label: 'Enhance & Adjust',
      icon: Sliders,
    },
  ];

  return (
    <div className="w-full bg-[#0E1524] border-b border-white/10 px-4 py-2 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap relative ${
                  isActive
                    ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/25 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-teal-400'}`} />
                <span>{t.label}</span>
                {t.isFlagship && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
