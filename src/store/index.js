import Vue from 'vue'
import Vuex from 'vuex'
import system from '@/store/modules/system'
import password from '@/store/modules/passwordauth'

Vue.use(Vuex)

const Database = require('nedb')

const store = new Vuex.Store({
  modules: {
    system, password
  },
  state: {
    ApplicationVersion: '5.00.0517.beta',
    DatabaseInstance: undefined,
    // 表示されるデータ
    DataStore: [],
    CurrentIndex: -1, // pageficationではないが表示されているデータのインデックス
    Filters: {
      SequentialId: { $gt: 0 }
    }, // フィルターの設定
    SortOrders: {
      SequentialId: 1
    } // ソートの設定
  },
  getters: {
    ApplicationVersion (state) {
      return state.ApplicationVersion
    },
    // 現在の DataStore 中の SequentialId を配列で返す.
    //
    GetUids (state) {
      return state.DataStore.map(
        item => item.SequentialId
      )
    },
    // 指定された SequentialId の {Array} [前の SequqntialId, 後の SequqntialId] を返す.
    // 存在しないものは 0.
    //
    GetNextUids (state, getters) {
      return function (currentUid) {
        if (currentUid === 0) {
          return [0, 0]
        } else {
          const index = getters.GetUids.findIndex(item => item === currentUid)
          const prevUid = index === 0 ? 0 : getters.GetUids[index - 1]
          const nextUid = index === getters.GetUids.length - 1 ? 0 : getters.GetUids[index + 1]
          return [prevUid, nextUid]
        }
      }
    },
    // SequentialId をもつドキュメントを取得する
    //
    // @param {Number}
    GetItemObject (state) {
      return function (SequentialId) {
        const FilterdItems = state.DataStore.filter((item) => {
          return item.SequentialId === SequentialId
        })
        return FilterdItems[0]
      }
    }
  },

  mutations: {
    // DatabaseInstanceを設定する.
    // App.vue の onCreated からのみ呼ばれる.
    //
    onCreated (state, payload) {
      // electronに実装する際にはユーザデータフォルダに置くようにする
      // 当面はブラウザのローカルストレージを使用する.
      const filename = 'joed.nedb'

      state.DatabaseInstance = new Database({
        filename: filename,
        autoload: true
      })
    },
    // DataStoreに表示するドキュメントを保存する.
    //
    // @param {Object} document
    SetDatastore (state, payload) {
      state.DataStore = payload
    },

    // SortOrderの設定
    //
    // @param {Object} Field: order(-1 or 1)
    SetSortOrders (state, payload) {
      state.SortOrders = Object.assign({}, payload)
    },

    // Filterの設定
    //
    // @param {Object} Field: value
    SetFilters (state, payload) {
      state.Filters = Object.assign({ SequentialId: { $gt: 0 } }, payload)
    }

  },

  actions: {
    // DataStoreの更新. データベースの操作後は必ず実行する.
    //
    ReloadDatastore (context) {
      context.state.DatabaseInstance.find(
        context.state.Filters // { SequentialId: { $gt: 0 } }
      )
        .sort(context.state.SortOrders)
        .exec(
          (error, documents) => {
            if (!error) {
              context.commit('SetDatastore', documents)
            }
          }
        )
    },

    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    InsertItemIntoDatastore (context, payload) {
      const ErrorAutonumberFailed = 'データベースエラー AUTO-NUMBERING FAILED'

      return new Promise((resolve, reject) => {
        context.state.DatabaseInstance.count(
          {
            InstitutionalPatientId: payload.InstitutionalPatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          (error, count) => {
            if (error) reject(error)
            if (count > 0) reject(new Error('同一日に同一IDの症例は登録できません.'))
            resolve()
          }
        )
      }).then(() => {
        return new Promise((resolve, reject) => {
          payload.SequentialId = '__autoid__'
          context.state.DatabaseInstance.insert(
            payload,
            (error) => {
              if (error) reject(error)

              context.state.DatabaseInstance.findOne(
                { sequence: 'maindb' },
                (error, sequencerow) => {
                  if (error) reject(error)

                  const newid = (sequencerow ? sequencerow.number : 0) + 1
                  context.state.DatabaseInstance.update(
                    { sequence: 'maindb' },
                    { sequence: 'maindb', number: newid },
                    { upsert: true },
                    (error) => {
                      if (error) reject(new Error(ErrorAutonumberFailed))

                      context.state.DatabaseInstance.update(
                        { SequentialId: '__autoid__' },
                        { $set: { SequentialId: newid } },
                        {},
                        (error) => {
                          if (error) reject(new Error(ErrorAutonumberFailed))

                          context.dispatch('ReloadDatastore')
                          resolve()
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        })
      }).catch(error => {
        // 連番付与が失敗した場合は症例データ登録を rollback.
        if (error.message === ErrorAutonumberFailed) {
          context.state.DatabaseInstance.remove(
            { SequentialId: '__autoid__' },
            { multi: false }
          )
        }
        return Promise.reject(error)
      })
    },

    // 症例データの更新. Case.SequentialId をキーとするため、有効な SequentialId であることが必須.
    // 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    ReplaceItemInDatastore (context, payload) {
      return new Promise((resolve, reject) => {
        if (payload.SequentialId <= 0) reject(new Error('内部IDの指定に問題があります.'))
        context.state.DatabaseInstance.find(
          {
            InstitutionalPatientId: payload.InstitutionalPatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          { SequentialId: 1 },
          (error, documents) => {
            if (error) reject(error)
            for (const document of documents) {
              if (document.SequentialId !== payload.SequentialId) reject(new Error('同一日に同一IDの症例は登録できません.'))
            }
            context.state.DatabaseInstance.update(
              { SequentialId: payload.SequentialId },
              payload,
              {},
              (error, numupdated) => {
                if (error) reject(error)
                context.dispatch('ReloadDatastore')
                resolve()
              }
            )
          }
        )
      })
    },

    // 症例データの登録. SequentialIdで、新規(===0)・更新(>0)を区別する.
    //
    // @param {Object} オブジェクトCase
    UpsertItemInDatastore (context, payload) {
      if (payload.SequentialId && payload.SequentialId > 0) {
        return context.dispatch('ReplaceItemInDatastore', payload)
      } else {
        return context.dispatch('InsertItemIntoDatastore', payload)
      }
    },

    // 症例データの削除.
    //
    // @param {Object} オブジェクトCase (検索に用いるのは SequentialId のみ)
    RemoveItemFromDatastore (context, payload) {
      return new Promise((resolve, reject) => {
        try {
          if (payload.SequentialId <= 0) throw new Error()
          context.state.DatabaseInstance.remove(
            { SequentialId: payload.SequentialId },
            {},
            (error) => {
              if (error) throw error
              context.dispatch('ReloadDatastore')
              resolve()
            }
          )
        } catch (error) {
          reject(error)
        }
      })
    }
  }
})

export default store
