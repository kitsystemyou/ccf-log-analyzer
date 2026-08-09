import { describe, it, expect } from 'vitest';
import {
  parseLogLine,
  logSplit,
  makeHistogram,
  calculateCriticalFumble,
  splitByUser,
  analyzeLog,
} from '../logParser';

describe('logParser Unit Tests', () => {
  describe('parseLogLine', () => {
    it('正常なココフォリア標準ログを正しくパースすること', () => {
      const line = '[メイン] 山田　太郎 : CCB<=80 【こぶし（パンチ）】 (1D100<=80) ＞ 37 ＞ 成功';
      const result = parseLogLine(line);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('山田 太郎');
      expect(result?.rollValue).toBe(37);
      expect(result?.resultText).toBe('成功');
    });

    it('クリティカル（決定的成功）ログを正しくパースすること', () => {
      const line = '[メイン] 田中花子 : ccb<=60 (1D100<=60) ＞ 1 ＞ 決定的成功';
      const result = parseLogLine(line);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('田中花子');
      expect(result?.rollValue).toBe(1);
      expect(result?.resultText).toBe('決定的成功');
    });

    it('ファンブル（致命的失敗）ログを正しくパースすること', () => {
      const line = '[雑談] 佐藤 : CC<=50 (1D100<=50) ＞ 98 ＞ 致命的失敗';
      const result = parseLogLine(line);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('佐藤');
      expect(result?.rollValue).toBe(98);
      expect(result?.resultText).toBe('致命的失敗');
    });

    it('ダイスロール以外のチャット行は null になること', () => {
      const line = '[メイン] 山田　太郎 : こんにちは！よろしくお願いします。';
      const result = parseLogLine(line);
      expect(result).toBeNull();
    });
  });

  describe('logSplit', () => {
    it('複数行のログからCCBコマンドのみ抽出しパースすること', () => {
      const sampleLog = `
[メイン] 山田　太郎 : よろしくお願いします
[メイン] 山田　太郎 : CCB<=80 【こぶし】 (1D100<=80) ＞ 37 ＞ 成功
[メイン] 田中　花子 : CCB<=60 【目星】 (1D100<=60) ＞ 96 ＞ 致命的失敗
[雑談] 雑談ログです
      `;
      const results = logSplit(sampleLog);
      expect(results.length).toBe(2);
      expect(results[0].characterName).toBe('山田 太郎');
      expect(results[0].rollValue).toBe(37);
      expect(results[1].characterName).toBe('田中 花子');
      expect(results[1].rollValue).toBe(96);
    });
  });

  describe('makeHistogram', () => {
    it('出目を 1~10 〜 91~100 の 10 区間に正しく分類すること', () => {
      const mockResults = [
        { characterName: 'A', rollValue: 5, resultText: '成功' },   // 1~10 (bin 0)
        { characterName: 'A', rollValue: 10, resultText: '成功' },  // 1~10 (bin 0)
        { characterName: 'A', rollValue: 15, resultText: '成功' },  // 11~20 (bin 1)
        { characterName: 'A', rollValue: 50, resultText: '成功' },  // 41~50 (bin 4)
        { characterName: 'A', rollValue: 100, resultText: '致命的失敗' }, // 91~100 (bin 9)
      ];
      const hist = makeHistogram(mockResults);
      expect(hist).toEqual([2, 1, 0, 0, 1, 0, 0, 0, 0, 1]);
    });
  });

  describe('calculateCriticalFumble', () => {
    it('クリティカルとファンブルのパーセンテージを正しく計算すること', () => {
      const mockResults = [
        { characterName: 'A', rollValue: 1, resultText: '決定的成功' },
        { characterName: 'A', rollValue: 50, resultText: '成功' },
        { characterName: 'A', rollValue: 99, resultText: '致命的失敗' },
        { characterName: 'A', rollValue: 30, resultText: '成功' },
      ];
      const stats = calculateCriticalFumble(mockResults);
      expect(stats.total).toBe(4);
      expect(stats.critical).toBe(1);
      expect(stats.fumble).toBe(1);
      expect(stats.critical_percent).toBe(25);
      expect(stats.fumble_percent).toBe(25);
    });
  });

  describe('analyzeLog', () => {
    it('ログ全体およびユーザー別集計が完全な構造で返されること', () => {
      const sampleLog = `
[メイン] プレイヤー1 : CCB<=80 (1D100<=80) ＞ 5 ＞ 決定的成功
[メイン] プレイヤー2 : CCB<=70 (1D100<=70) ＞ 95 ＞ 致命的失敗
[メイン] プレイヤー1 : CCB<=50 (1D100<=50) ＞ 42 ＞ 成功
      `;
      const analyzed = analyzeLog(sampleLog);
      expect(analyzed.rawCount).toBe(3);
      expect(analyzed.overallStats.total).toBe(3);
      expect(analyzed.overallStats.critical).toBe(1);
      expect(analyzed.overallStats.fumble).toBe(1);
      expect(analyzed.users.length).toBe(2);

      const p1 = analyzed.users.find((u) => u.name === 'プレイヤー1');
      expect(p1).toBeDefined();
      expect(p1?.stats.total).toBe(2);
      expect(p1?.stats.critical).toBe(1);

      const p2 = analyzed.users.find((u) => u.name === 'プレイヤー2');
      expect(p2).toBeDefined();
      expect(p2?.stats.total).toBe(1);
      expect(p2?.stats.fumble).toBe(1);
    });
  });
});
