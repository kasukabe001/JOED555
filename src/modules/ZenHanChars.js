export const name = 'ZenHanChars'

function UnicodeToASCII (c) {
  return String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
}

export function ZenToHan (str = '') {
  let stringargument = str.toString()

  stringargument = stringargument
    .replace(/[ーｰ～]/g, '-')
    .replace(/[！-～]/g, c => UnicodeToASCII(c)) // String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  return stringargument
}

export function ZenToHanNumbers (str = '') {
  let stringargument = str.toString()

  stringargument = stringargument
    .replace(/[^0-9０-９]/g, '')
    .replace(/[０-９]/g, c => UnicodeToASCII(c)) // String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

  return stringargument
}

export function FormatDate (givenDateStr = '') {
  const returnDateStr = givenDateStr.replace(/\s/g, '')
    .replace(/^(20[0-9][0-9])[/-](0[1-9]|1[0-2])[/-](0[1-9]|[12][0-9]|3[0-1])$/, '$1-$2-$3')

  return returnDateStr
}
