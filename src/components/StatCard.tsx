'use client';

import React from 'react';
import { CriticalFumbleStats } from '@/lib/logParser';
import { Sparkles, Skull, Dice5, Eye } from 'lucide-react';

interface StatCardProps {
  stats: CriticalFumbleStats;
}

export const StatCard: React.FC<StatCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full my-6">
      {/* クリティカル (決定的成功) */}
      <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-amber-950/30 flex items-center justify-between shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
        <div>
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            決定的成功 (クリティカル)
          </div>
          <div className="text-3xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
            {stats.critical_percent}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            発生数: <span className="font-semibold text-amber-200">{stats.critical}</span> 回
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
          <Eye className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* ファンブル (致命的失敗) */}
      <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-rose-950/30 flex items-center justify-between shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
        <div>
          <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Skull className="w-4 h-4 text-rose-400" />
            致命的失敗 (ファンブル)
          </div>
          <div className="text-3xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
            {stats.fumble_percent}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            発生数: <span className="font-semibold text-rose-200">{stats.fumble}</span> 回
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner">
          <Skull className="w-6 h-6" />
        </div>
      </div>

      {/* トータル (SAN値判定 / ロール総数) */}
      <div className="glass-card rounded-2xl p-5 border border-teal-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-teal-950/30 flex items-center justify-between shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>
        <div>
          <div className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Dice5 className="w-4 h-4 text-teal-300" />
            総判定数 (ダイスロール)
          </div>
          <div className="text-3xl font-black text-teal-300 drop-shadow-[0_0_8px_rgba(0,245,212,0.3)]">
            {stats.total}
            <span className="text-sm font-normal text-slate-400 ml-1.5">回</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            解析済ダイス判定
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-inner">
          <Dice5 className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
