# リポジトリ設定概要: Meeting Vibe Checker (MVP Foundation)

## リポジトリタイトル
`meeting-vibe-checker-mvp`

## プロジェクト概要
Meeting Vibe Checkerは、オンライン会議やワークショップにおける参加者の感情（感情の起伏）やエンゲージメントをリアルタイムで可視化するためのツールです。本リポジトリは、そのMVP（最小実用製品）の基盤となる初期セットアップを管理します。

表情解析エンジンとして **Py-Feat** を採用し、**Streamlit** と **WebRTC** を組み合わせることで、ブラウザベースで低レイテンシなリアルタイム・フィードバック・ループを実現します。

## 主な機能（MVP Foundation）
- **リアルタイム表情解析**: Webカメラからの映像をキャプチャし、Py-Feat（HOG-PCA/SVMモデル）を使用して、喜び、悲しみ、驚きなどの感情を即時に数値化します。
- **ライブ・ダッシュボード**: Streamlitを使用した動的なUIにより、感情の推移をリアルタイムのグラフとして表示します。
- **プライバシー・バイ・デザイン**: 画像データは一切ディスクに保存せず、すべてインメモリで処理されます。解析後のフレームデータは即座に破棄されるため、セキュアなミーティング環境を提供します。
- **低レイテンシ設計**: 処理パイプラインの最適化（リサイズ、フレームスキップ等）により、2秒以内の処理遅延を実現します。

## 技術スタック
- **Language**: Python 3.9+
- **Frontend/Backend**: Streamlit
- **Real-time Video**: streamlit-webrtc
- **Analysis**: Py-Feat (Facial Expression Analysis Toolbox)
- **Computer Vision**: OpenCV-Python
- **Data Handling**: Pandas, NumPy

## プロジェクト構造
```text
src/
├── analysis/  # Py-Feat/OpenCVを用いた解析ロジック
└── ui/        # Streamlitによるダッシュボードコンポーネント
tests/         # ユニットテストおよびパフォーマンス検証
```

## 今後の展望
- ミーティング後の「雰囲気レポート」の自動生成
- 複数人の同時解析と平均エンゲージメントの算出
- カレンダー連携やWeb会議プラットフォーム（Zoom/Teams）との統合
