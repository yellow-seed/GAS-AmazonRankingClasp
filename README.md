# 使い方

1.  webアプリとして一度デプロイする
1. デプロイ後にcallRankingForKindle.tsに発行されたURLをセットする
1. URLを更新した状態でトリガーを設定

この手順を踏むことでBot判定に引っかからない形で一つのGASで完結した自動アクセスの仕組みを実現できる


# 実装時メモ
## 初回のみ実施

なぜかpackage.jsonなどに含まれず手動で入れた
```
sudo npm install @google/clasp -g
```

出力されたURLにアクセスして認証
```
clasp login
```


初回のclaspの構築
```
clasp create --type standalone
```

## 環境作成メモ
Typescript,ESLint,prettierを導入
```
npm add typescript
```

```
npm install --save-dev eslint
npx eslint --init
```

```
npm install --save-dev prettier eslint-config-prettier
```


tsからjsに
```
npx tsc
```

lintを実行
```
npm run lintfix
```