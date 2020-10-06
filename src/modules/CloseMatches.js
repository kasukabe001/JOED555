export const name = 'CloseMatches'

const CommonTranslation = {
  '[ ,.()､、｡。・]+': ' ',
  附属器: '付属器',
  膣: '腟',
  頚: '頸',
  瘤: '脱',
  下垂: '脱',
  がん: '癌'
}

const DiagnosisTranslation = {
  '((粘液|漿液)性?腺?|腺)癌': '癌',
  '(粘液|漿液|充実|孤立|繊維)性腫瘍': '腫瘍',
  '(癌|腺|平滑筋)?肉腫': '体癌',
  '((乳|胃|大腸)癌|リンパ腫)': '上記以外の悪性腫瘍',
  '(のう|嚢)(腫|胞)': '嚢胞 腫瘍',
  '卵管(角|峡|間質|膨大)部': '卵管',
  '(IUD|避妊具|リング)': '異物',
  炎: '腹膜炎',
  閉鎖: '閉塞 癒着',
  奇形腫: '良性腫瘍',
  膿瘍: '骨盤腹膜炎',
  異形成: '子宮頸部上皮内腫瘍',
  上皮内癌: '子宮頸部上皮内腫瘍',
  // 増殖症: '子宮体部前癌病変',
  悪性リンパ腫: '上記以外の悪性腫瘍',
  奇胎: '絨毛性',
  トロホブラスト: '絨毛性',

  AEH: '子宮内膜異型増殖症',
  AIS: '子宮頸部上皮内腫瘍',
  CIN: '子宮頸部上皮内腫瘍',
  CIS: '子宮頸部上皮内腫瘍',
  DIE: '子宮内膜症',
  ESS: '子宮体癌',
  FHCS: '骨盤腹膜炎',
  LEGH: '子宮頸部腫瘍',
  LMS: '子宮体癌',
  PID: '骨盤腹膜炎',
  POP: '骨盤性器脱',
  RRSO: '予防的内性器摘出術',
  リンチ症候群: '予防的内性器摘出術',
  HNPCC: '予防的内性器摘出術',
  STD: '骨盤腹膜炎'
}

const ProcedureTranslation = {
  '(のう|嚢)(腫|胞)': '嚢胞',
  '傍?(卵巣|卵管)': '卵巣 卵管 附属器',
  'LA?M': '子宮筋腫核出術',
  癌: '癌 摘出',
  子宮内膜症: '子宮内膜症 チョコレート嚢胞',
  トラケレクトミー: '頸部摘出術',
  セカンドルック: 'SecondLookOperation',
  補助下: ' ',
  腫瘍: '腫瘍 嚢胞',
  切除: '切除 摘出',
  剔出: '摘出',
  全摘出: '全摘',
  子宮亜全摘: '子宮腟上部切断',
  核出: '摘出',

  'D&C': '剥爬術',
  アブレーション: '焼灼術',
  IUD: '異物',
  LSC: '骨盤臓器脱修復術'
}

export function getMatchesInDiagnoses (str = '', candidates = []) {
  const difflib = require('difflib')

  // 全角の半角化
  str = str.replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  // step 1 - 基本的なよくある正規化
  str = ReplaceByTable(str, CommonTranslation)

  // Step 2 - 状態を示す補足語を削除する
  str = str.replace(/([右左両片]側?性?|(亜?急|慢|([特原続]発)|難治)性|(不|完|不完)全|(破裂|捻転|再発))/g, '')

  // step 3 - 疾患名の正規化と変換
  str = ReplaceByTable(str, DiagnosisTranslation)

  // Step 4 - マッチ配列を取得する
  const array = candidates.filter(item => item.indexOf(str.trim()) >= 0)
  array.splice(0, 0,
    ...difflib.getCloseMatches(str, candidates, 12, 0.34)
  )
  return array.filter((item, index, self) => self.indexOf(item) === index)
}

export function getMatchesInProcedures (str = '', candidates = []) {
  const difflib = require('difflib')

  // 全角の半角化
  str = str.replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  // step 1 - 基本的なよくある正規化
  str = ReplaceByTable(str, CommonTranslation)

  // setp 2 - 状態補足語を削除
  str = str.replace(/([右左両片]側?性?|(不|完|不完)全|部分)/g, '')

  // step 3 - 疾患名の正規化と変換
  str = ReplaceByTable(str, ProcedureTranslation)

  // Step 4 - マッチ配列を取得する
  const array = candidates.filter(item => item.indexOf(str.trim()) >= 0)
  array.splice(0, 0,
    ...difflib.getCloseMatches(str, candidates, 12, 0.34)
  )
  return array.filter((item, index, self) => self.indexOf(item) === index)
}

function ReplaceByTable (str = '', hash = {}) {
  const re = new RegExp('(' + Object.keys(hash).join('|') + ')', 'gi')
  return str.replace(
    re,
    matched => {
      if (hash[matched]) return hash[matched]
      for (const key in hash) {
        if (matched.match(key)) return hash[key]
      }
    }
  )
}
