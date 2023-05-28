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
