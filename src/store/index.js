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
    LoadAtOnce: 25,
    // serve版で使用されるデータベースインスタンス - 必ずactionを経由して利用
    // electron版では使用しないのでコメントアウト
    DatabaseInstance: undefined,
    DocumentIds: {
      List: [], // queryされたuidの全リスト
      Range: 0 // 表示対象のuidの数
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
    // 現在queryで設定されているドキュメントの DocumentId を配列で返す.
    //
    Uids (state) {
      return state.DocumentIds.List
    },
    // 現在表示されているドキュメントの DocumentId を配列で返す.
    //
    PagedUids (state) {
      return state.DocumentIds.List.slice(0, state.DocumentIds.Range)
    },
    // 現在表示されているドキュメントの DocumentId を配列で返す.
    //
    PagedUidsRange (state) {
      return state.DocumentIds.Range
    },
    // 現在queryで設定されているドキュメントの数を返す.
    //
    NumberOfCases (state) {
      return state.DocumentIds.List.length
    },
    // 指定された DocumentId の {Array} [前の DocumentId, 後の DocumentId] を返す.
    // 存在しないものは 0.
    //
    NextUids (state, getters) {
      return function (Uid) {
        if (Uid === 0) {
          return [0, 0]
        } else {
          const listlength = state.DocumentIds.List.length
          const index = state.DocumentIds.List.findIndex(item => item === Uid)
          const prevUid = index === 0 ? 0 : getters.Uids[index - 1]
          const nextUid = index === listlength - 1 ? 0 : getters.Uids[index + 1]
          return [prevUid, nextUid]
        }
      }
    },
    // DocumentId をもつドキュメントを取得する. ロードされていない場合は空のオブジェクトが返る.
    //
    // @param {Number}
    CaseDocument (state) {
      return function (DocumentId) {
        const DocumentIndex = state.DataStore.findIndex(item => item.DocumentId === DocumentId)
        if (DocumentIndex !== -1) {
          return state.DataStore[DocumentIndex]
        } else {
          return {}
        }
      }
    },
    // VListのフィルター設定オブジェクトの待避
    //
    //
    ViewSettings (state) {
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
    // DataStoreにデータベースをキャッシュする.
    //
    // @param {Object} document
    SetDatastore (state, payload) {
      const foundIndex = state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
      if (foundIndex === -1) {
        state.DataStore.push(payload)
      } else {
        state.DataStore[foundIndex] = payload
      }
    },
    // キャッシュDataStoreから指定のドキュメントを破棄.
    //
    // @param {Object} DocumentId
    RemoveDatastore (state, payload) {
      const foundIndex = state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
      if (foundIndex !== -1) {
        state.DataStore.splice(foundIndex, 1)
      }
    },
    // 表示対象数をクリア
    //
    ClearDocumentListRange (state) {
      state.DocumentIds.Range = Math.min(state.LoadAtOnce, state.DocumentIds.List.length)
    },
    // 表示対象数を増やす
    //
    IncrementDocumentListRange (state) {
      state.DocumentIds.Range = Math.min(state.DocumentIds.Range + state.LoadAtOnce, state.DocumentIds.List.length)
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

    // DocumentIdリストの更新. データベースの操作後は必ず実行する.
    //
    // @Param {Object} Filter: {field: condition,...}, Sort: {field: order,...}
    ReloadDatastore (context, payload = {}) {
      const Query = { DocumentId: { $gt: 0 } }
      const Projection = { DocumentId: 1, _id: 0 }
      const Sort = {}
      Object.assign(Query, payload.Filter ? payload.Filter : context.state.Filter)
      Object.assign(Sort, payload.Sort ? payload.Sort : context.state.Sort)

      return context.dispatch('dbFind',
        {
          Query: Query,
          Sort: Sort,
          Projection: Projection
        })
        .then(documents => {
          context.state.DocumentIds.List.splice(0)
          documents.forEach(doc => context.state.DocumentIds.List.push(doc.DocumentId))
        })
        .catch(error => error)
    },

    // 症例データの取得. ドキュメントの取得自体はgettersを経由する
    //
    // @Param {Object} DocumentIdのみのオブジェクト
    FetchDocument (context, payload) {
      return new Promise((resolve, reject) => {
        if (!payload.DocumentId) {
          resolve(undefined)
        } else {
          // 既にロードされているデータであればキャッシュから取得する
          const DataStoreIndex = context.state.DataStore.findIndex(item => item.DocumentId === payload.DocumentId)
          if (DataStoreIndex !== -1) {
            resolve(DataStoreIndex)
          } else {
            // キャッシュされていないデータなので読み込んでDatastoreにキャッシュする
            context.dispatch('dbFindOne', { Query: { DocumentId: payload.DocumentId }, Projection: { _id: 0 } })
              .then(fetcheddocument => {
                context.commit('SetDatastore', fetcheddocument)
                resolve()
              })
              .catch(error => reject(error))
          }
        }
      })
    },
    // 症例データの新規登録. 同一日時に同一IDの症例は登録出来ない.
    //
    // @param {Object} オブジェクトCase
    InsertDocument (context, payload) {
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
              // 登録完了
              context.dispatch('ReloadDatastore')
              context.commit('ClearDocumentListRange')
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
    ReplaceDocument (context, payload) {
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
            context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })
            context.dispatch('ReloadDatastore')
            resolve()
          })
        }).catch(error => reject(error))
      })
    },

    // 症例データの登録. DocumentIdで、新規(===0)・更新(>0)を区別する.
    //
    // @param {Object} オブジェクトCase
    UpsertDocument (context, payload) {
      if (payload.DocumentId && payload.DocumentId > 0) {
        return context.dispatch('ReplaceDocument', payload)
      } else {
        return context.dispatch('InsertDocument', payload)
      }
    },

    // 症例データの削除.
    //
    // @param {Object} オブジェクトCase (検索に用いるのは DocumentId のみ)
    RemoveDocument (context, payload) {
      return new Promise((resolve, reject) => {
        if (payload.DocumentId <= 0) reject(new Error())
        context.dispatch('dbRemove', {
          Query: { DocumentId: payload.DocumentId }
        }).then(_ => {
          context.commit('RemoveDatastore', { DocumentId: payload.DocumentId })
          context.commit('ClearDocumentListRange')
          context.dispatch('ReloadDatastore')
          resolve()
        }).catch(error => reject(error))
      })
    },

    // 症例データのもつ DateOfProcedure から年次と症例数を集計したobjectを返す(async-promise)
    //
    GetYears (context) {
      return new Promise((resolve, reject) => {
        context.dispatch('dbFind',
          {
            Query: { DocumentId: { $gt: 0 } },
            Projection: { DateOfProcedure: 1, _id: 0 },
            Sort: { DateOfProcedure: -1 }

          })
          .then(documents => {
            const CountByYear = {}
            for (const document of documents) {
              const year = document.DateOfProcedure.substring(0, 4)

              if (!CountByYear[year]) CountByYear[year] = 0
              CountByYear[year]++
            }
            resolve(CountByYear)
          })
          .catch(error => reject(error))
      })
    }

  }
})

export default store
