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
    ApplicationVersion: '5.00.0728.prealpha.vueserve',
    DatabaseInstance: undefined,
    // 表示されるデータのキャッシュ
    DataStore: [],
    Filter: {
      SequentialId: { $gt: 0 }
    },
    Sort: {
      SequentialId: -1
    },
    // Listの表示状態の待避
    ShowWelcomeBanner: true,
    defaultViewSettings: { Sort: { Item: 'SequentialId', Order: -1 }, Filter: [] },
    preservedViewSettings: { Sort: { Item: 'SequentialId', Order: -1 }, Filter: [] }
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
    // 現在の DataStore の長さを配列で返す.
    //
    GetNumberOfCases (state) {
      return state.DataStore.length
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
    },
    // VListのフィルター設定オブジェクトの待避
    //
    //
    GetViewSettings (state) {
      return state.preservedViewSettings
    }
  },

  mutations: {
    // DatabaseInstanceを設定する.
    // App.vue の onCreated からのみ呼ばれる.
    //
    initDatabase (state, payload) {
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

    // Sortの設定
    //
    // @param {Object}
    SetSort (state, payload) {
      state.Sort = payload
    },

    // Filterの設定
    //
    // @param {Object}
    SetFilter (state, payload) {
      state.Filter = payload
    },

    // 表示設定の設定と待避
    //
    // @param {Object} Sort.Item, Sort.Order, Filter[ { Field:, Value: }... ]
    SetViewSettings (state, payload) {
      function createFilterQuery (Filter) {
        const paramFilter = {}
        for (const filteritem of Filter) {
          const filterField = filteritem.Field
          const filterValue = filteritem.Value

          if (paramFilter[filterField] === undefined) {
            paramFilter[filterField] = filterValue
          } else {
            if (paramFilter[filterField].$in) {
              paramFilter[filterField].$in.push(filterValue)
            } else {
              paramFilter[filterField] = { $in: [paramFilter[filterField], filterValue] }
            }
          }
        }

        if (!paramFilter.SequentialId) {
          paramFilter.SequentialId = { $gt: 0 }
        }

        if (paramFilter.DateOfProcedure) {
          let regexStr = ''
          if (paramFilter.DateOfProcedure.$in) {
            regexStr = paramFilter.DateOfProcedure.$in.join('|')
          } else {
            regexStr = paramFilter.DateOfProcedure
          }
          regexStr = '^(' + regexStr + ')-'
          paramFilter.DateOfProcedure = { $regex: new RegExp(regexStr) }
        }

        return paramFilter
      }

      function preserveSetting (source) {
        if (!preserve) return

        state.preservedViewSettings.Sort.Item = source.Sort.Item
        state.preservedViewSettings.Sort.Order = source.Sort.Order
        state.preservedViewSettings.Filter
          .splice(
            0, state.preservedViewSettings.Filter.length,
            ...source.Filter
          )
      }

      const preserve = !payload.noPreserve

      if (payload) {
        preserveSetting(payload)
        state.Sort = payload.Sort
          ? { [payload.Sort.Item]: Number(payload.Sort.Order) }
          : { [state.defaultViewSettings.Sort.Item]: Number(state.defaultViewSettings.Sort.Order) }
        state.Filter = createFilterQuery(payload.Filter)
      } else {
        preserveSetting(state.defaultViewSettings)
        state.Sort = { [state.defaultViewSettings.Sort.Item]: Number(state.defaultViewSettings.Sort.Order) }
        state.Filter = createFilterQuery(state.defaultViewSettings.Filter)
      }
    },

    // VListでのメッセージバナーを表示しないようにする.(再表示は再起動しない限りしない)
    //
    //
    HideWelcome (state) {
      state.ShowWelcomeBanner = false
    }
  },

  actions: {
    // DataStoreの更新. データベースの操作後は必ず実行する.
    //
    // @Param {Object} Filter: {field: condition,...}, Sort: {field: order,...}
    ReloadDatastore (context, payload = {}) {
      return new Promise((resolve, reject) => {
        const Filter = { SequentialId: { $gt: 0 } }
        const Sort = {}
        if (payload.Filter !== undefined) {
          Object.assign(Filter, payload.Filter)
        } else {
          Object.assign(Filter, context.state.Filter)
        }

        if (payload.Sort !== undefined) {
          Object.assign(Sort, payload.Sort)
        } else {
          Object.assign(Sort, context.state.Sort)
        }

        context.state.DatabaseInstance.find(Filter)
          .sort(Sort)
          .exec(
            (error, documents) => {
              if (!error) {
                context.commit('SetDatastore', documents)
                resolve()
              } else {
                reject(error)
              }
            }
          )
      })
    },

    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    InsertItemIntoDatastore (context, payload) {
      const DatabaseInstance = context.state.DatabaseInstance
      const ErrorAutonumberFailed = 'データベースエラー AUTO-NUMBERING FAILED'

      return new Promise((resolve, reject) => {
        DatabaseInstance.count(
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
          DatabaseInstance.insert(
            payload,
            (error) => {
              if (error) reject(error)

              DatabaseInstance.findOne(
                { sequence: 'maindb' },
                (error, sequencerow) => {
                  if (error) reject(error)

                  const newid = (sequencerow ? sequencerow.number : 0) + 1
                  DatabaseInstance.update(
                    { sequence: 'maindb' },
                    { sequence: 'maindb', number: newid },
                    { upsert: true },
                    (error) => {
                      if (error) reject(new Error(ErrorAutonumberFailed))

                      DatabaseInstance.update(
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
          DatabaseInstance.remove(
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
      const DatabaseInstance = context.state.DatabaseInstance
      return new Promise((resolve, reject) => {
        if (payload.SequentialId <= 0) reject(new Error('内部IDの指定に問題があります.'))
        DatabaseInstance.find(
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
            DatabaseInstance.update(
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
    },

    // 症例データのもつ DateOfProcedure から年次と症例数を集計したobjectを返す(async-promise)
    //
    async GetYears (context) {
      const DatabaseInstance = context.state.DatabaseInstance

      return new Promise((resolve, reject) => {
        DatabaseInstance.find(
          {
            SequentialId: { $gt: 0 }
          },
          {
            DateOfProcedure: 1,
            _id: 0
          }).sort(
          {
            DateOfProcedure: -1
          }).exec(
          (error, documents) => {
            if (error) {
              reject(error)
            } else {
              const CountByYear = {}
              for (const document of documents) {
                const year = document.DateOfProcedure.substring(0, 4)

                if (!CountByYear[year]) CountByYear[year] = 0
                CountByYear[year]++
              }
              resolve(CountByYear)
            }
          }
        )
      })
    }

  }
})

export default store
