export interface ParseResult {
  characterName: string;
  rollValue: number;
  resultText: string;
}

export interface CriticalFumbleStats {
  critical: number;
  fumble: number;
  total: number;
  critical_percent: number;
  fumble_percent: number;
}

export interface UserHistResult {
  name: string;
  hist_data: number[];
  stats: CriticalFumbleStats;
}

export interface AnalyzeResult {
  overallHist: number[];
  overallStats: CriticalFumbleStats;
  users: UserHistResult[];
  rawCount: number;
}

/**
 * ココフォリアログの行から情報を抽出する
 */
export function parseLogLine(line: string): ParseResult | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // CCB, ccb, CC, cc, RESB, resb を含んでいるか確認
  const hasDiceKeyword = /(?:CCB|ccb|CC|cc|RESB|resb)/i.test(trimmed);
  if (!hasDiceKeyword) return null;

  // 全角スペースを半角に変換
  const normalized = trimmed.replace(/\u3000/g, ' ');

  // 正規表現パターン 1: [メイン] キャラ名 : コマンド ＞ 出目 ＞ 結果
  // 例: [メイン] 山田 太郎 : CCB<=80 【目星】 (1D100<=80) ＞ 37 ＞ 成功
  const matchStandard = normalized.match(/^(?:\[.*?\]\s*)?([^:]+?)\s*:\s*.*?[＞>]\s*(\d+)\s*(?:[＞>]\s*(.*))?$/);
  if (matchStandard) {
    const characterName = matchStandard[1].trim();
    const rollValue = parseInt(matchStandard[2], 10);
    const resultText = matchStandard[3] ? matchStandard[3].trim() : '';
    if (!isNaN(rollValue)) {
      return { characterName, rollValue, resultText };
    }
  }

  // 互換フォールバック: 単純なスペース分割処理 (Python版の log_split 準拠)
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length >= 3) {
    // 例: [メイン] キャラ名 ... 出目 結果
    let charName = tokens[0];
    if (tokens[0].startsWith('[') && tokens[0].endsWith(']') && tokens.length > 1) {
      charName = tokens[1];
    }
    const rollStr = tokens[tokens.length - 2].replace(/\D/g, '');
    const rollVal = parseInt(rollStr, 10);
    const resText = tokens[tokens.length - 1];

    if (!isNaN(rollVal)) {
      return {
        characterName: charName,
        rollValue: rollVal,
        resultText: resText,
      };
    }
  }

  return null;
}

/**
 * ログ全体を分割・パース
 */
export function logSplit(content: string): ParseResult[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const results: ParseResult[] = [];

  for (const line of lines) {
    const parsed = parseLogLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * 1~100 の出目結果を 10 個のビンに分類してヒストグラムを作成
 * ビン: [1-10, 11-20, 21-30, 31-40, 41-50, 51-60, 61-70, 71-80, 81-90, 91-100]
 */
export function makeHistogram(results: ParseResult[]): number[] {
  const histogram = new Array(10).fill(0);

  for (const item of results) {
    const val = item.rollValue;
    if (val >= 1 && val <= 100) {
      const binIndex = Math.min(Math.floor((val - 1) / 10), 9);
      histogram[binIndex]++;
    }
  }

  return histogram;
}

/**
 * クリティカル・ファンブルの集計
 */
export function calculateCriticalFumble(results: ParseResult[]): CriticalFumbleStats {
  let critical = 0;
  let fumble = 0;

  for (const item of results) {
    const res = item.resultText;
    if (/決定的成功|Special/i.test(res)) {
      critical++;
    }
    if (/致命的失敗|Fumble/i.test(res)) {
      fumble++;
    }
  }

  const total = results.length;
  const critical_percent = total > 0 ? Math.floor((100 * critical) / total) : 0;
  const fumble_percent = total > 0 ? Math.floor((100 * fumble) / total) : 0;

  return {
    critical,
    fumble,
    total,
    critical_percent,
    fumble_percent,
  };
}

/**
 * ユーザー（キャラクター）毎にグループ化
 */
export function splitByUser(results: ParseResult[]): { name: string; items: ParseResult[] }[] {
  const userMap = new Map<string, ParseResult[]>();

  for (const item of results) {
    const name = item.characterName || '不明';
    if (!userMap.has(name)) {
      userMap.set(name, []);
    }
    userMap.get(name)!.push(item);
  }

  const userList: { name: string; items: ParseResult[] }[] = [];
  for (const [name, items] of userMap.entries()) {
    userList.push({ name, items });
  }

  return userList;
}

/**
 * メインの解析エントリー関数
 */
export function analyzeLog(content: string): AnalyzeResult {
  const parsedItems = logSplit(content);
  const overallHist = makeHistogram(parsedItems);
  const overallStats = calculateCriticalFumble(parsedItems);

  const groupedUsers = splitByUser(parsedItems);
  const users: UserHistResult[] = groupedUsers.map((u) => ({
    name: u.name,
    hist_data: makeHistogram(u.items),
    stats: calculateCriticalFumble(u.items),
  }));

  return {
    overallHist,
    overallStats,
    users,
    rawCount: parsedItems.length,
  };
}
