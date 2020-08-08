import { ProcedureTimeSelections } from '@/modules/ProcedureTimes'

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
function phraseTitledCSV (loadeddocument) {
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
async function CreateDocument (record) {
  const CaseData = {}

  return new Promise((resolve, reject) => {
    // 手術日を生成
    if (record['手術日']) {
      CaseData.DateOfProcedure = record['手術日'].replace(/\//g, '-')
      return resolve()
    }
    if (record['手術年']) {
      CaseData.DateOfProcedure = record['手術年'] + '-01-01'
      return resolve()
    }
    reject(new Error('Step1'))// RecordError)
  })
    .then(_ => new Promise((resolve, reject) => {
      // 非必須フィールドの設定
      if (record['氏名']) { CaseData.Name = record['氏名'] }
      if (record['年齢']) { CaseData.Age = record['年齢'] }
      if (record['症例別腫瘍登録番号']) { CaseData.JSOGId = record['症例別腫瘍登録番号'] }

      // 患者IDを設定
      if (record.ID) {
        CaseData.InstitutionalPatientId = record.ID
        return resolve()
      }
      if (record['内部ID']) {
        CaseData.InstitutionalPatientId = CaseData.DateOfProcedure.substr(0, 4) + record['内部ID'].substr(5)
        return resolve()
      }
      reject(new Error('Step2'))// RecordError)
    }))
    .then(_ => new Promise((resolve, reject) => {
      // 手術時間を生成
      // インポート特典として実時間入力にも対応
      if (record['手術時間']) {
        const proceduretime = Number(record['手術時間']) ||
          Number(record['手術時間'].replace(/.*([1-9]\d+)((分|')(まで|未満))$/, '$1')) - 1 ||
          Number(record['手術時間'].replace(/([1-9]\d+)((分|'){0,1}(以上)).*/, '$1'))
        if (proceduretime) {
          CaseData.ProcedureTime = ProcedureTimeSelections(proceduretime)
          resolve()
        }
      }
      reject(new Error('Step3'))// RecordError)
    }))
    .then(_ => new Promise((resolve, reject) => {
      // 診断・術式を設定
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

      CaseData.Diagnoses = []
      CaseData.Procedures = []

      // 主たる診断・術式を設定
      if (record['腹腔鏡術後診断']) {
        const typeofselection = record['良性悪性_病名'] === '良性' ? '' : '悪性'
        CaseData.Diagnoses.push(handleUserTyped(
          '腹腔鏡' + typeofselection,
          record['腹腔鏡術後診断'], record['腹腔鏡術後診断その他'])
        )

        CaseData.Procedres.push(
          laparoProcedure(
            record['腹腔鏡施行手術'], record['腹腔鏡施行手術その他'],
            typeofselection,
            record['リンパ節郭清'], record['大網生検']
          )
        )
      }
      if (record['子宮鏡術後診断']) {
        CaseData.Diagnoses.push(handleUserTyped('子宮鏡', record['子宮鏡術後診断'], record['子宮鏡術後診断その他']))
        CaseData.Procedures.push(handleUserTyped('子宮鏡', record['子宮鏡施行手術'], record['子宮鏡施行手術その他']))
      }
      if (record['卵管鏡術後診断']) {
        CaseData.Diagnoses.push(handleUserTyped('卵管鏡', '卵管鏡術後診断', record['卵管鏡術後診断その他']))
        CaseData.Procedures.push(handleUserTyped('卵管鏡', record['卵管鏡施行手術'], record['卵管鏡施行手術その他']))
      }
      // 主たる術式からカテゴリを設定
      try {
        CaseData.TypeOfProcedure = CaseData.Procedures[0].Chain[0]
      } catch (e) {
        return reject(new Error('Step5'))// RecordError)
      }

      // 併施手術を設定
      if (record['腹腔鏡併施手術_術後診断1']) {
        const typeofselection = record['併施手術1_良性悪性_病名'] === '良性' ? '' : '悪性'
        if (record['腹腔鏡併施手術_術後診断1'] !== record['腹腔鏡術後診断'] || record['腹腔鏡併施手術_術後診断1'] === 'その他') {
          CaseData.Diagnoses.push(handleUserTyped(
            '腹腔鏡' + typeofselection,
            record['腹腔鏡併施手術_術後診断1'], record['腹腔鏡併施手術_術後診断1その他'])
          )
        }
        CaseData.Procedres.push(
          laparoProcedure(
            record['腹腔鏡併施手術_施行手術1'], record['腹腔鏡併施手術_施行手術1その他'],
            typeofselection,
            record['併施手術1_リンパ節郭清'], record['併施手術1_大網生検']
          )
        )
      }
      if (record['腹腔鏡併施手術_術後診断2']) {
        const typeofselection = record['併施手術2_良性悪性_病名'] === '良性' ? '' : '悪性'
        if (record['腹腔鏡併施手術_術後診断2'] !== record['腹腔鏡術後診断'] || record['腹腔鏡併施手術_術後診断2'] === 'その他') {
          CaseData.Diagnoses.push(handleUserTyped(
            '腹腔鏡' + typeofselection,
            record['腹腔鏡併施手術_術後診断2'], record['腹腔鏡併施手術_術後診断2その他'])
          )
        }
        CaseData.Procedres.push(
          laparoProcedure(
            record['腹腔鏡併施手術_施行手術22'], record['腹腔鏡併施手術_施行手術2その他'],
            typeofselection,
            record['併施手術2_リンパ節郭清'], record['併施手術2_大網生検']
          )
        )
      }
      if (record['子宮鏡併施手術_術後診断']) {
        if (record['子宮鏡併施手術_術後診断'] !== record['子宮鏡術後診断'] || record['子宮鏡併施手術_術後診断'] === 'その他') {
          CaseData.Diagnoses.push(handleUserTyped('子宮鏡', record['子宮鏡併施手術_術後診断'], record['子宮鏡併施手術_術後診断その他']))
        }
        CaseData.Procedures.push(handleUserTyped('子宮鏡', record['子宮鏡併施手術_施行手術'], record['子宮鏡併施手術_施行手術その他']))
      }

      resolve()
    }))
    .then(_ => new Promise((resolve, reject) => {
      // 合併症はかなり変更が大きくインポートできないので有無のみ
      if (record['合併症有無'] !== undefined) {
        CaseData.PresentAE = record['合併症有無'] !== 'なし'
        resolve()
      } else {
        reject(new Error('Step6'))// RecordError)
      }
    }))
    .then(_ => new Promise(resolve => {
      resolve(CaseData)
    }))
}
