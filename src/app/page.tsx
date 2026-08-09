'use client';

import React, { useState, useRef } from 'react';
import { analyzeLog, AnalyzeResult } from '@/lib/logParser';
import { HistogramChart } from '@/components/HistogramChart';
import { StatCard } from '@/components/StatCard';
import {
  Dice5,
  Play,
  Users,
  BarChart2,
  Github,
  HelpCircle,
  History,
  Trash2,
  Eye,
  BookOpen,
  Sparkles,
  Upload,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

const SAMPLE_LOG = `<p style="color:#fef4f4;">
  <span> [main]</span>
  <span> 山田 太郎</span> :
  <span>
    CCB<=80 【こぶし】 (1D100<=80) ＞ 37 ＞ 成功
  </span>
</p>

<p style="color:#40ba8d;">
  <span> [main]</span>
  <span> 田中 花子</span> :
  <span>
    CCB<=60 【目星】 (1D100<=60) ＞ 96 ＞ 致命的失敗
  </span>
</p>

<p style="color:#fef4f4;">
  <span> [other]</span>
  <span> 小鳥遊 小鳥</span> :
  <span>
    CCB<=70 【聞き耳】 (1D100<=70) ＞ 1 ＞ 決定的成功
  </span>
</p>

<p style="color:#40ba8d;">
  <span> [other]</span>
  <span> 市　太郎</span> :
  <span>
    CCB<=50 【回避】 (1D100<=50) ＞ 13 ＞ 成功
  </span>
</p>

<p style="color:#2b6442;">
  <span> [other]</span>
  <span> 須磨　ゐる</span> :
  <span>
    CC<=65 【心理学】 (1D100<=65) ＞ 5 ＞ 決定的成功
  </span>
</p>`;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overall' | 'users'>('overall');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }
    const res = analyzeLog(inputText);
    setResult(res);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_LOG);
    setFileName('sample_cocofolia_log.html');
    const res = analyzeLog(SAMPLE_LOG);
    setResult(res);
  };

  const handleClear = () => {
    setInputText('');
    setFileName(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      setInputText(text);
      setFileName(file.name);
      const res = analyzeLog(text);
      setResult(res);
    } catch (err) {
      console.error('File read error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".html,.htm"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header className="border-b border-teal-500/20 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-teal-950/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 via-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-white/20">
              <Eye className="w-6 h-6 text-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black gradient-title tracking-wide">
                ココフォリア Log Analyzer <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/60 text-teal-300 font-bold border border-purple-500/40">CoC Mythos</span>
              </h1>
              <p className="text-xs text-slate-400">クトゥルフ神話TRPG 運命のダイス出目解析 (HTML形式対応)</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs font-semibold text-slate-300">
            <a
              href="https://kitsystemyou.github.io/ccf-log-analyzer/usage/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-300 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-teal-400" /> 使い方
            </a>
            <a
              href="https://github.com/kitsystemyou/ccf-log-analyzer"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4 text-purple-400" /> GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Intro Banner */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            深淵なるダイスの女神の啓示
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-100">
            狂気と幸運のダイス出目を可視化
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            ココフォリアから出力されたチャットログ（HTMLファイル）をアップロードまたは貼り付けることで、出目分布、決定的成功（クリティカル）、致命的失敗（ファンブル）を深海エルドリッチグラフィックで視覚化します。
          </p>
        </section>

        {/* Input Form Section */}
        <section className="glass-panel rounded-3xl p-6 shadow-2xl space-y-5 border border-teal-500/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              ココフォリアログ（HTMLファイル内容または .html アプリ出力）
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 text-teal-300 px-3.5 py-1.5 rounded-xl border border-teal-400/40 transition-all flex items-center gap-1.5 font-bold shadow-md shadow-teal-500/10"
              >
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                HTMLファイルを指定・アップロード
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                サンプルログ
              </button>

              {(inputText || fileName) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 px-3.5 py-1.5 rounded-xl border border-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  クリア
                </button>
              )}
            </div>
          </div>

          {/* File Drag & Drop Zone / Textarea Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl transition-all ${
              isDragging
                ? 'ring-2 ring-teal-400 bg-teal-950/30 border-teal-400'
                : ''
            }`}
          >
            {fileName && (
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-semibold truncate">読み込み中: {fileName}</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 shrink-0 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 読み込み完了
                </span>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`【HTMLファイルをドラッグ＆ドロップ】または【上のアップロードボタン】を選択してください。\n\n(HTMLログ形式の例)\n<p style="color:#fef4f4;">\n  <span> [main]</span>\n  <span> 山田 太郎</span> :\n  <span> CCB<=80 (1D100<=80) ＞ 37 ＞ 成功 </span>\n</p>`}
              className="w-full h-48 bg-slate-950/80 border border-purple-500/20 rounded-2xl p-4 text-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all resize-y"
            />

            {isDragging && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl border-2 border-dashed border-teal-400 flex flex-col items-center justify-center pointer-events-none text-teal-300 space-y-2">
                <Upload className="w-10 h-10 animate-bounce text-teal-400" />
                <p className="font-bold text-sm">ここに HTML ログファイルをドロップしてください</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full py-4 bg-gradient-to-r from-teal-400 via-purple-600 to-rose-600 hover:from-teal-300 hover:via-purple-500 hover:to-rose-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-teal-500/10 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-base tracking-wider"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            👁️ 運 命 の 解 析 を 開 始 👁️
          </button>
        </section>

        {/* Results Section */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('overall')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                    activeTab === 'overall'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-400/40 shadow-lg shadow-teal-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  全体ダイス統計
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                    activeTab === 'users'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-400/40 shadow-lg shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  探索者別統計 ({result.users.length}名)
                </button>
              </div>

              <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-teal-500/20">
                抽出判定数: <span className="text-teal-300 font-bold">{result.rawCount}</span> 件
              </div>
            </div>

            {/* Overall Tab */}
            {activeTab === 'overall' && (
              <div className="space-y-6">
                <StatCard stats={result.overallStats} />
                <div className="glass-panel rounded-3xl p-6 border border-teal-500/20 shadow-2xl">
                  <h3 className="text-lg font-extrabold text-slate-100 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-ping"></span>
                    全探索者の出目分布スペクトル (1D100)
                  </h3>
                  <HistogramChart data={result.overallHist} title="" themeVariant="overall" />
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {result.users.map((user, idx) => (
                  <div
                    key={idx}
                    className="glass-panel rounded-3xl p-6 border border-purple-500/20 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        探索者 / キャラ名: <span className="text-purple-300 font-black">{user.name}</span>
                      </h3>
                      <span className="text-xs bg-purple-950/60 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
                        {user.stats.total} 回判定
                      </span>
                    </div>

                    <StatCard stats={user.stats} />
                    <HistogramChart
                      data={user.hist_data}
                      title={`${user.name} のダイス出目傾向`}
                      themeVariant="user"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <p>ココフォリア Log Analyzer [CoC Mythos Edition] • Next.js & React 19</p>
      </footer>
    </div>
  );
}
