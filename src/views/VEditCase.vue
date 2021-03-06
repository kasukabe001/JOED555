<template>
  <div>
    <div class="app-dialog w800p">
      <div class="edit-top">
        <div class="edit-top-left">
          <InputDateOfProcedure v-model="CaseData.DateOfProcedure" :required="true"/>
          <InputTextField title="患者ID" :required="true" v-model="CaseData.PatientId" placeholder="施設の患者ID"/>
          <InputTextField title="患者名" v-model="CaseData.Name"/>
          <InputProcedureTime v-model="CaseData.ProcedureTime"/>
        </div>
        <div class="edit-top-right">
          <InputTextField title="腫瘍登録番号" v-model="CaseData.JSOGId" placeholder="腫瘍登録患者No."/>
          <InputTextField title="NCD症例識別コード" v-model="CaseData.NCDId" placeholder="NCD症例識別コード"/>
          <div> <!-- spacer -->
          </div>
          <InputNumberField title="年齢" :required="true" v-model="CaseData.Age" :min="1" :max="120"/>
        </div>
      </div>

      <SectionDiagnoses
        :container.sync="CaseData.Diagnoses"
        @addnewitem="OpenEditView('diagnosis')"
        @edititem="OpenEditView('diagnosis', $event)"
        @removeitem="RemoveListItem('Diagnoses', $event)"
      />

      <SectionProcedures
        :container.sync="CaseData.Procedures"
        @addnewitem="OpenEditView('procedure')"
        @edititem="OpenEditView('procedure', $event)"
        @removeitem="RemoveListItem('Procedures', $event)"
      />

      <SectionAEs
        :container.sync="CaseData.AEs"
        :optionValue.sync="isNoAEs"
        @addnewitem="OpenEditView('AE')"
        @removeitem="RemoveListItem('AEs', $event)"
      />

      <!-- Controles -->
      <el-button icon="el-icon-caret-left" size="medium" circle id="MovePrev" v-if="IsEditingExistingItem" :disabled="Processing || !PrevUid" @click="CancelEditing(-1)"></el-button>
      <el-button icon="el-icon-caret-right" size="medium" circle id="MoveNext" v-if="IsEditingExistingItem" :disabled="Processing || !NextUid" @click="CancelEditing(+1)"></el-button>

      <div class="edit-controls">
        <div class="edit-controls-left">
          <el-button type="warning" icon="el-icon-warning" @click="ShowNotification" v-if="CaseData.Notification">入力内容の確認が必要です.</el-button>
        </div>
        <div class="edit-controls-right">
          <div>
            <el-button type="primary" icon="el-icon-arrow-left" @click="CancelEditing()">戻る</el-button>
          </div>
          <div>
            <el-dropdown split-button type="primary" @click="CommitCase()" @command="CommitCaseAndGo">
              編集内容を保存<i class="el-icon-loading" v-if="Processing"/>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="next" v-if="IsEditingExistingItem && NextUid">保存して次へ</el-dropdown-item>
                <el-dropdown-item command="prev" v-if="IsEditingExistingItem && PrevUid">保存して前へ</el-dropdown-item>
                <el-dropdown-item command="new">保存して新規作成</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div v-if="IsEditingExistingItem">
            <el-button type="danger" icon="el-icon-delete" @click="RemoveCase()">削除</el-button>
          </div>
        </div>
      </div>
    </div>
    <!--モーダルダイアログとしてルーティングを使用する-->
    <div>
      <router-view @data-upsert="EditListItem"></router-view>
    </div>
    <TheWrapper v-if="Processing"/>
  </div>
</template>

<script>
// import DbItems from '@/modules/DbItemHandler'
import SectionDiagnoses from '@/components/SectionDiagnoses'
import SectionProcedures from '@/components/SectionProcedures'
import SectionAEs from '@/components/SectionAEs'
import InputTextField from '@/components/Molecules/InputTextField'
import InputNumberField from '@/components/Molecules/InputNumberField'
import InputProcedureTime from '@/components/Molecules/InputProcedureTime'
import InputDateOfProcedure from '@/components/Molecules/InputDateOfProcedure'
import TheWrapper from '@/components/Atoms/AtomTheWrapper'

