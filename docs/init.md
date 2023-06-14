# init

## install package manager

```bash
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf install nodejs 18.16.0
asdf reshim nodejs
node -v # v18.16.0
```

## init project

```bash
npx create-next-app@latest my-app --typescript --use-npm
# --typescript ... TypeScript を使う
# --use-npm ... npm を使う

# 以下はすべて Yes を選択
npx create-next-app@latest my-app --typescript --use-npm

✔ Would you like to use ESLint with this project? … No / Yes
✔ Would you like to use Tailwind CSS with this project? … No / Yes
✔ Would you like to use `src/` directory with this project? … No / Yes
✔ Use App Router (recommended)? … No / Yes
✔ Would you like to customize the default import alias? … No / Yes
✔ What import alias would you like configured? … @/*
Creating a new Next.js app in ${ローカルのパス}/tqer39/blog/my-app.
```

`./my-app` 配下のソースをすべてルートに移動。
そして下記は削除。

```txt
README.md
.gitignore
```

## Tailwind CSS

Tailwind CSS の設定ファイルを生成します。

```bash
npx tailwindcss init -p
```

ただ `create-next-app` を実行したときに Tailwind CSS を使うかどうか聞かれているので、そのときに Yes を選択していれば、必要なファイルはすでに生成されているため、以下のようなメッセージが表示されます。

```txt
tailwind.config.js already exists.
postcss.config.js already exist
```

## install package

### `eslint-plugin-prettier`

`ESLint` と `Prettier` を共存させるには、以下の手順を実行します。

```bash
npm install --save-exact --save-dev eslint-plugin-prettier
```

`ESLint` の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、`rules` セクションに `"prettier/prettier": "error"` を追加します。これにより `Prettier` と競合する `ESLint` ルールを無効にし、`Prettier` がフォーマットしたコードが `ESLint` でエラーを引き起こさないようにします。

例えば、`.eslintrc.json` の場合:

```json
{
  "rules": {
    "prettier/prettier": "error"
  }
}
```

`ESLint` と `Prettier` が同時にフォーマットすると問題が発生する可能性があるため、`Prettier` が `ESLint` ルールと競合しないように、次に `eslint-config-prettier` をインストールします：

### `eslint-config-prettier`

`JavaScript` および `TypeScript` の `import` 文の並び順を整理するための `ESLint` プラグインです。以下の手順でインストールして設定することができます。

```bash
npm install --save-exact --save-dev eslint-config-prettier
```

`extends` セクションに `"prettier"` を追加します。これにより、`Prettier` と競合する `ESLint` ルールを無効にします。

例えば、`.eslintrc.json` の場合:

```json
{
  "extends": ["prettier"]
}
```

### `eslint-plugin-simple-import-sort`

`import` や `require` の文法、使われていない変数、依存関係の問題など、モジュールの `import`/`export` に関連する問題を検出します。

```bash
npm install --save-exact --save-dev eslint-plugin-simple-import-sort
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
}
```

### `eslint-plugin-import`

`import` や `require` の文法、使われていない変数、依存関係の問題など、モジュールの `import`/`export` に関連する問題を検出します。

```bash
npm install --save-exact --save-dev eslint-plugin-import
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ]
}
```

### `eslint-plugin-unused-imports`

`import` や `require` の文法、使われていない変数、依存関係の問題など、モジュールの `import`/`export` に関連する問題を検出します。

```bash
npm install --save-exact --save-dev eslint-plugin-unused-imports
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["unused-imports"],
  "rules": {
    "unused-imports/no-unused-imports": "error"
  }
}
```

### `eslint-plugin-react`

`React` に関するルールを提供します。

```bash
npm install --save-exact --save-dev eslint-plugin-react
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["react"],
  "extends": ["plugin:react/recommended"]
}
```

### `eslint-plugin-react-hooks`

`React Hooks` のルールを強制するための `ESLint` のプラグインです。`React Hooks` は、関数コンポーネント内で `state` やその他の `React` の機能を使用するためのものですが、正しく使用しないとバグを引き起こす可能性があります。このプラグインはそのような問題を防ぎます。

```bash
npm install --save-exact --save-dev eslint-plugin-react-hooks
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "extends": ["plugin:react-hooks/recommended"]
}
```

### `@typescript-eslint/eslint-plugin`

`ESLint` と一緒に使うことで `TypeScript` コードに対するリントを提供するプラグインです。このプラグインは、`TypeScript` 特有のパターンを認識し、その結果、`JavaScript` 向けの `ESLint` だけでは検出できないエラーや問題を見つけることができます。

```bash
npm install --save-exact --save-dev @typescript-eslint/eslint-plugin
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["plugin:@typescript-eslint/recommended"]
}
```

### `@typescript-eslint/parser`

`ESLint` が `TypeScript` コードを解析できるようにするパーサーです。これにより、`TypeScript` を使用したプロジェクトで `ESLint` を使うことが可能になります。

```bash
npm install --save-exact --save-dev @typescript-eslint/parser
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、パーサーを追加します。

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

### `eslint-plugin-tailwindcss`

`Tailwind CSS` を用いたプロジェクトにおいて、不適切なクラス名の使用や不適切なクラス名の順序等を検出するための `ESLint` プラグインです。このプラグインを導入することで、開発時に様々なミスを早期に検出することが可能となります。

```bash
npm install --save-exact --save-dev eslint-plugin-tailwindcss
```

ESLint の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["tailwindcss"],
  "rules": {
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/no-contradicting-classname": "error"
  }
}
```

### `@tailwindcss/typography`

