import { describe, it, expect } from 'vitest';
import {
  cleanHtmlLine,
  parseLogLine,
  logSplit,
  makeHistogram,
  calculateCriticalFumble,
  analyzeLog,
} from '../logParser';

describe('logParser Unit Tests', () => {
  describe('cleanHtmlLine', () => {
    it('HTMLエンティティをデコードし、無駄な文字の削りは行わないこと', () => {
      const htmlLine = '<p style="color: #888888;"><span>[メイン]</span> <span>山田　太郎</span> : <span>CCB&lt;=80 (1D100&lt;=80) ＞ 37 ＞ 成功</span></p>';
      const cleaned = cleanHtmlLine(htmlLine);
      expect(cleaned).toBe('<p style="color: #888888;"><span>[メイン]</span> <span>山田　太郎</span> : <span>CCB<=80 (1D100<=80) ＞ 37 ＞ 成功</span></p>');
    });
  });

  describe('parseLogLine', () => {
    it('正常なココフォリア標準ログを正しくパースすること', () => {
      const line = '[メイン] 山田　太郎 : CCB<=80 【こぶし（パンチ）】 (1D100<=80) ＞ 37 ＞ 成功';
      const result = parseLogLine(line);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('山田 太郎');
      expect(result?.rollValue).toBe(37);
      expect(result?.resultText).toBe('成功');
    });

    it('計算式付きダイスコマンド CCB<=(15*5) のログでキャラクター名を正確に判定すること', () => {
      const line = '[メイン] 探索者A : CCB<=(15*5) 【目星】 (1D100<=75) ＞ 42 ＞ 成功';
      const result = parseLogLine(line);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('探索者A');
      expect(result?.rollValue).toBe(42);
      expect(result?.resultText).toBe('成功');
    });

    it('HTMLタグを含んだココフォリアHTMLログ行を正しくパースすること', () => {
      const htmlLine = '<p style="color: #888888;">[メイン] 田中花子 : ccb&lt;=60 (1D100&lt;=60) ＞ 1 ＞ 決定的成功</p>';
      const result = parseLogLine(htmlLine);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('田中花子');
      expect(result?.rollValue).toBe(1);
      expect(result?.resultText).toBe('決定的成功');
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

    it('HTMLファイル形式のココフォリアログ文字列を正しくパースすること', () => {
      const sampleHtmlLog = `
<!DOCTYPE html>
<html>
<body>
<p style="color: #888888;">[メイン] プレイヤーA : CCB&lt;=80 (1D100&lt;=80) ＞ 15 ＞ 成功</p>
<p style="color: #888888;">[メイン] プレイヤーB : CCB&lt;=(20*4) (1D100&lt;=80) ＞ 99 ＞ 致命的失敗</p>
</body>
</html>
      `;
      const results = logSplit(sampleHtmlLog);
      expect(results.length).toBe(2);
      expect(results[0].characterName).toBe('プレイヤーA');
      expect(results[0].rollValue).toBe(15);
      expect(results[1].characterName).toBe('プレイヤーB');
      expect(results[1].rollValue).toBe(99);
    });
  });

  describe('makeHistogram', () => {
    it('出目を 1~10 〜 91~100 の 10 区間に正しく分類すること', () => {
      const mockResults = [
        { characterName: 'A', rollValue: 5, resultText: '成功' },
        { characterName: 'A', rollValue: 10, resultText: '成功' },
        { characterName: 'A', rollValue: 15, resultText: '成功' },
        { characterName: 'A', rollValue: 50, resultText: '成功' },
        { characterName: 'A', rollValue: 100, resultText: '致命的失敗' },
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
    });
  });
});
