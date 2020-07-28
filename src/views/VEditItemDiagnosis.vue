<template>
  <div class="edititem-overlay">
    <div class="edititem-overlay-content">
      <div class="flex-content">
        <div class="w20 selectionbox">
          <div class="subtitle-section">カテゴリ</div>
          <select v-model="Category"
            size="8"
            @change="CategoryIsChanged()">
            <option v-for="(item,key,index) in Categories"
              :key="index"
              :value="item">
              {{item}}
            </option>
          </select>
        </div>
        <div class="w20 selectionbox">
          <div class="subtitle-section">対象臓器</div>
          <select v-model="TargetOrgan"
            size="8"
            @change="SetCandidateItemsBySelection()">
            <option v-if="TargetOrgans.length === 0" value=""/>
            <option v-for="(item,key,index) in TargetOrgans"
              :key="index"
              :value="item">
              {{item}}
            </option>
          </select>
        </div>
        <div class="w60 selectionbox">
          <div class="subtitle-section">候補病名</div>
          <select v-model="SelectedItem"
            size="8"
            @dblclick="CommitChanges()">
            <option v-if="CandidateItems.length === 0" value=""/>
            <option v-for="(item,key,index) in CandidateItems"
              :key="index"
              :value="item">
              {{item}}
            </option>
          </select>
        </div>
      </div>

      <div class="flex-content inputbox">
        <div class="w20"></div>
        <div class="w20 subtitle-section">
          <div tabindex="0" @click="ToggleEditsection()">
            <span>診断入力</span>
            <i class="el-icon-d-arrow-right" v-show="!ExpandEditsection"/>
          </div>
        </div>
        <div class="w40" v-show="ExpandEditsection">
            <input type="text"
              v-model="EditableItem"
              :disabled="!UserEditingAllowed"
              placeholder="カテゴリ選択後に検索可能になります"
            />
        </div>
        <div class="w20" v-show="ExpandEditsection">
          <el-button type="primary" @click="SetCandidateItemsByFreeword()" icon="el-icon-search">候補を検索</el-button>
        </div>
      </div>

      <div class="content-bottom">
        <div class="controls">
          <el-button type="primary" @click="GoBack">取り消し</el-button>
          <el-button type="primary" @click="CommitChanges">登録</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import DiagnosisTree from '@/modules/DiagnosisItemList'
import { getMatchesInDiagnoses } from '@/modules/CloseMatches'
import Popups from '@/modules/Popups.js'

const DiagnosesTree = new DiagnosisTree()

export default {
  data () {
    return {
      CandidateItems: []
    }
  },
  mixins: [
    EditItemMixins
  ],
  created () {
    if (this.ItemValue.UserTyped && this.ItemValue.UserTyped === true) {
      this.Category = this.ItemValue.Chain[0]
      this.TargetOrgan = this.ItemValue.Chain[1] ? this.ItemValue.Chain[1] : ''
      this.EditableItem = this.ItemValue.Text
      this.$nextTick()
    }
  },
  watch: {
    SelectedItem: {
      handler: function (newvalue) {
        if (this.IsItemEdited) {
          if (newvalue !== '') {
            this.UserInputText = this.EditableItem
          }
        }
        this.EditableItem = newvalue
      }
    }
  },
  computed: {
    Categories () {
      return DiagnosesTree.Categories()
    },
    TargetOrgans () {
      return DiagnosesTree.Targets(this.Category)
    },
    UserEditingAllowed () {
      return !!this.Category && !this.SelectedItem
    }
  },
  methods: {
    CategoryIsChanged () {
      this.TargetOrgan = ''
      if (this.SelectedItem !== '') {
        this.EditableItem = ''
      }

      this.SelectedItem = ''
      this.CandidateItems.splice(0)

      this.$nextTick().then(_ => {
        if (this.TargetOrgans.length === 1) {
          this.TargetOrgan = this.TargetOrgans[0]
          this.SetCandidateItemsBySelection()
        }
        this.$nextTick()
      })
    },

    SetCandidateItemsBySelection () {
      this.CandidateItems = DiagnosesTree.Candidates(this.Category, this.TargetOrgan, this.year)
      this.SelectedItem = ''
      this.$nextTick()
    },
    SetCandidateItemsByFreeword () {
      if (this.EditableItem && this.UserEditingAllowed) {
        const flatten = DiagnosesTree.flatten(this.Category, this.year)
        const arr = getMatchesInDiagnoses(this.EditableItem, flatten)
        this.CandidateItems.splice(0, this.CandidateItems.length, ...arr)
        this.$nextTick()
      }
    },
    CommitChanges () {
      const temporaryItem = {}
      if (this.IsItemEdited) {
        this.SetCandidateItemsByFreeword()
        if (this.CandidateItems.length !== 0 && Popups.confirm('候補診断名があります,選択を優先してください.') === false) return
        if (Popups.confirm('直接入力した診断名の登録は可能な限り控えてください.') === false) return
        Object.assign(temporaryItem,
          {
            Text: this.TrimmedEditableItem,
            Chain: [this.Category],
            UserTyped: true
          }
        )
      } else {
        if (!this.SelectedItem) {
          return
        }
        Object.assign(temporaryItem,
          {
            Text: this.SelectedItem,
            Chain: [this.Category, this.TargetOrgan]
          }
        )
      }
      this.$emit('data-upsert', 'Diagnoses', this.ItemIndex, temporaryItem)
      this.GoBack()
    }
  }
}
</script>
