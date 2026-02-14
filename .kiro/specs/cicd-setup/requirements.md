# 要件定義書 (Requirements Document)

## プロジェクト概要 (Project Description)
Python 3.12 プロジェクトにおいて、Docker環境を活用した GitHub Actions による CI/CD パイプラインを整備します。ローカルと CI の差異をなくすため、すべての検証処理（Lint, Type Check, Test）を Docker コンテナ内部で実行し、ビルドキャッシュの最適化やセキュリティスキャンを組み込みます。また、AI Code Review として CodeRabbit を導入し、日本語でのフィードバックを自動化します。

## 要件 (Requirements)

### Requirement 1: Dockerビルドとキャッシュ最適化
**Objective:** 開発者として、CIの実行時間を短縮しつつ、常に最新かつ一貫性のあるイメージで検証を行えるようにします。

#### Acceptance Criteria
1. The CIシステム shall `docker/setup-buildx-action` を使用して Docker Buildx をセットアップする。
2. The CIシステム shall `cache-from` および `cache-to` を使用して、GitHub Actions のキャッシュ機能（type=gha）を最大限に活用する。
3. The CIシステム shall マルチステージビルドを活用した Dockerfile を使用し、ビルド時間を短縮する。

### Requirement 2: コンテナ内での静的解析 (Lint & Type Check)
**Objective:** 開発者として、コードの品質と型の整合性を Docker 環境内で保証することで、依存関係の差異による問題を排除します。

#### Acceptance Criteria
1. When パイプラインが実行されたとき, the CIシステム shall ビルドしたコンテナ内で `Ruff` を実行し、コード規約違反とインポート順序をチェックする。
2. When パイプラインが実行されたとき, the CIシステム shall ビルドしたコンテナ内で `Ruff format --check` を実行し、フォーマットを検証する。
3. When パイプラインが実行されたとき, the CIシステム shall ビルドしたコンテナ内で `mypy` を実行し、型整合性をチェックする。

### Requirement 3: コンテナ内でのユニットテスト
**Objective:** 開発者として、アプリケーションの機能が意図通りに動作することを Docker 環境内で検証します。

#### Acceptance Criteria
1. When パイプラインが実行されたとき, the CIシステム shall ビルドしたコンテナ内で `pytest` を実行し、すべてのテストを通過させる。
2. The テスト実行 shall `docker run` または `docker-compose run` を使用して、分離された環境で行われる。

### Requirement 4: コンテナセキュリティチェック
**Objective:** 管理者として、使用しているベースイメージやライブラリに重大な脆弱性が含まれていないことを保証します。

#### Acceptance Criteria
1. The CIシステム shall `Trivy` を使用して、ビルドした Docker イメージの脆弱性スキャンを実行する。
2. If 重大な脆弱性 (CRITICAL) が見つかったとき, then the CIシステム shall ジョブを失敗させ、デプロイやマージを防止する。

### Requirement 5: AI Code Review 設定 (日本語対応)
**Objective:** 開発チームとして、AI によるコードレビューを導入し、レビューの質と速度を向上させます。また、チームの円滑なコミュニケーションのために出力を日本語に統一します。

#### Acceptance Criteria
1. The プロジェクト shall CodeRabbit の設定ファイル `.coderabbit.yaml` のテンプレートをルートディレクトリに保持する。
2. The CIシステム shall CodeRabbit からのレビューコメントおよび概要が必ず**日本語**で出力されるように設定する。

### Requirement 6: 成果物定義
**Objective:** 開発者として、必要な設定ファイルがすべて揃っている状態にします。

#### Acceptance Criteria
1. The 成果物 shall 以下のファイルを含む：
    - `Dockerfile` (マルチステージビルド対応)
    - `docker-compose.yml` (テスト実行コマンド定義用)
    - `.github/workflows/ci.yml` (GitHub Actions設定)
    - `.coderabbit.yaml` (AIレビュー設定、日本語出力指定)
