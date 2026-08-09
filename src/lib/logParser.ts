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
 * サニタイズ処理（文字列削り）を行わず、表示用エンティティデコードのみ適用
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
 * ココフォリアログの行またはHTMLブロックから情報を抽出する
 */
export function parseLogLine(line: string): ParseResult | null {
  const cleaned = cleanHtmlLine(line);
  if (!cleaned) return null;

  // 全角スペースを半角に変換し、改行や複数連続空白を1つの半角スペースに統合
  const normalized = cleaned
    .replace(/\r\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ');

  // 1D100, 1d100, CCB, ccb, CC, cc, RESB, resb などのダイスコマンド判定
  const diceSearch = normalized.search(/(?:1D100|1d100|\b\d+D\d+\b|CCB|ccb|CC|cc|RESB|resb)/i);
  if (diceSearch === -1) return null;

  // ダイス結果（ ＞ 出目 ＞ 結果 または ＞ 出目 ）が末尾に含まれるか判定
  const rollMatch = normalized.match(/[＞>]\s*(\d+)\s*(?:[＞>]\s*(.*?))?(?:<\/p>|<[^>]*>|\s)*$/i);
  if (!rollMatch) return null;

  const rollValue = parseInt(rollMatch[1], 10);
  if (isNaN(rollValue)) return null;

  let resultText = rollMatch[2] ? rollMatch[2].trim() : '';
  // HTMLタグが末尾に残っている場合は閉じたタグを取り除く
  resultText = resultText.replace(/<\/[^>]+>$/g, '').replace(/<[^>]*>/g, '').trim();

  // キャラクター名の抽出:
  // ダイスコマンド (1D100/1d100/CCB/ccb/CC/cc/RESB/resb) より前の領域からコロン ':' の前にある名前を正確に特定
  let characterName = '不明';
  const beforeDice = normalized.substring(0, diceSearch);
  const lastColonIndex = beforeDice.lastIndexOf(':');
  const namePart = lastColonIndex !== -1 ? beforeDice.substring(0, lastColonIndex) : beforeDice;

  // HTMLタグ <...> および チャンネル表記 [...] を除去して純粋なキャラ名を取得
  const strippedName = namePart.replace(/<[^>]*>/g, '').replace(/\[.*?\]/g, '').trim();
  if (strippedName) {
    characterName = strippedName;
  }

  return { characterName: characterName || '不明', rollValue, resultText };
}

/**
 * ログ全体をブロック分割 (<p>...</p> タグがある場合はその単位、無ければ改行分割)
 */
export function extractLogBlocks(content: string): string[] {
  // <p[\s\S]*?<\/p> パターンがあるか確認
  const pTagRegex = /<p[\s\S]*?<\/p>/gi;
  const pMatches = content.match(pTagRegex);

  if (pMatches && pMatches.length > 0) {
    return pMatches;
  }

  // <p> タグが無い平文ログの場合は改行分割
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

/**
 * ログ全体を分割・パース
 */
export function logSplit(content: string): ParseResult[] {
  const blocks = extractLogBlocks(content);
  const results: ParseResult[] = [];

  for (const block of blocks) {
    const parsed = parseLogLine(block);
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
