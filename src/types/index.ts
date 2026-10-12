// 牌の種類定義
export type TileSuit = 'man' | 'pin' | 'sou' | 'honor';

export interface TileType {
  id: string;      // 一意なID (例: "1p", "3m", "1z")
  suit: TileSuit;
  number: number;  // 1-9（数牌）、1-7（字牌）
  count: number;   // 山に残っている枚数 (0-4)
  label: string;   // 表示用テキスト（例: "1筒", "1p"）
  emoji: string;   // 絵文字（🀙等）
}

// 具体的な牌姿（手牌1つ1つの構成）
export interface HandShape {
  id: string;               // 一意なキー（例: "1p:2,2p:1,3p:1"）
  drawCounts: number[];     // 各牌の引いた枚数
  distribution: number[];   // 降順の枚数内訳（例: [2, 1, 1]）
  tileString: string;       // テキスト表記 (例: "1p 1p 2p 3p")
  emojiString: string;      // 絵文字表記 (例: "🀙🀙🀚🀛")
  combinations: bigint;     // 組み合わせ数
  probability: number;      // 確率 (0〜1)
  frequency: string;        // 頻度 (例: "7.1回に1回")
  tags: string[];           // 麻雀的特徴タグ (例: ["対子あり", "順子あり", "両面あり"])
  componentsSummary: string;// 構成の要約（例: "123p(順子) + 1p(孤立)"）
}

// 分割パターン（数学的内訳ごとの集計）
export interface DistributionGroup {
  distribution: number[];   // 例: [2, 1, 1]
  patternName: string;      // 例: "対子1 + 孤立2"
  combinations: bigint;     // 合計組み合わせ数
  probability: number;      // 合計確率
  frequency: string;        // 頻度
  shapes: HandShape[];      // 該当する具体的な牌姿リスト
}

// フィルター条件
export interface FilterCriteria {
  requiredTags: string[];      // 含むべきタグ
  excludedTags: string[];      // 含んではならないタグ
  includeTileIds: string[];    // 含むべき牌ID
  excludeTileIds: string[];    // 含んではならない牌ID
  exactTileCounts?: { [tileId: string]: number }; // 特定の牌がちょうど何枚
}

// 入力パラメータ
export interface AnalysisParams {
  tiles: TileType[];
  handSize: number;
}

// 分析結果
export interface AnalysisResult {
  params: AnalysisParams;
  totalCombinations: bigint;
  totalShapesCount: number;
  shapes: HandShape[];
  distributionGroups: DistributionGroup[];
  allTags: string[];
}
