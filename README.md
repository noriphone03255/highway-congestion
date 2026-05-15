# 高速道路 渋滞ヒートマップ

ルート × 時間帯の 2D ヒートマップで高速道路の混雑を一望し、おすすめ出発時刻を自動算出する Web / iOS / Android アプリ。

- **Web 版**: ルート直下の `index.html` がそのまま動く（GitHub Pages 配信）
- **ネイティブ版**: [Capacitor](https://capacitorjs.com/) で iOS / Android プロジェクトを生成

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
├── index.html              # Web 版エントリ（編集はここ）
├── www/                    # Capacitor ビルド出力（.gitignore）
├── ios/                    # iOS Xcode プロジェクト
├── android/                # Android Studio プロジェクト
├── capacitor.config.json   # Capacitor 設定
└── package.json
```

## セットアップ

```bash
npm install
```

Capacitor 8 系から iOS プラグインは Swift Package Manager 経由で取り込まれるため、**CocoaPods は不要** です。

### 必要な開発環境

| プラットフォーム | 必要 |
| --- | --- |
| iOS | Xcode 15+ / iOS 14.0+ ターゲット |
| Android | Android Studio Iguana+ / Android SDK 34+ |

## 開発ワークフロー

### 1. Web で確認

```bash
python3 -m http.server 8765   # ルート直下で
open http://localhost:8765
```

### 2. ネイティブに同期

`index.html` を編集したら必ず実行：

```bash
npm run sync
```

これで `www/index.html` を更新し、`cap sync` で iOS/Android 両プロジェクトに反映されます。

### 3. iOS で起動

```bash
npm run ios          # Xcode を開く
# Xcode 上で実機 or シミュレータを選択して ▶ 実行
```

シミュレータ未インストールの場合は Xcode → Settings → Components から iOS Simulator runtime をダウンロード。

### 4. Android で起動

```bash
npm run android      # Android Studio を開く
# Gradle 同期完了後、▶ 実行
```

## アプリ情報

- **App ID**: `com.nori.highwayheatmap`
- **App 名**: 渋滞ヒートマップ
- **背景色**: `#0f172a`（ダークテーマ）
- **対応プラグイン**: `@capacitor/status-bar`, `@capacitor/app`（Android 戻るボタン → 前画面遷移）

## 配布前のチェックリスト

- [ ] アプリアイコン（`ios/App/App/Assets.xcassets/AppIcon.appiconset/`、`android/app/src/main/res/mipmap-*/`）を差し替え
- [ ] `CFBundleShortVersionString` / `versionName` をリリース番号に更新
- [ ] iOS: 開発者アカウントで署名 → Archive → App Store Connect
- [ ] Android: `keystore` 作成 → `./gradlew assembleRelease` → Play Console アップロード
- [ ] プライバシーポリシー URL を Store 提出時に明記

## 注意

予測値は過去の傾向・統計に基づく参考情報で、実際の交通状況とは異なる場合があります。
