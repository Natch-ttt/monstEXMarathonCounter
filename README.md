# monstEX Counter
シンプルかつ高機能な「モンスト」周回カウンターアプリです。

https://natch789.github.io/monstEXMarathonCounter/

## 主要機能
- 周回数・遭遇数・収集数の管理

- 過去に遭遇したときの周回数をログとして閲覧

- オプションで各情報の表示／背景色の管理

- 禁忌EXモード：至宝・ラキリザの管理

- 天魔EXモード：複数ドロップ数・率の管理（2～5体ドロップ数）

- 絶級EXモード：直ドロップ数・率の管理（3～5体ドロップ数）

- 各カウンターごとの JSON バックアップ・リストア

## 使い方
> 上部メニューの「＋」ボタンからカウンターを追加  
> 各カウンターをタップして詳細へ

> カウンターページの「＋」ボタンで周回を記録  
> EXステージが出現し挑戦できたら「遭遇」ボタンで収集数を入力  
> （敗北してしまった場合は、収集数に0を入力）

> 上部のメニューマークで遭遇ログを開く  
> 過去に遭遇したときの周回数をログとして閲覧することができる

> 上部の歯車マークで設定画面を開く  
> 禁忌EXモード／天魔EXモード／絶級モードを切替できる  
> 各集計要素の表示切替／背景色の管理ができる

## セットアップ
```bash
git clone https://github.com/your-org/monstEX-counter.git
cd monstEX-counter
npm install
npm run dev # Web 開発サーバー起動
```

## ハイブリッドビルド（Capacitor）
```bash
npm run build
npx cap add android ios
npx cap copy
npx cap open android     # or ios
```
