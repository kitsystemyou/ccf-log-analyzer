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
 * HTMLエンティティのデコード
 */
export function cleanHtmlEntities(rawText: string): string {
  return rawText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * <p> タグブロック内から <span> テキスト配列を抽出する
 */
export function extractSpanTexts(pBlockHtml: string): string[] {
  const decoded = cleanHtmlEntities(pBlockHtml);
  const spanRegex = /<span>([\s\S]*?)<\/span>/gi;
  const spanTexts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = spanRegex.exec(decoded)) !== null) {
    // 内部のネストされたHTMLタグを除去してトリム
    const textContent = match[1].replace(/<[^>]*>/g, '').trim();
    spanTexts.push(textContent);
  }

  return spanTexts;
}

/**
 * HTML <p> ブロックから情報をパースする (HTML形式のみ対応)
 * - pタグ内の <span> 3つ目をキャラクターの発言とし、3つ目に対してダイスロール判定を行う
 * - 1つ目または2つ目の <span> からキャラクター名を特定する
 */
export function parseLogBlock(pBlockHtml: string): ParseResult | null {
  const spanTexts = extractSpanTexts(pBlockHtml);

  // <span> が少なくとも1つ以上必要
  if (spanTexts.length === 0) return null;

  let characterName = '不明';
  let speechText = '';

  if (spanTexts.length >= 3) {
    // <span> 3つ目が発言
    speechText = spanTexts[2];

    // 1つ目の <span> が [メイン] や [other] などのチャンネル名の場合、2つ目をキャラ名とする
    const firstSpan = spanTexts[0].replace(/:$/, '').trim();
    const secondSpan = spanTexts[1].replace(/:$/, '').trim();

    if (/^\[.*?\]$/.test(firstSpan)) {
      characterName = secondSpan || firstSpan;
    } else {
      characterName = firstSpan || secondSpan;
    }
  } else if (spanTexts.length === 2) {
    characterName = spanTexts[0].replace(/:$/, '').trim();
    speechText = spanTexts[1];
  } else {
    speechText = spanTexts[0];
  }

  // チャンネルブラケット [...] や末尾のコロン ':' を除去
  characterName = characterName.replace(/^\[.*?\]\s*/, '').replace(/:$/, '').trim();

  // 発言テキスト (3つ目の span) に対してダイスロール判定を行う
  // 全角スペースを半角に変換し、改行・複数連続空白を1つの半角スペースに統一
  const normalizedSpeech = speechText.replace(/\u3000/g, ' ').replace(/\s+/g, ' ');

  // ダイス結果 (例: ＞ 30 や ＞ 37 ＞ 成功 や (1D100) ＞ 15)
  const rollMatch = normalizedSpeech.match(/[＞>]\s*(\d+)\s*(?:[＞>]\s*(.*))?$/);
  if (!rollMatch) return null;

  const rollValue = parseInt(rollMatch[1], 10);
  if (isNaN(rollValue)) return null;

  const resultText = rollMatch[2] ? rollMatch[2].trim() : '';

  return {
    characterName: characterName || '不明',
    rollValue,
    resultText,
  };
}

/**
 * ログ全体をHTML <p>...</p> ブロックに分割してパース
 */
export function logSplit(content: string): ParseResult[] {
  // HTML <p ...> ... </p> タグブロックを抽出 (HTML形式のみ対応)
  const pTagRegex = /<p[\s\S]*?<\/p>/gi;
  const pMatches = content.match(pTagRegex);

  if (!pMatches || pMatches.length === 0) {
    return [];
  }

  const results: ParseResult[] = [];

  for (const block of pMatches) {
    const parsed = parseLogBlock(block);
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
