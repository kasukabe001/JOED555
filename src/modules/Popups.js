export default class Popups {
  // electronとwebでの違いを吸収するダイアログのラッパー
  static alert (message) {
    window.alert(message)
  }

  static confirm (message) {
    return window.confirm(message)
  }

  static async timerwait (duration = 500) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration)
    })
  }
}
