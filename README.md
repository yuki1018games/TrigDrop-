# Trig Drop！ (高校数学 三角比・三角関数 即答防衛ゲーム)

落下してくる三角比・三角関数（sin, cos, tan）や方程式、度数法・弧度法変換の値を制限時間内に素早く答えて迎撃する体力制数学アクションゲーム。

## 技術スタック
- **Frontend**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Audio**: Web Audio API (ブラウザ標準)

## デプロイ設定 (Vercel)
Vercel に GitHub リポジトリをインポートするだけで自動検出されます：
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **SPA Rewrites**: `vercel.json` に設定済み

## ローカル開発
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (port: 3000)
npm run dev

# 型チェック
npm run lint

# プロダクションビルド
npm run build
```
