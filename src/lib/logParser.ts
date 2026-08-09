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
 * サニタイズ処理（タグ削除・削り）を行わず、エンティティデコードのみ適用
 */
export function cleanHtmlLine(rawLine: string): string {
  let cleaned = rawLine;
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return cleaned.trim();
}

/**
 * ココフォリアログの行から情報を抽出する
 */
export function parseLogLine(line: string): ParseResult | null {
  const cleaned = cleanHtmlLine(line);
  if (!cleaned) return null;

  // CCB, ccb, CC, cc, RESB, resb を含んでいるか確認
  const hasDiceKeyword = /(?:CCB|ccb|CC|cc|RESB|resb)/i.test(cleaned);
  if (!hasDiceKeyword) return null;

  // 全角スペースを半角に変換
  const normalized = cleaned.replace(/\u3000/g, ' ');

  // ダイス結果（ ＞ 出目 ＞ 結果 ）が末尾に含まれるか判定
  const rollMatch = normalized.match(/[＞>]\s*(\d+)\s*(?:[＞>]\s*(.*))?$/);
  if (!rollMatch) return null;

  const rollValue = parseInt(rollMatch[1], 10);
  if (isNaN(rollValue)) return null;

  let resultText = rollMatch[2] ? rollMatch[2].trim() : '';
  // HTMLタグが末尾に残っている場合は閉じたタグのみ取り除く (例: 成功</p> -> 成功)
  resultText = resultText.replace(/<\/[^>]+>$/g, '').trim();

  // キャラクター名抽出: ダイス判定 [＞>] よりも左側にあるコロン ':' と名前を特定
  let characterName = '不明';

  // [メイン] または <span...> などに囲まれたキャラ名とコロンのパターンにマッチ
  const nameMatch = normalized.match(/(?:\[.*?\]\s*|<[^>]*>)*\s*([^\:<>\n]+?)\s*:\s*.*?[＞>]/);
  if (nameMatch && nameMatch[1].trim()) {
    characterName = nameMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    // フォールバック
    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (tokens.length >= 3) {
      let charName = tokens[0];
      if (tokens[0].startsWith('[') && tokens[0].endsWith(']') && tokens.length > 1) {
        charName = tokens[1];
      }
      characterName = charName.replace(/<[^>]*>/g, '').trim();
    }
  }

  return { characterName: characterName || '不明', rollValue, resultText };
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
