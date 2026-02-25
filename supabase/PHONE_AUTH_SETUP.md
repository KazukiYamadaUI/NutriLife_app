# NutriLife 電話番号認証（SMS OTP）セットアップガイド

## 概要

NutriLife は Supabase Auth + Twilio を使った SMS OTP 認証を採用しています。
このドキュメントでは、本番環境での電話認証を有効にする手順を説明します。

---

## 1. Twilio の準備

### 1-1. アカウント作成

1. [Twilio](https://www.twilio.com/) でアカウントを作成
2. コンソールのダッシュボードから以下を控える:
   - **Account SID** (`AC` で始まる文字列)
   - **Auth Token**

### 1-2. 電話番号の購入

1. Twilio Console > **Phone Numbers** > **Buy a Number**
2. 条件:
   - **Country**: 日本 (`+81`) または米国 (`+1`) など
   - **Capabilities**: **SMS** にチェック
3. 購入した番号を控える（例: `+1234567890`）

### 1-3. Messaging Service の作成（推奨）

1. Twilio Console > **Messaging** > **Services** > **Create Messaging Service**
2. サービス名: `NutriLife`
3. 購入した番号を Sender Pool に追加
4. **Messaging Service SID** (`MG` で始まる文字列) を控える

---

## 2. Supabase ダッシュボードの設定

### 2-1. Phone Provider の有効化

1. [Supabase Dashboard](https://supabase.com/dashboard) > プロジェクト選択
2. **Authentication** > **Providers** に移動
3. **Phone** を展開
4. **Enable Phone provider** をオンにする

### 2-2. Twilio 認証情報の入力

| 項目 | 入力値 |
|------|--------|
| SMS Provider | **Twilio** |
| Twilio Account SID | `AC...` (Step 1-1 で取得) |
| Twilio Auth Token | Step 1-1 で取得した Auth Token |
| Twilio Message Service SID | `MG...` (Step 1-3 で取得) |

> Messaging Service を使わない場合は、**Twilio Phone Number** に購入した番号を入力

### 2-3. OTP 設定

| 項目 | 推奨値 |
|------|--------|
| SMS OTP Length | **6** (アプリ側は 6 桁で実装済み) |
| SMS OTP Expiry | **300** (秒 = 5 分) |
| SMS Template | `NutriLife の認証番号は {{ .Code }} です。5分以内に入力してください。` |

### 2-4. レート制限

**Authentication** > **Rate Limits** で確認:

| 項目 | 推奨値 |
|------|--------|
| SMS sent per hour | **30** (開発中は緩和可) |

### 2-5. テスト用電話番号（開発用）

1. **Authentication** > **Phone Auth** セクション
2. **Test Phone Numbers** にテスト番号を追加:

| 電話番号 | OTP コード |
|----------|-----------|
| `819012345678` | `123456` |
| `818011112222` | `654321` |

入力形式（`+` プレフィックスなし、カンマ区切り）:
```
819012345678=123456,818011112222=654321
```

> テスト番号では実際の SMS は送信されず、登録した固定コードで認証できます。

---

## 3. 環境変数の設定

プロジェクトルートの `.env` に以下を設定:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_MESSAGE_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> `.env` は `.gitignore` に含まれています。絶対にコミットしないでください。

---

## 4. ローカル開発での設定

`supabase/config.toml` にはローカル開発用の設定が含まれています:

- `[auth.sms]` セクション: SMS 認証の有効化・テンプレート
- `[auth.sms.test_otp]` セクション: テスト用電話番号マッピング
- `[auth.sms.twilio]` セクション: Twilio 接続設定

ローカルで Supabase を起動する場合:

```bash
npx supabase start
```

---

## 5. 動作確認チェックリスト

- [ ] Twilio アカウント作成済み
- [ ] Twilio で SMS 対応の電話番号を購入済み
- [ ] Messaging Service を作成し、番号を追加済み
- [ ] `.env` に `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGE_SERVICE_SID` を設定済み
- [ ] Supabase Dashboard で Phone provider を有効化済み
- [ ] Twilio の認証情報をダッシュボードに入力済み
- [ ] SMS Template に `{{ .Code }}` を含めた
- [ ] OTP Length を 6 に設定済み
- [ ] テスト用電話番号を登録済み（開発時）
- [ ] アプリから OTP 送信 → SMS 受信 → コード入力 → ログイン成功を確認

---

## 6. 本番リリース前の注意点

- Twilio Trial アカウントでは **Verified な番号にしか SMS を送れない** 制限あり
- 本番環境では Twilio アカウントを **昇格（Upgrade）** する必要がある
- 日本の番号への SMS 送信料金: 約 **$0.07-0.08/通**
- Supabase の Phone Auth は **Pro プラン以上** で推奨（無料プランでは制限あり）

## 7. トラブルシューティング

| 症状 | 原因・対処 |
|------|-----------|
| SMS が届かない | Twilio Trial の場合は Verified 番号のみ送信可。番号を Verify するか、アカウントを Upgrade |
| `signInWithOtp` でエラー | Supabase Dashboard で Phone provider が有効になっているか確認 |
| OTP が無効と表示される | 有効期限（5分）を過ぎていないか確認。時計のずれにも注意 |
| レート制限エラー | 60 秒以内に再送信している可能性。`max_frequency` を確認 |
