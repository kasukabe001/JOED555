// 保存先は最終的にはデータベースではなく electron.config に逃げる予定

export default {
  namespaced: true,
  state: {
    InstitutionName: '',
    InstitutionID: '',
    JSOGoncologyboardID: '',
    ShowWelcomeMessage: true,
    EnabledJSOGId: true,
    EnabledNCDId: true
  },
  getters: {
    GetInstitutionInformation (state) {
      return {
        InstitutionName: state.InstitutionName,
        InstitutionID: state.InstitutionID,
        JSOGoncologyboardID: state.JSOGoncologyboardID
      }
    },
    InstitutionName (state) {
      return state.InstitutionName
    },
    InstitutionID (state) {
      return state.InstitutionID
    },
    JSOGInstitutionID (state) {
      return state.JSOGoncologyboardID
    },
    EditJSOGId (state) {
      return state.EnabledJSOGId
    },
    EditNCDId (state) {
      return state.EnabledNCDId
    },
    ShowWelcomeMessage (state) {
      return state.ShowWelcomeMessage
    }
  },
  mutations: {
    SetPreferences (state, payloads) {
      for (const key of Object.keys(payloads)) {
        if (state[key] !== undefined) {
          state[key] = payloads[key]
        }
      }
    }
  },
  actions: {
    LoadPreferences (context) {
      return new Promise((resolve, reject) => {
        context.rootState.DatabaseInstance.findOne(
          { Settings: { $exists: true } }
        )
          .exec(
            (errstring, document) => {
              if (errstring) reject(errstring)

              if (document !== null) {
                context.commit('SetPreferences', document.Settings)
              }
              resolve()
            }
          )
      })
    },
    SavePreferences (context) {
      const temporaryState = {}
      for (const key of Object.keys(context.state)) {
        temporaryState[key] = context.state[key]
      }

      return new Promise((resolve, reject) => {
        context.rootState.DatabaseInstance.update(
          { Settings: { $exists: true } },
          { Settings: temporaryState },
          { upsert: true },
          (errorstring) => {
            if (errorstring) {
              reject(errorstring)
            }
            resolve()
          }
        )
      })
    },
    SetShowWelcomeMessage (context, value) {
      context.commit('SetPreferences', { ShowWelcomeMessage: value })
    }
  }
}