`Tailwind CSS` に `Markdown` で作成されたコンテンツや一般的なタイポグラフィパターンのスタイリングを効率的に適用するためのユーティリティを追加します。実際にビルドされた `CSS` に影響を与えるため、プロダクション環境でも必要です。そのため、`--save-devフラグ` は不要です。

```bash
npm install --save-exact @tailwindcss/typography
```

`Tailwind CSS` の設定ファイル（`tailwind.config.js`）を開き、`plugins` に `typography` プラグインを追加します。

```js
module.exports = {
  plugins: [require('@tailwindcss/typography')],
};
```

### `@tailwindcss/forms`

フォームコントロール（ボタン、チェックボックス、ラジオボタン、セレクトボックスなど）のデザインとスタイリングを手助けします。デフォルトのブラウザスタイリングは一貫性がないため、このプラグインはそれらをリセットし、自由にカスタマイズできるようにします。実際にビルドされた `CSS` に影響を与えるため、プロダクション環境でも必要です。そのため、`--save-devフラグ` は不要です。

```bash
npm install --save-exact @tailwindcss/forms
```

`Tailwind CSS` の設定ファイル（`tailwind.config.js`）を開き、`plugins` に `forms` プラグインを追加します。

```js
module.exports = {
  plugins: [require('@tailwindcss/forms')],
};
```

### `@tailwindcss/line-clamp`

テキストの行数を制限し、それ以上の行は省略記号（...）で切り捨てるスタイリングを提供します。これはブログの投稿サマリーや商品説明など、テキストの長さを制限したい場合に便利です。実際にビルドされた `CSS` に影響を与えるため、プロダクション環境でも必要です。そのため、`--save-devフラグ` は不要です。

```bash
npm install --save-exact @tailwindcss/line-clamp
```

`Tailwind CSS` の設定ファイル（`tailwind.config.js`）を開き、`plugins` に `line-clamp` プラグインを追加します。

```js
module.exports = {
  plugins: [require('@tailwindcss/line-clamp')],
};
```

### `@tailwindcss/aspect-ratio`

要素のアスペクト比（幅と高さの比率）を制御するユーティリティクラスを提供します。これは、画像やビデオなど、特定のアスペクト比を維持することが重要なコンテンツにとって有用です。実際にビルドされた `CSS` に影響を与えるため、プロダクション環境でも必要です。そのため、`--save-devフラグ` は不要です。

```bash
npm install --save-exact @tailwindcss/aspect-ratio
```

`Tailwind CSS` の設定ファイル（`tailwind.config.js`）を開き、`plugins` に `aspect-ratio` プラグインを追加します。

```js
module.exports = {
  plugins: [require('@tailwindcss/aspect-ratio')],
};
```

### `eslint-plugin-sort-keys-custom-order`

オブジェクトのキーの並び順をカスタマイズするための `ESLint` プラグインです。このプラグインを導入することで、開発時に様々なミスを早期に検出することが可能となります。

```bash
npm install --save-exact --save-dev eslint-plugin-sort-keys-custom-order
```

`ESLint` の設定ファイル（`.eslintrc.json`や`.eslintrc.js`など）を開き、プラグインを追加します。

```json
{
  "plugins": ["sort-keys-custom-order"],
  "rules": {
    // For JS objects sorting
    "sort-keys-custom-order/object-keys": [
      "error",
      { "orderedKeys": ["id", "name", "title"] }
    ],
    // For TS types sorting
    "sort-keys-custom-order/type-keys": [
      "error",
      { "orderedKeys": ["id", "name", "title"] }
    ]
  }
}
```

`.vscode/settings.json` に以下を追加します。

```json
{
  "editor.codeActionsOnSave": ["source.fixAll.eslint"]
}
```

### `@notionhq/client`

`Notion API` を使用するための `JavaScript` クライアントです。

```bash
npm install --save-exact @notionhq/client
```

### 'recoil`

`Recoil` は、`React` アプリケーションのための状態管理ライブラリです。`Recoil` は、`React` のコンポーネントツリーの中で状態を表現するための `atom` と呼ばれる単位を提供します。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。`atom` は、`React` のコンポーネントツリーの中で状態を表現するための単位です。

```bash
npm install --save-exact recoil
```

### `@emotion/react`

`Emotion` は、`CSS` を `JavaScript` で書くためのライブラリです。`Emotion` は、`CSS` を `JavaScript` で書くためのライブラリです。

```bash
npm install --save-exact @emotion/react
```

### `@emotion/styled`

`Emotion` の一部で、`CSS-in-JS` のライブラリです。

```bash
npm install --save-exact @emotion/styled
```

### `framer-motion`

`React` アプリケーションのアニメーションとインタラクションを簡単に作成できるライブラリです。これをインストールするには、以下のコマンドを実行します。

```bash
npm install --save-exact framer-motion
```

### `react-markdown`

`React` アプリケーションで `Markdown` をレンダリングするためのライブラリです。

```bash
npm install --save-exact react-markdown
```

### `gravatar`

`Globally Recognized Avatars` の略で、`WordPress` の共同創設者である `Tom Preston-Werner` によって作成された画像のプロファイルサービスです。

```bash
npm install --save-exact gravatar
```

### `@types/gravatar`

`TypeScript` で `gravatar` を使用するための型定義です。

```bash
npm install --save-exact @types/gravatar
```

### `dayjs`

`JavaScript` の日付と時刻の操作をシンプルにするためのライブラリです。

```bash
npm install --save-exact dayjs
```

### `react-icons`

`React` アプリケーションで使用できるアイコンのセットです。

```bash
npm install --save-exact react-icons
```
