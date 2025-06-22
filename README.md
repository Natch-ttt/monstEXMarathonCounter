# monstEXMarathonCounter

> Track your “モンスト” EX-ステージ encounters & marathon stats in browser (Ionic + Vue).

[![Deploy to GitHub Pages](https://github.com/<ユーザ名>/monstEXMarathonCounter/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/<ユーザ名>/monstEXMarathonCounter/actions/workflows/gh-pages.yml)

## 📝 Description

monstEXMarathonCounter は、モンストの EX ステージ遭遇までの周回数をカウントし、遭遇率／最短・最長周回などの統計情報を記録する Ionic + Vue ベースのカウンターアプリです。

## 🚀 Live Demo

https://natch789.github.io/monstEXMarathonCounter/

## 💻 Installation

```bash
# リポジトリをクローン
git clone https://github.com/natch789/monstEXMarathonCounter.git
cd monstEXMarathonCounter

# 依存パッケージをインストール
npm install
# または
yarn

# 開発サーバーを起動
npm run dev
# または
yarn dev
```

## 🔧 Usage

1. **Run** ボタンを押すとカウントが +1  
2. **Encounter** ボタンを押すとカウントを 0 リセット＆統計を更新  
3. 画面上に、遭遇率／総周回数／最小周回数／最大周回数／ラック数 が表示される  
4. データは端末内ストレージ（Ionic Storage）に自動保存

## 📁 Project Structure

```
monstEXMarathonCounter/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ pages/
│  ├─ router/
│  ├─ store/       ← Ionic Storage やロジック用
│  └─ App.vue
├─ vite.config.ts  ← base: '/monstEXMarathonCounter/'
└─ package.json
```

## 🛠️ Next Steps

- Ionic Storage のセットアップ  
- カウント画面コンポーネント作成  
- 統計算出ロジック実装  
- Capacitor を使った iOS/Android ビルド  

## 🔖 License

MIT
