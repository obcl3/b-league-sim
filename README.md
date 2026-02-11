# B.LEAGUE Simulation Game (Next.js)

B1リーグのHC（ヘッドコーチ）になって全60試合を戦い抜くシミュレーションゲーム。🦅🏀

## 特徴
- **リアルなデータ:** Bリーグ公式サイトのスタッツに基づいた選手パラメータ。
- **2Dシミュレーション:** コート上の動きとPlay-by-Play形式の実況ログ。
- **マネジメント:** スタミナを管理し、適切なタイミングでタイムアウトや選手交代を行う。

## 技術構成
- **Frontend:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 開発状況
- [x] Next.js プロジェクト初期化
- [x] 選手データ構造 (JSON) とパラメータ計算ロジック
- [x] 試合シミュレーションエンジン (TypeScript)
- [x] 基本的なUI (スコアボード、コート、ログ)
- [ ] 選手交代・タイムアウト機能
- [ ] セーブ機能 (LocalStorage)
- [ ] 全B1チームのデータ対応

## ライセンス
MIT
