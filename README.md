# 合併症アンケートシステム JOED version.5

日本産科婦人科内視鏡学会の合併症アンケートシステムの最新版開発環境です。

## 構成

- vue cli + vuex + router
- nedb

追加パッケージ

- vuedraggable
- cross-plathome-YuGothic

### 試験環境

マイルストーンごとに公開予定：

https://p4testsuite.hostingerapp.com/JOEDv5/

- 2020-04-20 とりあえず,症例リストを作れるようになりましたので公開.
- 2020-05-07 保存データベースの構造を変更したため後方互換が無くなりました,基本的な登録機能は実装できました.(Database-Managerを用意しましたのでデータベースのリセットにご利用ください)
- 2020-05-13 AE入力のチェックに問題があったので修正,各セクション毎に入力時のエラーチェック実装を開始しました.
- 2020-05-14 項目の重複入力チェックを円滑にするためデータベース構成を変更.エラーチェックとして重複チェックを実装.
- 2020-05-18 合併症入力の項目を修正(術中操作による合併症が表示されるように、子宮腟部吻合部漏出→腟断端離開).
- 2020-05-19 【仕様修正】提出データの構成を修正.
- 2020-05-21 データチェックのバグ修正,パスワード認証を実装（でも、パスワード設定できないのでまだ動かない）.
- 2020-05-24 編集からの移動を実装
- 2020-06-10 編集での移動ボタンを移動,連続新規登録可能,リストのソート・フィルタの設定（一部）,elementのUIを一部に適応,環境依存だったDatePickerをVue Datepickerに変更.
- 2020-06-16 SPA版のRCに向けて大幅にUI適応を拡大, コンポーネントのメインテナンス.ハードコードのモジュール化.診断・術式検索機能の強化と手入力抑制のための警告.
- 2020-06-18 機能未実装部分も含めてフロントエンドのパーツを実装.AEのセクション表示の問題を修正(Titleがないケースに対応,重複チェックのやりかたを変更).
- 2020-06-21 パスワードが機能するようになりました. 裏でいろいろ最終的な各種機能実装が進んでいます.

現時点で作成中のweb版ではデータはブラウザのストレージに保存されます.データベースの削除・修正などは https://p4testsuite.hostingerapp.com/JOEDv5/Database_Manager/ のユーティリティを使用してください.

# 仕様

### 提出データ
JSONでエクスポートされる.

```
[
    { 提出データヘッダ },
    { 症例データ1 },
    { 症例データ2 },
    ...
    { 症例データn }
]
```
Validationは診断・実施術式・合併症のマスタを参照するので結構コストが掛かるため、そこは提出を受け付けてから行う.大まかな整合性チェックはすべて症例入力の際に行われている.
(データインポートのため整合性チェックのルーチンは必要だが、それは別アプリケーションでもよいかもしれない)

### オブジェクト:提出データヘッダ
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:------------:|:----:|:------------:|:--|
|InstitutionName            |string | |X|X|施設名テーブルから引用される|
|InstitutionID              |string | [0-9]{5} |X|X|施設名テーブルから引用される、未登録施設は学会に申請して番号交付を受ける|
|ApplicationVersion         |string | |X|X|提出データ作成時のソフトウエアのバージョン|
|CreateDate                 |string | |X|X|提出データ作成日時|
|Year                       |string |20(19\|[23][0-9]) |X|X|提出データの年次|
|NumberOfCases              |integer| |X|X|Casesの数（サードパーティーからの書き出しに対するエラーチェック用）|

### 症例データベースオブジェクト:Case
|名称                        | タイプ |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|_id                        |integer| | | |データベースエンジンが付与する内部管理id|
|SequentialId               |integer| |X| |連続番号|
|UniqueID                   |string |{{InstitutionID}}-{{Year}}-{{SequentialID}}|X|X|登録にあたっての症例番号<br/>（ユーザからは見えないが修正登録の際に問い合わせ番号として使用できるようにする）|
|Name                       |string | | | |患者名|
|Age                        |integer| |X|X|年齢|
|InstitutionalPatientId     |string | |X| |施設での患者ID|
|JSOGId                     |string | | |X|日産婦腫瘍登録番号|
|NCDId                      |string | | |X|NCDのロボット登録患者番号（将来的にこちらからのデータ流し込みにNCDが対応したときに備える）|
|DateOfProcedure            |string |20(19\|[23][0-9])-(0[1-9]\|1[012])-([0-2][0-9]\|3[01])|X|x|手術日<br/>InstitutionalPatientIDとDateOfProcedureでユニークが望ましいが確認のみとする|
|ProcedureTime              |string | |X|X|手術時間表記テーブルから引用される|
|TypeOfProcedure            |string |(腹腔鏡\|腹腔鏡悪性\|ロボット支援下\|ロボット支援下悪性\|子宮鏡\|卵管鏡)|X|X|主たる術式の種別、Procedures配列の最上位の順位のものが採用される|
|PresentAE                  |boolean| |X|X|合併症の登録があればtrue =(AE.length>0)|
|Diagnoses                  |array  | |X|X|診断オブジェクト - Diagnosis|
|Procedures                 |array  | |X|X|術式オブジェクト - Procedure|
|AEs                        |array  | | |X|合併症オブジェクト - AE|
|isError                    |string | | | |データチェックによるエラーの有無(インポートされたデータ用)|
|Notification               |string | | | |データチェックによる確認内容（エラーを含む）の内容(インポートされたデータ用)|

