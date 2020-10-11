import Vue from 'vue'
import Vuex from 'vuex'
import * as NedbAccess from '@/modules/serve/NedbAccess'
import system from '@/store/modules/system'
import password from '@/store/modules/passwordauth'

Vue.use(Vuex)

const Database = require('nedb')

const store = new Vuex.Store({
  modules: {
    system, password
  },
  state: {
    ApplicationVersion: '5.00.0929.vueserve',
    LoadAtOnce: 100,
    // serve版で使用されるデータベースインスタンス - electronでは消滅するため必ずactionを経由する必要あり
    DatabaseInstance: undefined,
    Uids: {
      List: [], // 表示対象となるuidの全リスト
      RangeFrom: -1, // ロードされているuidの最初のインデックス
      RangeTo: -1 // ロードされているuidの最期のインデックス
    },
    DataStore: [], // インメモリのデータベースレプリケーション
    // 以下データベースリストのクエリの待避
    Filter: {
      DocumentId: { $gt: 0 }
    },
    Sort: {
      DocumentId: -1
    },
    // Listの表示状態の待避
    ShowWelcomeBanner: true,
    defaultViewSettings: { Sort: { Item: 'DocumentId', Order: -1 }, Filter: [] },
    preservedViewSettings: { Sort: { Item: 'DocumentId', Order: -1 }, Filter: [] }
  },
  getters: {
    ApplicationVersion (state) {
      return state.ApplicationVersion
    },
    // 現在の DataStore 中の DocumentId を配列で返す.
    //
    GetUids (state) {
      return state.DataStore.map(
        item => item.DocumentId
      )
    },
    // 現在の DataStore の長さを配列で返す.
    //
    GetNumberOfCases (state) {
      return state.DataStore.length
    },
    // 指定された DocumentId の {Array} [前の SequqntialId, 後の SequqntialId] を返す.
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
    // DocumentId をもつドキュメントを取得する
    //
    // @param {Number}
    GetItemObject (state) {
      return function (DocumentId) {
        const FilterdItems = state.DataStore.filter((item) => {
          return item.DocumentId === DocumentId
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
    initDatabase (state) {
      // electronでの実装ではmain processで既にデータベースインスタンスが作成されているので
      // ここではなにもせず DatabaseInstanceはundefined
      state.DatabaseInstance = NedbAccess.CreateInstance(
        // vue-cliではブラウザのローカルストレージを使用したデータベースを作成
        {
          filename: 'joed.nedb',
          autoload: true
        },
        Database
      )
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

        if (!paramFilter.DocumentId) {
          paramFilter.DocumentId = { $gt: 0 }
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

      const preserve = payload && !payload.noPreserve

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
    // データベース操作 - moduleのフォルダで実行環境を分離する作戦
    // Insert document
    // @Param {Object} Document
    dbInsert (context, payload) {
      return NedbAccess.Insert(payload, context.state.DatabaseInstance)
    },
    // Find documents
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip, Limit
    dbFind (context, payload) {
      return NedbAccess.Find(payload, context.state.DatabaseInstance)
    },
    // Find a first document
    // @Param {Object} Query, Projection, Sort,
    // @Param {Number} Skip
    dbFindOne (context, payload) {
      return NedbAccess.FindOne(payload, context.state.DatabaseInstance)
    },
    // Count matched documents
    // @Param {Object} Query
    dbCount (context, payload) {
      return NedbAccess.Count(payload, context.state.DatabaseInstance)
    },
    // Update documents
    // @Param {Object} Query, Update, Options
    dbUpdate (context, payload) {
      return NedbAccess.Update(payload, context.state.DatabaseInstance)
    },
    // Remove documents
    // @Param {Object} Query, Options
    dbRemove (context, payload) {
      return NedbAccess.Remove(payload, context.state.DatabaseInstance)
    },

    // DataStoreの更新. データベースの操作後は必ず実行する.
    //
    // @Param {Object} Filter: {field: condition,...}, Sort: {field: order,...}
    ReloadDatastore (context, payload = {}) {
      const Query = { DocumentId: { $gt: 0 } }
      const Sort = {}
      Object.assign(Query, payload.Filter ? payload.Filter : context.state.Filter)
      Object.assign(Sort, payload.Sort ? payload.Sort : context.state.Sort)

      return context.dispatch('dbFind', { Query: Query, Sort: Sort })
        .then(documents => {
          context.commit('SetDatastore', documents)
        })
        .catch(error => error)
    },

    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    InsertItem (context, payload) {
      // const DatabaseInstance = context.state.DatabaseInstance
      const ErrorAutonumberFailed = 'データベースエラーです. AUTO-NUMBERING FAILED'

      return new Promise((resolve, reject) => {
        context.dispatch('dbCount', {
          Query: {
            PatientId: payload.PatientId,
            DateOfProcedure: payload.DateOfProcedure
          }
        }).then(count => {
          if (count > 0) reject(new Error('同一日に同一IDの症例は登録できません.'))
          resolve()
        },
        error => reject(error))
      }).then(() => {
        payload.DocumentId = '__autoid__'
        return context.dispatch('dbInsert', {
          Document: payload
        }).then(_ => {
          return new Promise((resolve, reject) => {
            let newid = 0
            // 連番付与
            context.dispatch('dbFindOne', {
              Query: { sequence: 'maindb' }
            }).then(sequencerow => {
              newid = (sequencerow ? sequencerow.number : 0) + 1

              context.dispatch('dbUpdate', {
                Query: { sequence: 'maindb' },
                Update: { sequence: 'maindb', number: newid },
                Options: { upsert: true }
              }).then(
                _ => resolve(newid)
              ).catch(_ => reject(new Error(ErrorAutonumberFailed)))
            }).catch(_ => reject(new Error(ErrorAutonumberFailed)))
          }).then(newid => {
            // 登録
            context.dispatch('dbUpdate', {
              Query: { DocumentId: '__autoid__' },
              Update: { $set: { DocumentId: newid } },
              Options: {}
            }).then(_ => {
              context.dispatch('ReloadDatastore')
              Promise.resolve()
            }).catch(error => Promise.reject(error))
          }).catch(error => {
            // 連番付与登録に失敗した場合仮登録の部分は削除-rollback
            context.dispatch('dbRemove', {
              Query: {
                DocumentId: '__autoid__'
              },
              Options: {
                multi: true
              }
            }).then((_, __) => {
              Promise.reject(error)
            })
          })
        }).catch(_ => {
          // Insertに失敗
          return Promise.reject(new Error('データベースエラーです.'))
        })
      })
    },

    // 症例データの更新. Case.DocumentId をキーとするため、有効な DocumentId であることが必須.
    // 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    ReplaceItem (context, payload) {
      return new Promise((resolve, reject) => {
        if (payload.DocumentId <= 0) reject(new Error('内部IDの指定に問題があります.'))
        context.dispatch('dbFind', {
          Query: {
            PatientId: payload.PatientId,
            DateOfProcedure: payload.DateOfProcedure
          },
          Projection: { DocumentId: 1 }
        }).then(documents => {
          for (const document of documents) {
            if (document.DocumentId !== payload.DocumentId) reject(new Error('同一日に同一IDの症例は登録できません.'))
          }
          context.dispatch('dbUpdate', {
            Query: { DocumentId: payload.DocumentId },
            Update: payload,
            Options: {}
          }).then(_ => {
            context.dispatch('ReloadDatastore')
            resolve()
          })
        }).catch(error => reject(error))
      })
    },

    // 症例データの登録. DocumentIdで、新規(===0)・更新(>0)を区別する.
    //
    // @param {Object} オブジェクトCase
    UpsertItem (context, payload) {
      if (payload.DocumentId && payload.DocumentId > 0) {
        return context.dispatch('ReplaceItem', payload)
      } else {
        return context.dispatch('InsertItem', payload)
      }
    },

    // 症例データの削除.
    //
    // @param {Object} オブジェクトCase (検索に用いるのは DocumentId のみ)
    RemoveItem (context, payload) {
      return new Promise((resolve, reject) => {
        if (payload.DocumentId <= 0) reject(new Error())
        context.dispatch('dbRemove', {
          Query: { DocumentId: payload.DocumentId }
        }).then(_ => {
          context.dispatch('ReloadDatastore')
          resolve()
        }).catch(error => reject(error))
      })
    },

    // 症例データのもつ DateOfProcedure から年次と症例数を集計したobjectを返す(async-promise)
    //
    async GetYears (context) {
      const DatabaseInstance = context.state.DatabaseInstance

      return new Promise((resolve, reject) => {
        DatabaseInstance.find(
          {
            DocumentId: { $gt: 0 }
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
