// eslint-disable-next-line no-unused-vars
import SelectionTree from '@/modules/SelectionTree'

export default class ProcedureTree extends SelectionTree {
  constructor () {
    super({
      腹腔鏡: {
        子宮: [
          '子宮内膜症病巣除去術',
          '子宮付属器癒着剥離術',
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020'
          },
          {
            Text: '腟式子宮全摘出術(LAVH)',
            Ditto: ['子宮腟上部切断術(腹腔鏡下)', '腹腔鏡下単純子宮全摘出術']
          },
          '子宮腟上部切断術(腹腔鏡下)',
          {
            Text: '子宮全摘出術(TLH、LH)',
            Ditto: ['腟式子宮全摘出術(LAVH)', '腹腔鏡下単純子宮全摘出術']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡補助下)']
          },
          {
            Text: '子宮筋腫核出術(腹腔鏡補助下)',
            Ditto: ['子宮筋腫核出術(腹腔鏡下)']
          },
          '子宮腺筋症病巣除去術(腹腔鏡下)',
          '腹腔内観察',
          '骨盤臓器脱修復術',
          '仙骨腟固定術',
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            },
            VaildFrom: '2020'
          },
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          }
        ],
        付属器: [
          '子宮内膜症病巣除去術',
          // 2020 表記変更 子宮付属器嚢胞摘出術(チョコレート嚢胞) -> 子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)
          {
            Text: '子宮付属器嚢胞摘出術(チョコレート嚢胞)',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器嚢胞摘出術(子宮内膜症性嚢胞)',
            VaildFrom: '2020'
          },
          '子宮付属器嚢胞摘出術(その他)',
          // 2020 表記変更 子宮付属器切除術(チョコレート嚢胞) -> 子宮付属器切除術(子宮内膜症性嚢胞)
          {
            Text: '子宮付属器切除術(チョコレート嚢胞)',
            VaildTo: '2019'
          },
          {
            Text: '子宮付属器切除術(子宮内膜症性嚢胞)',
            VaildFrom: '2020'
          },
          '子宮付属器切除術(その他)',
          '子宮付属器癒着剥離術',
          '卵巣多孔術(開孔術)',
          '卵管結紮術',
          '卵管形成術',
          // 2020 表記変更 異所性(子宮外)妊娠手術(卵管摘出術) -> 異所性妊娠手術(卵管摘出術)
          {
            Text: '異所性(子宮外)妊娠手術(卵管摘出術)',
            Ditto: ['異所性(子宮外)妊娠手術(卵管線状切開術)'],
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管摘出術)',
            Ditto: ['異所性妊娠手術(卵管線状切開術)', '異所性妊娠手術(その他)'],
            VaildFrom: '2020'
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(卵管摘出術) -> 異所性妊娠手術(卵管摘出術)
          {
            Text: '異所性(子宮外)妊娠手術(卵管線状切開術)',
            Ditto: ['異所性(子宮外)妊娠手術(卵管摘出術)'],
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(卵管線状切開術)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(その他)'],
            VaildFrom: '2020'
          },
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020'
          },
          '卵管切除術',
          '腹腔内観察',
          '上記以外の付属器手術',
          'チョコレート嚢胞エタノール固定術',
          // 2020 新規
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            },
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            },
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            VaildFrom: '2020'
          },
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '他の診療科との合同手術',
            VaildFrom: '2020'
          }
        ],
        その他: [
          '子宮内膜症病巣除去術',
          '子宮付属器癒着剥離術',
          // 2020 表記変更 異所性(子宮外)妊娠手術(その他) -> 異所性妊娠手術(その他)
          {
            Text: '異所性(子宮外)妊娠手術(その他)',
            VaildTo: '2019'
          },
          {
            Text: '異所性妊娠手術(その他)',
            Ditto: ['異所性妊娠手術(卵管摘出術)', '異所性妊娠手術(卵管線状切開術)'],
            VaildFrom: '2020'
          },
          '造腟術',
          '腹腔内観察',
          '骨盤臓器脱修復術',
          '仙骨腟固定術',
          '術後合併症の修復術'
        ]
      },
      腹腔鏡悪性: {
        子宮: [
          {
            Text: '腹腔鏡下単純子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清',
            Ditto: ['腟式子宮全摘出術(LAVH)', '子宮全摘出術(TLH、LH)']
          },
          {
            Text: '腹腔鏡下準広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清'
          },
          {
            Text: '腹腔鏡下広汎子宮全摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清'
          },
          {
            Text: '腹腔鏡下子宮頸部摘出術',
            AdditionalProcedure: '腹腔鏡下リンパ節生検・郭清'
          },
          {
            Text: '腹腔鏡下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            }
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          'SecondLookOperation',
          '術後合併症の修復術',
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            }
          },
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患による子宮全摘出術',
            VaildFrom: '2020'
          }
        ],
        付属器: [
          '腹腔鏡下病変生検・審査腹腔鏡',
          {
            Text: '腹腔鏡下付属器摘出術',
            Description: {
              Text: '大網切除・生検',
              Values: ['あり', 'なし']
            }
          },
          {
            Text: '腹腔鏡下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            }
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          'SecondLookOperation',
          '術後合併症の修復術',
          {
            Text: '他の悪性疾患の予防的切除術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            }
          },
          // 2020 新規
          {
            Text: 'リスク低減のための内性器摘出術',
            Description: {
              Text: '実施内容',
              Values: ['予防的卵管摘出術', '予防的卵巣摘出術', '予防的子宮全摘出術', '$Multi']
            },
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '妊孕性温存のための付属器摘出術',
            VaildFrom: '2020'
          },
          // 2020 新規
          {
            Text: '転移性卵巣癌による付属器摘出術',
            Description: {
              Text: '大網切除・生検',
              Values: ['あり', 'なし']
            }
          }
        ],
        その他: [
          '腹腔鏡下病変生検・審査腹腔鏡',
          '治療のために開腹手術へ移行(合併症を除く)',
          'SecondLookOperation',
          '術後合併症の修復術'
        ]
      },
      ロボット: {
        子宮: [
          '子宮全摘出術(ロボット支援下)',
          '骨盤臓器脱修復術(ロボット支援下)',
          'ロボット支援下その他'
        ],
        付属器: [
          'ロボット支援下その他'
        ],
        その他: [
          '骨盤臓器脱修復術(ロボット支援下)',
          '仙骨腟固定術(ロボット支援下)',
          'ロボット支援下その他'
        ]
      },
      ロボット悪性: {
        子宮: [
          {
            Text: 'ロボット支援下単純子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清'
          },
          {
            Text: 'ロボット支援下準広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清'
          },
          {
            Text: 'ロボット支援下広汎子宮全摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清'
          },
          {
            Text: 'ロボット支援下子宮頸部摘出術',
            AdditionalProcedure: 'ロボット支援下リンパ節生検・郭清'
          },
          {
            Text: 'ロボット支援下リンパ節生検・郭清',
            Description: {
              Text: 'リンパ節郭清の範囲',
              Values: ['なし(センチネル生検なし)$', 'なし(センチネル生検あり)', 'PLN', 'PLN+PAN', 'PAN']
            }
          },
          '治療のために開腹手術へ移行(合併症を除く)',
          'SecondLookOperation',
          '術後合併症の修復術',
          // 2020 新規
          {
            Text: '婦人科以外の悪性疾患によるロボット支援下子宮全摘出術',
            VaildFrom: '2020'
          }
        ]
      },
      子宮鏡: {
        子宮: [
          '子宮筋腫摘出術',
          '子宮内膜ポリープ摘出術',
          '子宮内腔癒着剥離術',
          '子宮鏡下子宮中隔切除術',
          '子宮形成術',
          '子宮内膜焼灼術',
          '胎盤ポリープ・胎盤違残摘出術',
          {
            Text: '帝王切開瘢痕症候群創部切除術',
            VaildFrom: '2020'
          },
          '子宮鏡検査・内膜剥爬術',
          '異物除去術',
          '子宮頸管ポリープ切除術',
          '上記以外の子宮体部腫瘍切除術'
        ]
      },
      卵管鏡: {
        卵管: [
          {
            Text: '卵管鏡下卵管形成術(単独)',
            VaildTo: '2019'
          },
          {
            Text: '卵管鏡下卵管形成術(腹腔鏡併用)',
            VaildTo: '2019'
          },
          {
            Text: '卵管鏡下卵管形成術',
            Description: {
              Text: '実施形態',
              Values: ['卵管鏡単独', '腹腔鏡併用']
            },
            VaildFrom: '2020'
          }
        ]
      }
    },
    // デフォルト参照されるマスター年次設定
    '2020')
  }

  // ProcedureTreeのstaticメソッド
  // itemは術式への参照
  // - handleTreeItemはSelectionTreeからの継承

  static getTitle (item) {
    return this.handleTreeItem(item)
  }

  static getAdditioninalProcedure (item) {
    return this.handleTreeItem(item, 'AdditionalProcedure')
  }

  static getDittos (item) {
    return this.handleTreeItem(item, 'Ditto')
  }

  static getDescriptionObject (item) {
    return this.handleTreeItem(item, 'Description')
  }

  static getDescriptionTitle (item) {
    return (this.getDescriptionObject(item))
      ? this.getDescriptionObject(item).Text
      : undefined
  }

  static getDescriptionValue (item) {
    return (this.getDescriptionObject(item))
      ? this.getDescriptionObject(item).Values.filter(value => value !== '$Multi')
      : []
  }

  static isDescriptionMultiple (item) {
    return this.getDescriptionObject(item).Values.findIndex(value => value === '$Multi') >= 0
  }
}
