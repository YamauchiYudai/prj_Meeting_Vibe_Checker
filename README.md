# Meeting Vibe Checker 📊✨

Meeting Vibe Checkerは、会議中の参加者の表情をリアルタイムで解析し、その場の「空気感（Vibe）」を可視化するWebアプリケーションです。
プライバシーに配慮しつつ、最新のAI技術（DeepFace）を用いて感情の変遷をグラフ化します。

## 🌟 主な機能
- **リアルタイム感情解析**: カメラ映像から「幸福」「驚き」「中立」などの感情を3〜5秒間隔で抽出。
- **プライバシー保護設計**: 解析に使用した画像フレームはメモリ上でのみ処理され、即座に破棄されます（DBやディスクには一切保存されません）。
- **セッション管理**: 会議ごとにセッションを作成し、過去のデータの振り返りが可能。
- **ダイナミック可視化**: 解析結果を美しいチャートとゲージでリアルタイムに表示。

## 🏗 システム構成
本システムは Docker Compose を利用した3層アーキテクチャで構成されています。

- **Frontend**: Next.js (TypeScript, Tailwind CSS, Recharts)
- **Backend API**: FastAPI (Python 3.11, DeepFace, OpenCV)
- **Database**: PostgreSQL (SQLAlchemy Async, Alembic)

---

## 🚀 クイックスタート

### 1. 前提条件
- Docker および Docker Desktop がインストールされていること。

### 2. セットアップ
プロジェクトのルートディレクトリで以下のコマンドを実行します。

```bash
# 環境変数の準備 (必要に応じて .env を編集)
cp .env.example .env

# 全サービスのビルドと起動
docker compose up --build -d
```

### 3. アクセス
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠 開発と運用

### バックエンドの技術的詳細
- **AIエンジン**: DeepFace (VGG-Face/TensorFlow)。表情から7つの感情スコアを算出します。
- **非同期処理**: FastAPI + SQLAlchemy (Async) により、重い画像解析リクエストとDB操作を並列処理。
- **最適化**: TensorFlow の互換性を保つため `tf-keras` を導入し、OpenCVのOS依存ライブラリをDockerで解決済み。

### フロントエンドの技術的詳細
- **ライブUI**: Lucide React と Recharts を使用したプレミアムなデザイン。
- **カメラ連携**: ブラウザの `getUserMedia` API を使用し、Base64形式でバックエンドへフレームを送信。

### テストの実行
バックエンドの単体テストおよび機能テストを実行します。

```bash
docker compose run --rm -e PYTHONPATH=/app backend pytest tests/ -v
```

---

## 🔒 セキュリティとプライバシー
- データベースには感情スコア（数値）とタイムスタンプのみを保存します。
- ユーザーの顔画像、ビデオストリームは一切保存されません。
- CORS設定により、許可されたオリジン（デフォルト: localhost:3000）からのリクエストのみを受け付けます。

## 📝 ライセンス
本プロジェクトは内部開発用MVPとして作成されました。
