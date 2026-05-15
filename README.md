# 高速道路 渋滞ヒートマップ

ルート × 時間帯の 2D ヒートマップで高速道路の混雑を一望し、おすすめ出発時刻を自動算出するアプリ。

- **Web 版**: ルート直下の `index.html` がそのまま動く（GitHub Pages 配信）
- **モバイルアプリ**: [Expo](https://expo.dev/) + `react-native-webview` で iOS / Android にラップ。Expo Go アプリで QR コードを読むだけで実機プレビュー可能。

## 機能

- 入口IC → 出口IC をオートコンプリートで検索（BFS 経路探索）
- 6 種類の混雑プロファイル（郊外通勤型・都心慢性型・首都圏環状型・首都圏外縁型・都市高速型・地方路線型）
- 日付要因（曜日・5/10日・祝日・GW・お盆・年末年始）の自動検出
- 縦=IC × 横=時間帯 の 2D ヒートマップ（5 段階カラー）
- 出発時刻スライダーに連動した「斜め線トレース」で渋滞突入時間を可視化
- 0–23 時を全スキャンしてスコア合計が最小になる **おすすめ出発時刻** を提案

## ディレクトリ構成

```
.
├── index.html              # Web 版エントリ。アプリの本体（編集はここ）
├── App.js                  # Expo の WebView ラッパ
├── htmlContent.js          # AUTO-GENERATED: index.html を JS 文字列に変換したもの
├── scripts/build-html.js   # 上記を生成するビルドスクリプト
├── app.json                # Expo 設定（アプリ名・bundle id・splash 等）
├── index.js                # Expo エントリポイント
├── assets/                 # アイコン・スプラッシュ画像
└── package.json
```

`htmlContent.js` は `.gitignore` 済み。`npm start` の `prestart` フックで自動再生成されるため、`index.html` を編集すればそのまま反映されます。

## セットアップ

```bash
npm install
```

スマホ側に **Expo Go** アプリ（[App Store](https://apps.apple.com/jp/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)）をインストールしておきます。

## 開発ワークフロー

### 実機プレビュー（Expo Go）

```bash
npm start
```

ターミナルに QR コードが表示されるので、

- **iOS**: 標準カメラアプリで QR を読み取り → Expo Go が起動
- **Android**: Expo Go アプリ内のスキャナで QR を読み取り

スマホと PC が同じ Wi-Fi 上にあれば即座にプレビューできます。別ネットワークなら `npx expo start --tunnel` でトンネルモード。

### Web で確認

```bash
python3 -m http.server 8765   # ルート直下で
open http://localhost:8765
```

`index.html` を直接ブラウザで開く形。Expo は経由しません。

### iOS シミュレータ / Android エミュレータで起動

```bash
npm run ios       # Xcode のシミュレータ起動が必要
npm run android   # Android Studio のエミュレータ起動が必要
```

## 配布（EAS Build）

Expo Go は開発用サンドボックス。App Store / Google Play に出す場合は EAS Build を使います。

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios          # iOS .ipa
eas build -p android      # Android .aab
eas submit -p ios         # App Store Connect にアップロード
eas submit -p android     # Google Play Console にアップロード
```

iOS の本番ビルドには Apple Developer Program アカウント（年 $99）が必要です。

## アプリ情報

- **App 名**: 渋滞ヒートマップ
- **Bundle ID**: `com.nori.highwayheatmap`
- **背景色**: `#0f172a`（ダークテーマ）
- **方式**: WebView ベース（HTML/CSS/JS をそのまま実機表示）

## 配布前のチェックリスト

- [ ] `assets/icon.png` `assets/splash-icon.png` `assets/adaptive-icon.png` を専用デザインに差し替え
- [ ] `app.json` の `version` をリリース番号に更新
- [ ] プライバシーポリシー URL を Store 提出時に明記
- [ ] EAS Build で本番アプリをビルド・署名
- [ ] TestFlight / Internal Testing で実機検証

## 注意

予測値は過去の傾向・統計に基づく参考情報で、実際の交通状況とは異なる場合があります。
