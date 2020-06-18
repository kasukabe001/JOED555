/* global DatabaseInstance */

// 保存先は最終的にはデータベースではなく electron.config に逃げる予定

export default {
  namespaced: true,
  state: {
    InstitutionName: '',
    InstitutionId: '',
    EnabledJSOGId: true,
    EnabledNCDId: true
  },
  getters: {
    GetInstitution (state) {
      return {
        Name: state.InstitutionName,
        Id: state.InstitutionId
      }
    }
  },
  mutations: {
    SetSystemSettings (state, payload) {
      for (const prop in Object.keys(state)) {
        if (payload[prop]) {
          state[prop] = payload[prop]
        }
      }
    }
  },
  actions: {
    GetSettings (context) {
      DatabaseInstance.findOne(
        { Settings: { $exists: true } }
      )
        .exec(
          (errstring, documents) => {
            if (documents.length > 0) {
              context.commit('SetSystemSettings', documents[0].Settings)
            }
          }
        )
    },
    SetSettings (context, payload) {
      if (Object.keys(payload).length > 0) {
        DatabaseInstance.update(
          { Settings: { $exist: true } },
          { Settings: payload },
          { upsert: true },
          (errorstring) => {
            if (errorstring) {
              console.log('error on update setting', errorstring)
            } else {
              context.commit('ReloadSettings')
            }
          }
        )
      }
    }
  }
}
