import React from 'react';
import { Layers, Dna } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-lg shadow-emerald-950/50">
            🀄
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">麻雀形</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Kata Analyzer
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              牌姿パターン・組合せ確率・消去法分析ツール
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/50">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>全パターン完全網羅</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/50">
            <Dna className="w-3.5 h-3.5 text-blue-400" />
            <span>消去法・生存確率再計算</span>
          </div>
        </div>
      </div>
    </header>
  );
};
