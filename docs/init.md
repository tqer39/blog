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

## plugin

### `eslint-plugin-prettier`

`ESLint` と `Prettier` を共存させるには、以下の手順を実行します。

```bash
npm install --save-dev eslint-plugin-prettier
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
npm install --save-dev eslint-config-prettier
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
npm install --save-dev eslint-plugin-simple-import-sort
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
npm install --save-dev eslint-plugin-import
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
npm install --save-dev eslint-plugin-unused-imports
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
npm install --save-dev eslint-plugin-react
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
npm install --save-dev eslint-plugin-react-hooks
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
npm install --save-dev @typescript-eslint/eslint-plugin
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
npm install --save-dev @typescript-eslint/parser
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
npm install --save-dev eslint-plugin-tailwindcss
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

`Tailwind CSS` で提供されている `typography` プラグインを導入するためのパッケージです。このパッケージを導入することで、`Tailwind CSS` で提供されている `typography` プラグインを使用することが可能となります。実際にビルドされた `CSS` に影響を与えるため、プロダクション環境でも必要です。そのため、`--save-devフラグ` は不要です。

```bash
npm install @tailwindcss/typography
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
npm install @tailwindcss/forms
```

`Tailwind CSS` の設定ファイル（`tailwind.config.js`）を開き、`plugins` に `forms` プラグインを追加します。

```js
module.exports = {
  plugins: [require('@tailwindcss/forms')],
};
```
