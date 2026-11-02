import React from 'react';
import { Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  activeTab: 'arcade' | 'timeattack' | 'practice' | 'unitcircle';
  onSelectTab: (tab: 'arcade' | 'timeattack' | 'practice' | 'unitcircle') => void;
  onQuickStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickStart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="h-10 sm:h-12 flex items-center justify-between gap-3 px-3 sm:px-5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shrink-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => onSelectTab('arcade')}
        className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 font-mono"
      >
        <span className="text-indigo-400">⚡</span>
        <span>Trigonometric functions GAME</span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('arcade')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'arcade' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          サバイバル防衛戦
        </button>
        <button
          onClick={() => onSelectTab('timeattack')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'timeattack' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          30秒タイムアタック
        </button>
        <button
          onClick={() => onSelectTab('practice')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'practice' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          ステップ練習
        </button>
        <button
          onClick={() => onSelectTab('unitcircle')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'unitcircle' ? 'text-indigo-400 font-semibold underline underline-offset-8' : ''
          }`}
        >
          単位円早見表
        </button>
      </nav>

      {/* Zone 3: Sound toggle + Primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? '音声をオンにする' : '音声をミュートする'}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={onQuickStart}
          className="px-4 py-2 text-xs md:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0"
        >
          ゲーム開始
        </button>
      </div>
    </header>
  );
};
