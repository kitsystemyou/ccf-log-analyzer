# Google Cloud (App Engine) デプロイ手順書

本ドキュメントでは、Google Cloud CLI (`gcloud`) を使用した Google App Engine (GAE) へのアプリケーションデプロイ手順、プロジェクト設定、および動作確認（トラフィックを割り当てない `--no-promote` デプロイ）から本番公開までのフローについて解説します。

---

## 1. 前提条件

- [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) がインストールされていること。
- デプロイ対象の Google Cloud プロジェクトに対する管理者権限（App Engine デプロイ権限）が付与されていること。
- リポジトリルートに `app.yaml` および必要なソースコードが存在すること。

---

## 2. 初期セットアップ & プロジェクト設定

### 2.1 Google アカウントへのログイン
```bash
gcloud auth login
```

### 2.2 プロジェクトの確認と切り替え
利用可能なプロジェクトの一覧を確認します。
```bash
gcloud projects list
```

対象のプロジェクト ID を設定します。
```bash
gcloud config set project <PROJECT_ID>
```

### 2.3 現在の設定内容を確認
設定されているプロジェクトやアカウントが正しいか確認します。
```bash
gcloud config list
# またはプロジェクトIDのみ確認
gcloud config get-value project
```

---

## 3. 動作確認用デプロイ（--no-promote）

`--no-promote` オプションを使用すると、既存の本番トラフィックに影響を与えずに、新規バージョンとしてデプロイできます。これにより、本番トラフィックを切り替える前に安全に動作確認を行えます。

### 3.1 バージョンを指定してデプロイ
バージョン名には日付やコミットハッシュ、セマンティックバージョニング等（例: `v1-0-0`, `test-20260818`）を付与することを推奨します。

```bash
# 例: バージョン名を指定してトラフィックを向けずにデプロイ
gcloud app deploy --no-promote --version=<VERSION_NAME>
```

### 3.2 デプロイされたバージョンの確認
デプロイ済みのバージョン一覧と、トラフィック割り当て状況を確認します。
```bash
gcloud app versions list
```

### 3.3 動作確認用 URL へのアクセス
デプロイした特定バージョンの URL を直接ブラウザで開いて動作確認します。

```bash
# 指定バージョンの URL をブラウザで開く
gcloud app browse --version=<VERSION_NAME>
```

> **Note:**
> バージョン固有の URL 形式は以下のようになります。
> `https://<VERSION_NAME>-dot-<PROJECT_ID>.<REGION_ID>.r.appspot.com`

---

## 4. 本番デプロイ & トラフィック切り替え

動作確認が完了したら、以下のいずれかの方法で本番トラフィックを適用します。

### パターンA: 動作確認済みバージョンへトラフィックを移行する場合
`--no-promote` でデプロイ済みのバージョンに対して、トラフィックを 100% 割り当てます。

```bash
gcloud app services set-traffic default --splits <VERSION_NAME>=1
```

### パターンB: 新規デプロイと同時に本番トラフィックを割り当てる場合
即座に本番適用したい場合は、`--no-promote` を付けずに（または `--promote` を指定して）デプロイします。

```bash
# バージョン名を自動生成、または明示して本番デプロイ
gcloud app deploy --version=<VERSION_NAME>
```

### 4.1 本番環境へのアクセス確認
```bash
gcloud app browse
```

---

## 5. ログ確認 & メンテナンス

### 5.1 リアルタイムログの確認
```bash
# 最新ログをストリーミング表示
gcloud app logs tail -s default

# 直近のログを閲覧
gcloud app logs read --limit=50
```

### 5.2 古いバージョンの停止・削除
過去の不要なバージョンインスタンスが稼働したままだと課金対象となる場合があります。確認後に停止または削除します。

```bash
# バージョンを停止
gcloud app versions stop <OLD_VERSION_NAME>

# バージョンを削除
gcloud app versions delete <OLD_VERSION_NAME>
```
