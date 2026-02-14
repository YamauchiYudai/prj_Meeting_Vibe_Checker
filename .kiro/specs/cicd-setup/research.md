# Research & Design Decisions: cicd-setup

---
**Purpose**: Capture discovery findings and architectural decisions for the CI/CD pipeline setup using GitHub Actions, Docker, and CodeRabbit.

**Usage**: Log research outcomes and design trade-offs to ensure a robust and optimized CI/CD process.
---

## Summary
- **Feature**: cicd-setup
- **Discovery Scope**: Complex Integration (GitHub Actions + Docker + Security + AI Review)
- **Key Findings**:
  - `type=gha` と `mode=max` を組み合わせることで、GitHub Actions 上での Docker レイヤーキャッシュを最大限に活用可能。
  - すべての検証（Ruff, mypy, pytest）を Docker コンテナ内で行う際、`--rm` フラグとワークスペースのマウント（`-v`）が不可欠。
  - Trivy のスキャン結果に基づいてジョブを失敗させるには、`--exit-code 1 --severity CRITICAL` の設定が必要。
  - CodeRabbit の日本語出力は `.coderabbit.yaml` の `language: ja-JP` 設定で実現可能。

## Research Log

### Docker Cache Optimization in GitHub Actions
- **Context**: CIの実行時間を短縮するためのキャッシュ戦略の選定。
- **Sources Consulted**: Docker 公式ドキュメント, GitHub Actions `docker/build-push-action` ドキュメント。
- **Findings**: 
  - `type=gha` エクスポーターは GitHub Actions 向けに最適化されており、外部ストレージなしでキャッシュを管理できる。
  - `mode=max` を指定しないと、中間レイヤーがキャッシュされず、マルチステージビルドでの効率が落ちる。
- **Implications**: `docker/setup-buildx-action` の導入と、`build-push-action` での適切なキャッシュパラメータ設定が必要。

### Running Tools inside Docker
- **Context**: ローカル環境と CI 環境の完全な一致。
- **Findings**:
  - `docker run` で実行する場合、GitHub のワークスペースをコンテナ内の作業ディレクトリにマウントすることで、最新のソースコードに対して検証を行える。
  - `ruff` の `--output-format=github` フラグを使うと、GitHub の PR 上にアノテーションとしてエラーが表示され、視認性が向上する。
- **Implications**: `docker-compose.yml` をテスト用プロファイルとともに用意することで、ローカルでも同様のコマンドが叩けるように設計する。

### Trivy Security Scanning
- **Context**: セキュリティ脆弱性の自動検知とゲート。
- **Findings**:
  - `aquasecurity/trivy-action` を使うことで、ビルドしたイメージを直接スキャン可能。
  - `severity: 'CRITICAL'` かつ `exit-code: '1'` に設定することで、重大な問題がある場合のみビルドを停止できる。
- **Implications**: イメージビルド直後にスキャンステップを挿入する。

### CodeRabbit Configuration
- **Context**: AI による日本語でのコードレビュー。
- **Findings**:
  - `.coderabbit.yaml` の `language: ja-JP` 設定により、要約やコメントが日本語化される。
- **Implications**: プロジェクトルートに設定ファイルを配置し、初期設定として日本語を指定する。

## Design Decisions

### Decision: マルチステージビルドによる Dockerfile 構成
- **Context**: 開発・テスト環境と本番環境のイメージを共通化しつつ、サイズとセキュリティを両立したい。
- **Selected Approach**: `base`, `development`, `production` のステージを分ける。
- **Rationale**: 共通の依存関係は `base` でインストールし、`development` で `ruff`, `mypy`, `pytest` などの開発用ツールを追加する。
- **Trade-offs**: Dockerfile がやや複雑になるが、CI で使用するイメージと開発者がローカルで使うイメージを一致させられる。

### Decision: CI 実行時の実行主体
- **Context**: `docker-compose run` か `docker run` か。
- **Selected Approach**: GitHub Actions 上では `docker run` (または `docker exec`) を基本とし、ローカル利便性のために `docker-compose.yml` も提供する。
- **Rationale**: GitHub Actions の `docker/build-push-action` でビルドしたイメージをそのまま `docker run` する方が、キャッシュの恩恵を直接受けやすく、設定がシンプルになる。

## Risks & Mitigations
- Docker キャッシュのサイズ制限 (10GB) — 定期的なキャッシュパージや不要なレイヤーの削減を検討する。
- Trivy による偽陽性 — 必要に応じて `.trivyignore` を導入し、許容可能な脆弱性を管理する。
- AI レビューのコスト — CodeRabbit の無料枠や利用頻度を監視する。

## References
- [Docker Buildx Cache GHA](https://docs.docker.com/build/ci/github-actions/cache/#github-actions-cache)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)
- [CodeRabbit Configuration](https://docs.coderabbit.ai/getting-started/configure-coderabbit/)
