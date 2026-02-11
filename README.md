# Meeting Vibe Checker (MVP)

Meeting Vibe Checker は、デジタル会議中の感情のトーンやエンゲージメントレベルをリアルタイムで解析・可視化するツールです。

## 🌟 主な機能

- **リアルタイム表情解析**: Webカメラの映像から参加者の表情を読み取り、感情（喜び、悲しみ、怒りなど）を分析します。
- **ライブダッシュボード**: 解析された「雰囲気（Vibe）」をグラフやメトリクスで即座に表示します。
- **プライバシー保護**: 画像データはローカルのメモリ内でのみ処理され、ディスクへの保存や外部への送信は一切行われません。

## 🛠 技術スタック

- **Language**: Python 3.9+
- **GUI Framework**: Streamlit (リアルタイムダッシュボード用)
- **AI/CV Library**: 
  - [Py-Feat](https://py-feat.org/): 表情解析 (HOG-PCA / SVMモデル)
  - [OpenCV](https://opencv.org/): 画像キャプチャ・前処理
  - [streamlit-webrtc](https://github.com/whitphx/streamlit-webrtc): 低レイテンシなWebRTCストリーミング
- **Data Handling**: Pandas, NumPy

## 🏗 アーキテクチャ

本プロジェクトは、`streamlit-webrtc` を利用した **Threaded Callback Architecture** を採用しています。ビデオフレームのキャプチャと Py-Feat による解析はバックグラウンドスレッドで実行され、UIスレッドをブロックすることなくリアルタイムな可視化を実現します。

詳細は `.kiro/specs/initial-setup/design.md` を参照してください。

## 🚀 はじめかた

### 1. 環境構築
```bash
# 仮想環境の作成 (推奨)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 依存ライブラリのインストール
pip install -r requirements.txt
```

### 2. アプリケーションの起動
```bash
streamlit run src/app.py
```

## 🔒 プライバシーポリシー (Privacy First)

- 全ての画像処理はユーザーのローカルPC内で行われます。
- キャプチャした画像フレームは解析後、直ちにメモリから破棄されます。
- raw画像や個人を特定できるデータが永続化されることはありません。
