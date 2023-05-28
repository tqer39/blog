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
