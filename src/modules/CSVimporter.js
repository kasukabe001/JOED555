import ProcedureTimeSelections from '@/modules/ProcedureTimes'

// eslint-disable-next-line no-unused-vars
const RecordError = new Error('レコードの様式が不適合です.')

// eslint-disable-next-line no-unused-vars
function phraseCSV (loadeddocument) {
  const rows = []

  // 改行コードを確認して切り出し
  const rs = (loadeddocument.indexOf('\r\n') < 0) ? (loadeddocument.indexOf('\r') < 0 ? '\n' : '\r') : '\r\n'
  const lines = loadeddocument.split(rs)

  for (let i = 0; i < lines.length; i++) {
    const len = lines[i].length
    const row = []
    for (let j = 0; j < len; j++) {
      let k
      // 各フィールド毎に切り出してゆく
      if (lines[i].charAt(j) === '"') {
        // ダブルクォートでのクオートあり閉じをさがす
        for (k = j + 1; k < len; k++) {
          k = ((k = lines[i].indexOf('"', k)) < 0) ? len : k
          if (lines[i].charAt(++k) !== '"') {
            // クオートのエスケープでなければ切り出しへ
            break
          }
        }
        row.push(lines[i].substring(j + 1, k - 1).replace(/""/g, '"'))
      } else {
        // クオート無し カンマを探す
        k = (k = lines[i].indexOf(',', j)) < 0 ? len : k
        row.push(lines[i].substring(j, k))
      }
      j = k
    }
    // 空白行は無視する
    if (row.length > 0) {
      rows.push(row)
    }
  }
  return (rows)
}

// eslint-disable-next-line no-unused-vars
export function phraseTitledCSV (loadeddocument) {
  const doc = phraseCSV(loadeddocument)

  const header = doc.slice(0, 1).flat()

  return doc.slice(1).map(line => {
    const record = {}
    for (const index in line) {
      record[header[index]] = line[index]
    }
    return record
  })
}

// eslint-disable-next-line no-unused-vars
export function CreateDocument (record) {
  const CaseData = { Imported: true }

  try {
    DateOfProcedure(record, CaseData)
    BasicInformation(record, CaseData)
    ProcedureTime(record, CaseData)
    DiagnosesAndProceduresPrimary(record, CaseData)
    DiagnosesAndProceduresSecondary(record, CaseData)
    AEs(record, CaseData)
  } catch (errors) {
    console.log(errors)
    return undefined
  }

  return CaseData
}

function DateOfProcedure (Record, CaseData) {
  if (Record['手術日']) {
    try {
      CaseData.DateOfProcedure = '20' +
      Record['手術日']
        .match(/^20([0-9]{2})[/-](0{0,1}[1-9]|1[0-2])[/-](0{0,1}[1-9]|[12][0-9]|3[01])$/)
        .splice(1, 3)
        .map(item => ('0' + item).substr(-2))
        .join('-')
      return
    } catch {
    }
  }
  if (Record['手術年']) {
    CaseData.DateOfProcedure = Record['手術年'] + '-01-01'
    return
  }
  throw RecordError
}

function BasicInformation (Record, CaseData) {
  // 非必須フィールドの設定
  if (Record['氏名']) { CaseData.Name = Record['氏名'] }
  if (Record['年齢']) { CaseData.Age = Record['年齢'] }
  if (Record['症例別腫瘍登録番号']) { CaseData.JSOGId = Record['症例別腫瘍登録番号'] }

  // 患者IDを設定
  if (Record.ID) {
    CaseData.InstitutionalPatientId = Record.ID
    return
  }
  if (Record['内部ID']) {
    CaseData.InstitutionalPatientId = CaseData.DateOfProcedure.substr(0, 4) + Record['内部ID'].substr(5)
    return
  }
  throw RecordError
}

function ProcedureTime (Record, CaseData) {
  // 手術時間を生成
  // インポート特典として実時間入力にも対応
  if (Record['手術時間']) {
    const timestrmatches = Record['手術時間']
      .match(/\s*(\d+)(分{0,1}(以上|(未満|まで))){0,1}/)
    if (timestrmatches) {
      const timevalue = Number(timestrmatches[1]) - (timestrmatches[4] !== undefined ? 1 : 0)
      CaseData.ProcedureTime = ProcedureTimeSelections(timevalue)
      return
    }
  }
  throw RecordError
}

function laparoProcedure (procedure = '', typedprocedure = '', typeofselection = '', lymphadnectomy, omentectomy) {
  const category = procedure.includes('ロボット') ? 'ロボット' : '腹腔鏡'

  const temporaryObject = {}
  if (procedure) {
    temporaryObject.Chain = [category + typeofselection]
  }
  if (procedure === 'その他') {
    temporaryObject.Text = typedprocedure
    temporaryObject.UserTyped = true
  } else {
    temporaryObject.Text = procedure
    if (lymphadnectomy) {
      if (!(lymphadnectomy.includes('なし') && (lymphadnectomy.includes('－') || lymphadnectomy.includes('-')))) {
        if (!procedure.includes('リンパ節')) {
          temporaryObject.Description = lymphadnectomy
        } else {
          temporaryObject.AdditionalProcedure = {
            Text: category === 'ロボット' ? 'ロボット支援下リンパ節生検・郭清' : '腹腔鏡下リンパ節生検・郭清',
            Description: lymphadnectomy
          }
        }
      }
    }
    if (omentectomy) {
      temporaryObject.Description = omentectomy
    }
  }
  return temporaryObject
}