### オブジェクト:Diagnosis
提出データでは、Textにflattenされる.
インポートの際にはDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|診断名マスタから引用|
|Chain                      |array  | | | |選択ツリー[Category, Target]|

### オブジェクト:Procedure
提出データでは、TextとDescriptionだけのhashにflattenされる.
インポートの際にDiagnosisItemsから検索して適当なChainを割り付ける.
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|術式名、術式マスタから引用
|Chain                      |array  | | | |選択ツリー[Category, Target]
|Description                |array  | | |x|付随情報
|AdditionalProcedure        |object | | |x|併施術式 { Text: ..., Description: ...}
|Ditto                      |array  | | | |重複確認の対象となる術式名

### オブジェクト:AE
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Category                   |string | |X|X|合併症の発生カテゴリ
|Title                      |string | |X|X|合併症の名称
|Cause                      |string | | |X|合併症の原因
|Location                   |string | | |X|合併症の発生部位
|BloodCount                 |integer| | |X|出血の場合の出血量
|Grade                      |string |([1245]\|3[ab])|X|X|合併症のグレード
|Course                     |array  | |X|X|合併症の転帰

### マスタオブジェクト:InstituteList
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Name                       |string |施設名
|Id                         |string |施設の登録番号<br/>数字５桁、未登録施設は99999？
|Prefecture                 |string |県名

### マスタ:DiagnosisMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Diagnosis                  |string |診断名|
|ICD10                      |string |ICD-10コード(未実装)
|Category                   |array  |関連手技 ["腹腔鏡","ロボット支援下","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","卵巣","卵管","その他"]|
|Notification               |string |入力時に表示されるおしらせ|
|Procedure                  |string |1:1で紐付けられた術式|
|StartOfYearOfDataset       |integer|適用可能年開始|
|EndOfYearOfDataset         |integer|適用可能年終了<br/>これより後の年次ではこの病名は無効かつ登録出来ない|

### オブジェクト:DiagnosisItems
DiagnosisMasterから作成される
```javascript
{
    'Category': {
        'Target': {
            'Diagnosis'
        }
    }
}
```

### マスタ:ProcedureMaster
|名称                        |タイプ  |解説
|:--------------------------|:-----:|:--|
|Procedure                  |string |手技名|
|STEM7                      |string |STEM7コード(未実装)|
|Category                   |array  |良悪性分類 ["腹腔鏡","腹腔鏡悪性","ロボット","ロボット悪性","子宮鏡","卵管鏡"]|
|Target                     |array  |部位 ["子宮","卵巣","卵管","その他"]|
|StartOfYearOfDataset       |string |適用可能年開始|
|EndOfYearOfDataset         |string |適用可能年終了<br/>これより後の年次ではこの術式はこの区分は無効かつ登録出来ない|
|Ditto                      |array  |同時に入力できない同一手技に相当する手技名|
|AdditionalProcedure        |string |同時に展開を行う関連術式<br/>基本的には同一の選択チェーン内にある|
|DescriptionTitle           |string |補助情報の見出し|
|Descriptions               |array  |補助情報の候補<br/>$Multiをメンバにもつ場合複数の内容を保持できる|

### オブジェクト:DiagnosisItems
ProcedureMasterから作成される
```javascript
{
    'Category': {
        'Target': {
            'Procedure', // なにも付随情報が無い場合
            {
                {
                    Text: 'Procedure',
                    Ditto: [...],
                    AdditionalProcedure: 'AdditionalProcedure',
                    Description: {
                        Text: 'Titie',
                        Values: [...selections]
                        // selectionsに$Multiを含む場合は複数選択可能
                        // $で終了する項目を選択した場合はこのエントリ自体が生成されない(=単独作成不可)
                    }
                }
            }
        }
    }
}
```
