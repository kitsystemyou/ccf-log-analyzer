import { describe, it, expect } from 'vitest';
import {
  cleanHtmlEntities,
  parseLogBlock,
  logSplit,
  makeHistogram,
  calculateCriticalFumble,
  analyzeLog,
} from '../logParser';

describe('logParser Unit Tests (HTML Format Only)', () => {
  describe('cleanHtmlEntities', () => {
    it('HTMLエンティティを正常にデコードすること', () => {
      const htmlLine = '<p style="color: #888888;"><span>[メイン]</span> <span>山田 太郎</span> : <span>CCB&lt;=80 (1D100&lt;=80) ＞ 37 ＞ 成功</span></p>';
      const cleaned = cleanHtmlEntities(htmlLine);
      expect(cleaned).toContain('CCB<=80 (1D100<=80) ＞ 37 ＞ 成功');
    });
  });

  describe('parseLogBlock', () => {
    it('3つ目の span を発言として評価し、標準ココフォリア HTML ログをパースすること', () => {
      const block = '<p style="color: #888888;"><span>[メイン]</span> <span>山田 太郎</span> : <span>CCB<=80 【こぶし】 (1D100<=80) ＞ 37 ＞ 成功</span></p>';
      const result = parseLogBlock(block);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('山田 太郎');
      expect(result?.rollValue).toBe(37);
      expect(result?.resultText).toBe('成功');
    });

    it('提示された改行入り HTML ココフォリアログの 3つ目の span (小鳥遊 美桜, 柘本 湊, 茅埜 芭怜) から判定すること', () => {
      const block1 = `<p style="color:#fef4f4;">
  <span> [other]</span>
  <span> 小鳥遊 美桜</span> :
  <span>
    1D100  (1D100) ＞ 30
  </span>
</p>`;
      const res1 = parseLogBlock(block1);
      expect(res1).not.toBeNull();
      expect(res1?.characterName).toBe('小鳥遊 美桜');
      expect(res1?.rollValue).toBe(30);

      const block2 = `<p style="color:#40ba8d;">
  <span> [other]</span>
  <span>柘本 湊</span> :
  <span>
    1d100 (1D100) ＞ 13
  </span>
</p>`;
      const res2 = parseLogBlock(block2);
      expect(res2).not.toBeNull();
      expect(res2?.characterName).toBe('柘本 湊');
      expect(res2?.rollValue).toBe(13);

      const block3 = `<p style="color:#2b6442;">
  <span> [other]</span>
  <span>茅埜 芭怜</span> :
  <span>
    1d100 (1D100) ＞ 5
  </span>
</p>`;
      const res3 = parseLogBlock(block3);
      expect(res3).not.toBeNull();
      expect(res3?.characterName).toBe('茅埜 芭怜');
      expect(res3?.rollValue).toBe(5);
    });

    it('クリティカル（決定的成功）ログの 3つ目の span から正しく判定すること', () => {
      const block = '<p style="color: #888888;"><span>[メイン]</span> <span>田中花子</span> : <span>ccb<=60 (1D100<=60) ＞ 1 ＞ 決定的成功</span></p>';
      const result = parseLogBlock(block);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('田中花子');
      expect(result?.rollValue).toBe(1);
      expect(result?.resultText).toBe('決定的成功');
    });

    it('ファンブル（致命的失敗）ログの 3つ目の span から正しく判定すること', () => {
      const block = '<p style="color: #888888;"><span>[雑談]</span> <span>佐藤</span> : <span>CC<=50 (1D100<=50) ＞ 98 ＞ 致命的失敗</span></p>';
      const result = parseLogBlock(block);
      expect(result).not.toBeNull();
      expect(result?.characterName).toBe('佐藤');
      expect(result?.rollValue).toBe(98);
      expect(result?.resultText).toBe('致命的失敗');
    });

    it('ダイスロール結果が含まれない通常の発言 span の場合は null になること', () => {
      const block = '<p style="color: #888888;"><span>[メイン]</span> <span>山田 太郎</span> : <span>こんにちは！よろしくお願いします。</span></p>';
      const result = parseLogBlock(block);
      expect(result).toBeNull();
    });
  });

  describe('logSplit', () => {
    it('複数 <p> ブロックの HTML ログ全体を正確にパースすること', () => {
      const multilineHtmlLog = `
<p style="color:#fef4f4;">
  <span> [other]</span>
  <span> 小鳥遊 美桜</span> :
  <span>
    1D100  (1D100) ＞ 30
  </span>
</p>

<p style="color:#40ba8d;">
  <span> [other]</span>
  <span>柘本 湊</span> :
  <span>
    1d100 (1D100) ＞ 13
  </span>
</p>

<p style="color:#2b6442;">
  <span> [other]</span>
  <span>茅埜 芭怜</span> :
  <span>
    1d100 (1D100) ＞ 5
  </span>
</p>
      `;
      const results = logSplit(multilineHtmlLog);
      expect(results.length).toBe(3);
      expect(results[0].characterName).toBe('小鳥遊 美桜');
      expect(results[0].rollValue).toBe(30);

      expect(results[1].characterName).toBe('柘本 湊');
      expect(results[1].rollValue).toBe(13);

      expect(results[2].characterName).toBe('茅埜 芭怜');
      expect(results[2].rollValue).toBe(5);
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
    it('HTMLログ全体およびユーザー別集計が完全な構造で返されること', () => {
      const sampleHtmlLog = `
<p style="color: #888888;"><span>[メイン]</span> <span>プレイヤー1</span> : <span>CCB<=80 (1D100<=80) ＞ 5 ＞ 決定的成功</span></p>
<p style="color: #888888;"><span>[メイン]</span> <span>プレイヤー2</span> : <span>CCB<=70 (1D100<=70) ＞ 95 ＞ 致命的失敗</span></p>
<p style="color: #888888;"><span>[メイン]</span> <span>プレイヤー1</span> : <span>CCB<=50 (1D100<=50) ＞ 42 ＞ 成功</span></p>
      `;
      const analyzed = analyzeLog(sampleHtmlLog);
      expect(analyzed.rawCount).toBe(3);
      expect(analyzed.overallStats.total).toBe(3);
      expect(analyzed.overallStats.critical).toBe(1);
      expect(analyzed.overallStats.fumble).toBe(1);
      expect(analyzed.users.length).toBe(2);
    });
  });
});