function handleUserTyped (category, item, typeditem) {
  return item !== 'その他'
    ? {
      Chain: [category],
      Text: item
    }
    : {
      Chain: [category],
      Text: typeditem,
      UserTyped: true
    }
}

function DiagnosesAndProceduresPrimary (Record, CaseData) {
  CaseData.Diagnoses = []
  CaseData.Procedures = []

  // 主たる診断・術式を設定
  // JOEDの不明な仕様で、空の腹腔鏡術後診断にはなぜか空白がはいるためtrimする
  if (Record['腹腔鏡術後診断'].trim()) {
    const typeofselection = Record['良性悪性_病名'] === '良性' ? '' : '悪性'
    CaseData.Diagnoses.push(handleUserTyped(
      '腹腔鏡' + typeofselection,
      Record['腹腔鏡術後診断'], Record['腹腔鏡術後診断その他'])
    )

    CaseData.Procedures.push(
      laparoProcedure(
        Record['腹腔鏡施行手術'], Record['腹腔鏡施行手術その他'],
        typeofselection,
        Record['リンパ節郭清'], Record['大網生検']
      )
    )
  }
  if (Record['子宮鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped('子宮鏡', Record['子宮鏡術後診断'], Record['子宮鏡術後診断その他']))
    CaseData.Procedures.push(handleUserTyped('子宮鏡', Record['子宮鏡施行手術'], Record['子宮鏡施行手術その他']))
  }
  if (Record['卵管鏡術後診断']) {
    CaseData.Diagnoses.push(handleUserTyped('卵管鏡', Record['卵管鏡術後診断'], Record['卵管鏡術後診断その他']))
    CaseData.Procedures.push(handleUserTyped('卵管鏡', Record['卵管鏡施行手術'], Record['卵管鏡施行手術その他']))
  }

  // 主たる術式からカテゴリを設定
  try {
    CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
  } catch (e) {
    throw RecordError
  }
}

function DiagnosesAndProceduresSecondary (Record, CaseData) {
  // 併施手術を設定
  if (Record['腹腔鏡併施手術_術後診断1']) {
    const typeofselection = Record['併施手術1_良性悪性_病名'] === '良性' ? '' : '悪性'
    if (Record['腹腔鏡併施手術_術後診断1'] !== Record['腹腔鏡術後診断'] || Record['腹腔鏡併施手術_術後診断1'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        '腹腔鏡' + typeofselection,
        Record['腹腔鏡併施手術_術後診断1'], Record['腹腔鏡併施手術_術後診断1その他'])
      )
    }
  }
  if (Record['腹腔鏡併施手術_施行手術1']) {
    const typeofselection = Record['併施手術1_良性悪性_術式'] === '良性' ? '' : '悪性'
    CaseData.Procedures.push(
      laparoProcedure(
        Record['腹腔鏡併施手術_施行手術1'], Record['腹腔鏡併施手術_施行手術1その他'],
        typeofselection,
        Record['併施手術1_リンパ節郭清'], Record['併施手術1_大網生検']
      )
    )
  }
  if (Record['腹腔鏡併施手術_術後診断2']) {
    const typeofselection = Record['併施手術2_良性悪性_病名'] === '良性' ? '' : '悪性'
    if (Record['腹腔鏡併施手術_術後診断2'] !== Record['腹腔鏡術後診断'] || Record['腹腔鏡併施手術_術後診断2'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped(
        '腹腔鏡' + typeofselection,
        Record['腹腔鏡併施手術_術後診断2'], Record['腹腔鏡併施手術_術後診断2その他'])
      )
    }
  }
  if (Record['腹腔鏡併施手術_施行手術2']) {
    const typeofselection = Record['併施手術2_良性悪性_術式'] === '良性' ? '' : '悪性'
    CaseData.Procedures.push(
      laparoProcedure(
        Record['腹腔鏡併施手術_施行手術2'], Record['腹腔鏡併施手術_施行手術2その他'],
        typeofselection,
        Record['併施手術2_リンパ節郭清'], Record['併施手術2_大網生検']
      )
    )
  }
  if (Record['子宮鏡併施手術_術後診断']) {
    if (Record['子宮鏡併施手術_術後診断'] !== Record['子宮鏡術後診断'] || Record['子宮鏡併施手術_術後診断'] === 'その他') {
      CaseData.Diagnoses.push(handleUserTyped('子宮鏡', Record['子宮鏡併施手術_術後診断'], Record['子宮鏡併施手術_術後診断その他']))
    }
    CaseData.Procedures.push(handleUserTyped('子宮鏡', Record['子宮鏡併施手術_施行手術'], Record['子宮鏡併施手術_施行手術その他']))
  }
}

function AEs (Record, CaseData) {
  if (Record['合併症有無'] !== undefined) {
    CaseData.PresentAE = Record['合併症有無'] !== 'なし'
  } else {
    throw RecordError
  }
}
