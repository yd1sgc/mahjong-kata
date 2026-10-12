# AI_HANDOVER.md - 麻雀形 プロジェクト引き継ぎ書

## プロジェクト概要

**名称**: 麻雀形（まじゃんがた）  
**目的**: ユーザーが指定した牌の種類・枚数と手牌の枚数から、数学的に作成可能なすべての手牌パターンを網羅して計算し、出現確率・組み合わせ数・一覧を表示・分析するWebアプリ。  
**ローカルパス**: `C:\Users\segu1\MyFiles\開発\repos\麻雀形`  
**GitHubリポジトリ**: `https://github.com/yd1sgc/mahjong-kata` (Public)

## 技術スタック

- **フレームワーク**: Vite 6 + React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4（`@tailwindcss/vite`プラグイン）
- **グラフ**: Recharts
- **アイコン**: Lucide React
- **テスト**: Vitest v5（カバレッジ対象: `src/lib/**`）
- **Lint**: ESLint v9 flat config

## ディレクトリ構成

```
麻雀形/
├── src/
│   ├── components/     # UIコンポーネント（未作成）
│   ├── lib/            # 計算ロジック（テスト対象）
│   │   ├── combinatorics.ts  # 組み合わせ計算（C(n,k)、bigint対応）
│   │   ├── partitions.ts     # 自然数分割の列挙
│   │   └── mahjong.ts        # 麻雀的解釈ラベル付与
│   ├── types/
│   │   └── index.ts    # 型定義（TileType, HandPattern, AnalysisResult等）
│   ├── App.tsx         # メインアプリ（仮置き）
│   ├── main.tsx        # Reactエントリー
│   └── index.css       # Tailwind v4 import
├── tests/              # Vitestテスト（未作成）
├── docs/
│   └── AI_HANDOVER.md  # 本ファイル
├── scripts/
│   └── safety_hook.py  # Antigravityフックスクリプト
├── .gemini/
│   ├── hooks.json
│   └── rules/user_global.md
├── AGENTS.md
├── CLAUDE.md
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## アプリの計算ロジック設計（未実装）

### 入力
- `tiles`: 牌の種類 + 各枚数（例: 1p×4, 2p×4, 3p×1）
- `handSize`: 手牌の枚数 N

### 出力
全パターンの一覧（枚数分割ベース）+ 各パターンの組み合わせ数・確率

### 計算方針
1. 全組み合わせ総数 = 多項係数の総和（各牌の枚数が異なるため単純なC(K×4,N)ではない）
2. 各牌の引き枚数の分布（自然数分割）を列挙
3. 各分割に対して多項係数 `C(c1,n1) × C(c2,n2) × ...` の和を計算
4. 麻雀的ラベル（刻子・対子・順子・ターツ・孤立など）を付与

### 重複解釈の方針（未決定）
同一手牌が複数の解釈を持つ場合（例: 1,1,1,2 → 刻子+孤立 or 対子+ターツ）の扱いは未決定。

## 現在のステータス

- [x] 環境構築完了（Vite + React 19 + TypeScript + Tailwind v4 + Recharts + Vitest）
- [x] Antigravity制御ルール導入（AGENTS.md, CLAUDE.md, .gemini/rules/user_global.md, scripts/safety_hook.py）
- [x] 型定義（`src/types/index.ts`）作成・拡充
- [x] 計算ロジック実装（`src/lib/combinatorics.ts`, `src/lib/partitions.ts`, `src/lib/tiles.ts`, `src/lib/mahjong.ts`, `src/lib/analyzer.ts`）
- [x] Vitestテスト作成・パス（8件すべて合格、計算整合性・不均一牌数・フィルター再計算を検証）
- [x] UIコンポーネント実装（Header, InputPanel, SummaryCard, FilterPanel, ProbabilityChart, PatternTable）
- [x] App.tsx 実装およびプロダクションビルド検証完了（`npm run build` 成功）
- [x] GitHub Publicリポジトリ作成・プッシュ完了（`yd1sgc/mahjong-kata`）
- [x] Cloudflare Workers Builds用設定（`wrangler.jsonc`）追加・デプロイ競合解消完了

## 直近TODO

1. 必要に応じた追加機能の要望検討（役判定の更なる精密化、牌表示の画像化など）
2. 公開が必要になった段階でのデプロイ（Cloudflare Pages等への連携）
3. Gitリポジトリへの初期コミット・保存
