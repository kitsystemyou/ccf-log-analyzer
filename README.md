# ココフォリア Log Analyzer [CoC] 👾 (Next.js Edition)

クトゥルフ神話TRPG（CoC）等のオンラインセッションツール「ココフォリア（Ccfolia）」から出力されたチャットログテキストを解析し、ダイスの出目（1D100 / CCBコマンド等）の頻度をヒストグラム化・可視化するWebアプリケーションです。

---

## 🚀 技術スタック

| 分野 | 採用技術 |
| :--- | :--- |
| **フロントエンド / コア** | Next.js 15 (App Router), React 19, TypeScript |
| **デザイン・スタイリング** | Tailwind CSS, Glassmorphism UI, Lucide Icons |
| **グラフ・可視化** | Chart.js, react-chartjs-2 |
| **単体テスト** | Vitest, JSDOM |
| **コンテナ化** | Docker (Node.js 20 Alpine Multi-stage build) |

---

## 🛠️ 1. 環境構築 (Setup)

### 1.1 前提条件
以下の環境がインストールされていることを確認してください。
- **Node.js**: `v20.0.0` 以上推奨 (v24 確認済み)
- **npm**: `v10.0.0` 以上推奨
- **Docker**: (任意) コンテナ動作確認用

### 1.2 リポジトリのクローンと依存パッケージのインストール
```bash
# リポジトリのクローン
git clone https://github.com/kitsystemyou/ccf-log-analyzer.git
cd ccf-log-analyzer

# ブランチの切り替え（開発ブランチの場合）
git checkout feat/nextjs-migration

# 依存パッケージのインストール
npm install
```

---

## 🏃 2. 動作確認および単体テスト実行方法

### 2.1 ローカル開発サーバーの起動
開発モードで起動し、即座にコード変更を確認できます。
```bash
npm run dev
```
起動後、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

### 2.2 プロダクションビルドと実行
本番用ビルドを作成し、実行します。
```bash
# ビルドの実行
npm run build

# 本番サーバーの起動
npm start
```

### 2.3 単体テストの実行
Vitest を使用した TypeScript 単体テストを実行します。
```bash
# 1回のみ全テストを実行
npm test

# ウォッチモードでテストを実行（開発時）
npm run test:watch
```

### 2.4 Docker での動作確認
Dockerfile を使用してマルチステージビルドを行い、コンテナ上で起動します。
```bash
# Docker イメージのビルド
docker build -t ccf-log-analyzer:latest .

# Docker コンテナの実行 (ポート 3000)
docker run -d -p 3000:3000 --name ccf-app ccf-log-analyzer:latest
```
起動後、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして動作確認ができます。

---

## 📖 使い方 (How to use)

1. ココフォリアの部屋からチャットログ（`xxx.html`）を出力します。
2. ブラウザでログファイルを開くかテキストをコピーします。
3. 本アプリのテキストエリアにログを貼り付け、「🌟 解 析 開 始 🌟」ボタンを押します。
4. 全体およびユーザー別のダイス出目ヒストグラム（1〜10, 11〜20, ... 91〜100）やクリティカル・ファンブル率が表示されます。
