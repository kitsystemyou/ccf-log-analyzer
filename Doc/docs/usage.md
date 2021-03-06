ご意見・ご要望ありましたら[こちら](https://forms.gle/UecN4MjSpGdssVGEA) か [@log_analyzer_cf](https://twitter.com/log_analyzer_cf) までお願いいたします。

# ココフォリア **Log Analyzer** の使い方
## ツール概要
ココフォリアのログを解析し、セッション中に振られた 1d100 の出目のヒストグラム(頻度表)を出力します。  

## 準備するもの
- ログを解析したい卓(ココフォリアの部屋)のログ  
[取得方法参考](https://seesaawiki.jp/ccfoliamemo/d/%A5%C1%A5%E3%A5%C3%A5%C8%A5%E1%A5%CB%A5%E5%A1%BC#content_3)


## 使い方
- ログ(xxx.html)をブラウザで開いてください
- 表示されるログを丸ごとコピー(Ctrl+A, Ctrl+C)して Log Analyzer のテキストフィールドに貼り付けてください
- 解析ボタンを押します
- 下方にグラフが表示されます

### 生成されるグラフについて
- PNG 画像が生成されます
- 横軸はダイスの出目で縦軸は出た回数です  
- 出目が偏るほどそれぞれの棒グラフの高低差が大きくなります

### 解析対応しているログ(フォーマット)
基本的にいあきゃらや Charaeno でチャパレ作成した場合のログを想定しています。
また、要望がありましたのでココフォリア開発段階のログにも対応しています。

#### 対応している形式のサンプル
- [メイン] 山田太郎 : CCB<=75 【アイデア】 (1D100<=75) ＞ 46 ＞ 成功
- [メイン] 鈴木一郎 : ccb<=75 【アイデア】 (1D100<=75) ＞ 80 ＞ 失敗

などなど
※空行は削除しなくても大丈夫です

#### クリティカル・ファンブル率について
「決定的成功」、「致命的失敗」とあるログからクリティカル・ファンブル率を計算しています。
※ココフォリア開発段階のログ・ユーザーごとのグラフについてはまだ対応できておりません。

---
## 未対応コマンド(フォーマット)
- 繰り返しコマンド(x3など)
- CBRB コマンド
- CCB などが含まれているが、コマンド結果などにスペースが含まれていないもの

## その他役に立ちそうなもの
[PNG to JPEG](https://png2jpg.com/ja/)  
~~現状の画像が背景透過PNGなのでそのまま Discord などに貼ると目盛りなどが見えないです。JPEG に変換すると解決します。~~  
~~(そもそも白背景で画像が生成されるようにがんばります ... 🙇)~~ → 白背景で画像生成されるようになりました！！
