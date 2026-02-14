# NutriLife - AI栄養管理アプリ

食事の写真を撮るだけで、AIが栄養バランスを解析し、パーソナライズされたアドバイスを提供するReact Nativeアプリケーションです。

## 機能

- **SMS認証**: 電話番号によるセキュアなログイン
- **食事写真解析**: カメラまたはアルバムから食事画像をAI解析
- **栄養スコア表示**: カロリー、たんぱく質、脂質、炭水化物、食物繊維、塩分を分析
- **パーソナライズドアドバイス**: ユーザーの体格・運動量・ヘルスデータに基づく提案
- **記録管理**: カレンダー表示、レーダーチャートでの栄養バランス可視化
- **ヘルスケア連携**: 歩数・心拍数・体重データとの統合

## 技術スタック

### フロントエンド
- React Native (Expo)
- TypeScript
- React Navigation (Stack + Bottom Tab)
- React Context API (状態管理)
- react-native-svg (グラフ・アイコン)
- expo-camera / expo-image-picker
- expo-secure-store (認証トークン保存)
- axios (HTTP通信)

### バックエンド
- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- Google Gemini API (食事画像解析)
- Twilio (SMS認証)
- JWT (認証トークン)
- Zod (バリデーション)

## セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator または Android Emulator (またはExpo Goアプリ)

### 1. フロントエンド

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npx expo start
```

### 2. バックエンド

```bash
cd backend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報等を設定

# データベースの作成
createdb nutrilife

# Prismaマイグレーション実行
npx prisma migrate dev --name init

# 開発サーバー起動
npm run dev
```

### 3. 環境変数

`backend/.env` に以下を設定:

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL接続URL | 必須 |
| `JWT_SECRET` | JWT署名用シークレット | 必須 |
| `GEMINI_API_KEY` | Gemini APIキー | オプション (なければモック解析) |
| `TWILIO_ACCOUNT_SID` | Twilio アカウントSID | オプション (なければコンソール出力) |
| `TWILIO_AUTH_TOKEN` | Twilio 認証トークン | オプション |
| `TWILIO_PHONE_NUMBER` | Twilio 送信元電話番号 | オプション |

### モック動作モード

Gemini APIキーやTwilioの設定がない場合でも、アプリは以下のモックモードで動作します:

- **SMS認証**: 認証コードがサーバーのコンソールに出力されます
- **食事解析**: ランダムなサンプルデータが返されます
- **バックエンド未接続時**: フロントエンド側のモックデータで全画面が動作します

## プロジェクト構成

```
NutriLife_app/
├── App.tsx                  # アプリエントリーポイント
├── src/
│   ├── api/                 # APIクライアント層
│   ├── components/          # 共通UIコンポーネント
│   ├── context/             # React Context (状態管理)
│   ├── navigation/          # React Navigation設定
│   ├── screens/             # 各画面コンポーネント
│   ├── theme/               # デザイントークン・スタイル
│   └── types/               # TypeScript型定義
├── backend/
│   ├── src/
│   │   ├── config/          # DB・環境変数設定
│   │   ├── middleware/      # 認証・アップロード・エラー処理
│   │   ├── routes/          # APIルーティング
│   │   └── services/        # ビジネスロジック (AI, SMS)
│   └── prisma/
│       └── schema.prisma    # データベーススキーマ
└── README.md
```

## APIエンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/auth/send-code` | SMS認証コード送信 |
| POST | `/api/auth/verify` | コード検証 + JWT発行 |
| GET | `/api/user/profile` | プロフィール取得 |
| PUT | `/api/user/profile` | プロフィール更新 |
| GET | `/api/user/lifestyle` | ライフスタイル設定取得 |
| PUT | `/api/user/lifestyle` | ライフスタイル設定更新 |
| POST | `/api/meals/analyze` | 食事画像解析 |
| GET | `/api/meals` | 食事ログ一覧 |
| GET | `/api/meals/:id` | 食事ログ詳細 |
| POST | `/api/meals/:id/feedback` | フィードバック送信 |
| POST | `/api/health/sync` | ヘルスデータ同期 |
| GET | `/api/health/summary` | ヘルスデータサマリー |

## ライセンス

Private - All rights reserved