import { ZenToHan } from '@/modules/ZenHanChars'
import Popups from 'depmodules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ViewEditCase',
  components: {
    InputTextField,
    InputNumberField,
    InputProcedureTime,
    InputDateOfProcedure,
    SectionDiagnoses,
    SectionProcedures,
    SectionAEs,
    TheWrapper
  },
  props: {
    uid: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return ({
      CaseData: {
        Name: '',
        Age: undefined,
        PatientId: '',
        JSOGId: '',
        NCDId: '',
        DateOfProcedure: '',
        ProcedureTime: '',
        TypeOfProcedure: '',
        PresentAE: true,
        Diagnoses: [],
        Procedures: [],
        AEs: [],
        Notification: ''
      },
      PrevUid: 0,
      NextUid: 0,
      Edited: false,
      Processing: true
    })
  },
  // DataStoreから既存データの読み込みをする.
  //
  // @prop {uid} DocumentId
  mounted () {
    if (Number(this.uid) > 0) {
      this.$store.dispatch('FetchDocument', { DocumentId: this.uid })
        .then(_ => {
          const casedocument = this.$store.getters.CaseDocument(this.uid)
          for (var key in this.CaseData) {
            if (casedocument !== undefined && casedocument[key] !== undefined) {
              switch (toString.call(casedocument[key])) {
                case '[object Object]':
                  this.CaseData[key] = Object.assign(this.CaseData[key], casedocument[key])
                  break
                case '[object Array]':
                  casedocument[key].forEach(item => this.CaseData[key].push(item))
                  break
                default:
                  this.CaseData[key] = casedocument[key]
              }
            }
          }
          this.PrevUid = this.$store.getters.NextUids(this.uid).Prev
          this.NextUid = this.$store.getters.NextUids(this.uid).Next

          this.$nextTick(_ => {
            this.Processing = false
            this.Edited = false
          })
        })
    } else {
      this.Processing = false
    }
  },
  watch: {
    CaseData: {
      handler: function () {
        this.Edited = true
      },
      deep: true
    }
  },
  computed: {
    isNoAEs: {
      get () {
        return !this.CaseData.PresentAE
      },
      set (newvalue) {
        this.CaseData.PresentAE = !newvalue
      }
    },
    IsEditingExistingItem () {
      return (this.uid > 0)
    }
  },
  methods: {
    OpenEditView (target, params = {}) {
      const index = params.ItemIndex !== undefined ? params.ItemIndex : -1
      const value = params.ItemValue || {}
      const editingYear = this.CaseData.DateOfProcedure.substr(0, 4)
      this.$router.push({
        name: target,
        params: {
          ItemIndex: index,
          ItemValue: value,
          year: editingYear
        }
      })
    },
    GoBackToList (hashuid) {
      if (hashuid === 0) {
        this.$router.push({ name: 'list' })
      } else {
        this.$router.push({ name: 'list', hash: ('#case-' + hashuid) })
      }
    },

    ShowNotification () {
      Popups.alert(this.CaseData.Notification)
    },

    EditListItem (target, index, value) {
      this.UpdateList(this.CaseData[target], index, value)
      if (target === 'AEs') {
        this.CaseData.PresentAE = (this.CaseData.AEs.length > 0)
      }
    },
    RemoveListItem (target, index) {
      this.EditListItem(target, index, '')
    },
    UpdateList (ListArray, index, value) {
      const IsObjectEmpty = value =>
        (
          (typeof (value) === 'string' && value === '') ||
          (typeof (value) === 'object' && Object.keys(value).length === 0)
        )

      if (index >= 0) {
        if (ListArray[index] !== undefined) {
          // 空データが与えられた場合は当該インデックスを削除
          if (IsObjectEmpty(value)) {
            ListArray.splice(index, 1)
          } else {
            // 実データが与えられた場合は当該インデックスの内容を置換する
            ListArray.splice(index, 1, value)
          }
        }
      } else {
        // インデックスがundefinedもしくは-1の場合は新規項目としてリストに追加する
        if (!IsObjectEmpty(value)) {
          ListArray.push(value)
        }
      }
    },

    CancelEditing (offset = 0) {
      const isEmpty =
        this.CaseData.DateOfProcedure === '' &&
        this.CaseData.PatientId.trim() === '' &&
        this.CaseData.Name.trim() === '' &&
        this.CaseData.ProcedureTime === '' &&
        this.CaseData.Age === undefined &&
        this.CaseData.Diagnoses.length === 0 &&
        this.CaseData.Procedures.length === 0 &&
        this.CaseData.AEs.length === 0 &&
        this.CaseData.PresentAE === true

      if (this.Edited === false || isEmpty || Popups.confirm('編集中の項目がありますがよろしいですか?')) {
        if (offset === 0) {
          this.GoBackToList(this.uid)
        } else {
          if (offset < 0 && this.PrevUid !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.PrevUid } })
          }
          if (offset > 0 && this.NextUid !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.NextUid } })
          }
        }
      }
    },
    RemoveCase () {
      if (this.uid > 0 && Popups.confirm('この症例を削除します.よろしいですか?')) {
        this.$store.dispatch('RemoveDocument', { DocumentId: this.uid })
          .then(_ => this.GoBackToList())
      }
    },
    CommitCase () {
      if (this.Processing) {
        return
      }
      this.StoreCase()
        .then(() => this.GoBackToList(this.uid))
        .catch(e => Popups.alert(e.message))
    },
    CommitCaseAndGo (to = '') {
      if (this.Processing) {
        return
      }
      // HACK:
      // 新規(uid = '0')→新規(uid = '0')ではApp.vueで定義したRouterKeyが重複するための quick hack.
      // uid = '00' も uid > 0 がfalseで新規扱いになるのでそれを利用する.
      this.StoreCase()
        .then(() => {
          switch (to) {
            case 'new':
              this.$router.push({ name: 'edit', params: { uid: (this.uid === '0') ? '00' : '0' } })
              break
            case 'prev':
              if (this.PrevUid !== 0) this.$router.push({ name: 'edit', params: { uid: this.PrevUid } })
              break
            case 'next':
              if (this.NextUid !== 0) this.$router.push({ name: 'edit', params: { uid: this.NextUid } })
              break
            default:
              this.GoBackToList(this.uid)
          }
        })
        .catch(e => Popups.alert(e.message))
    },

    async StoreCase () {
      this.Processing = true

      // データベース登録に用いるドキュメントを生成
      const newDocument = {}
      Object.assign(newDocument, this.CaseData)

      // 連番 (新規ドキュメントのuidは0もしくは00があるのでNumberで処理する)
      newDocument.DocumentId = Number(this.uid)

      // 警告の削除
      delete newDocument.Notification

      // テキストフィールドの整形(trimと半角英数に置換)
      newDocument.Name = newDocument.Name.trim()
      newDocument.PatientId = ZenToHan(newDocument.PatientId.trim()).replace(/[^\d\w-&]/g, '')

      if (newDocument.JSOGId.trim() === '') {
        delete newDocument.JSOGId
      } else {
        newDocument.JSOGId = ZenToHan(newDocument.JSOGId.trim())
      }
      if (newDocument.NCDId.trim() === '') {
        delete newDocument.NCDId
      } else {
        newDocument.NCDId = ZenToHan(newDocument.NCDId.trim())
      }

      // AEsが空白の際は削除
      if (newDocument.AEs.length === 0) {
        delete newDocument.AEs
      }

      // 区分コードの抽出
      newDocument.TypeOfProcedure = newDocument.Procedures[0] && newDocument.Procedures[0].Chain[0]

      try {
        await ValidateCase(newDocument)
        await this.$store.dispatch('UpsertDocument', newDocument)
      } catch (error) {
        console.log(error)
        throw error
      } finally {
        this.Processing = false
      }
    }
  }
}
</script>

<style lang="sass">
div.edit-top
  padding-right: 3rem
  display: flex
  flex-direction: row
  input[type="text"]
    width: 100%
  select
    width: 100%
    height: 2rem
  & > div
    display: flex
    flex-direction: column
    & > div
      display: flex
      flex-direction: row
      height: 2.4rem
    .label
      width: 40%
      text-align: right
      padding-top: 0.2rem
    .field
      margin-left: 2rem
      width: 60%
      .number
        width: 3rem

div.edit-top-left
  width: 40%
div.edit-top-right
  width: 60%

div.vdp-datepicker__calendar
  width: 300px !important
  z-index: 900
/* セクション系ペイン */
/* コントロール */
#MovePrev
  position: absolute
  top: 70px
  left: 10px
#MoveNext
  position: absolute
  top: 70px
  right: 10px
div.edit-controls
  position: relative
  text-align: right
  padding-top: 16px
  padding-bottom: 8px
  display: flex
  flex-direction: row
  justify-content: space-between
div.edit-controls-left
  display: flex
  flex-direction: row
  justify-content: flex-start
div.edit-controls-right
  display: flex
  flex-direction: row
  justify-content: flex-end
  & > div
    margin-left: 0.2rem
</style>
