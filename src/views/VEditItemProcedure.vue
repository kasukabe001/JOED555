<template>
  <div class="edititem-overlay">
    <div class="edititem-overlay-content">
      <div class="flex-content">
        <div class="w20 selectionbox">
          <div class="subtitle-section">カテゴリ</div>
          <select v-model="Category"
            size="8"
            @change="TargetOrgan = '', SelectedItem = ''">
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
            <option v-if="TargetOrgans.length===0" value=""/>
            <option v-for="(item,key,index) in TargetOrgans"
              :key="index"
              :value="item">
              {{item}}
            </option>
          </select>
        </div>
        <div class="w60 selectionbox">
          <div class="subtitle-section">候補術式</div>
          <select
            size="8"
            :value="SelectedItem"
            @change="OnSelected"
            @dblclick="CommitChanges()">
            <option v-if="CandidateItems.length===0" value=""/>
            <option v-for="(item,key,index) in CandidateItems"
              :key="index"
              :value="item">
              {{item}}
            </option>
          </select>
        </div>
      </div>
      <!-- 追加術式ペイン -->
      <div class="flex-content" v-if="Description.AdditionalProcedureTitle">
        <div class="w30"></div>
        <div class="w30">
          <div class="subtitle-section">
            <span>付随する実施手術</span>
          </div>
        </div>
        <div class="w30">
          <span>{{Description.AdditionalProcedureTitle}}</span>
        </div>
        <div class="w10"></div>
      </div>
      <!-- 追加情報ペイン -->
      <div class="flex-content" v-if="Description.Title">
        <div class="w30"></div>
        <div class="w20 selectionbox">
          <div class="subtitle-section">
            <span>{{Description.Title}}</span>
          </div>
        </div>
        <div class="w40 selectionbox" v-if="Description.Multi">
          <label v-for="item in Description.Options" :key="item">
            <input type="checkbox" v-model="DescriptionValue" :value="item" />
            {{spliceMarker(item)}}
            <br/>
          </label>
        </div>
        <div class="w40 selectionbox" v-else>
          <select v-model="DescriptionValue[0]" @dblclick="CommitChanges()">
            <option v-for="item of Description.Options"
              :key="item"
              :value="item">
              {{spliceMarker(item)}}
            </option>
          </select>
        </div>
        <div class="w10"></div>
      </div>

      <div class="flex-content inputbox">
        <div class="w20"></div>
        <div class="w20 subtitle-section">
          <div tabindex="0" @click="ToggleEditsection()">
            <span>手術入力</span>
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
          <el-button type="primary" @click="GoBack" :disabled="disableCancel">取り消し</el-button>
          <el-button type="primary" @click="CommitChanges">登録</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import ProcedureTree from '@/modules/ProcedureItemList'
import { getMatchesInProcedures } from '@/modules/CloseMatches'
import Popups from '@/modules/Popups.js'

const ProceduresTree = new ProcedureTree()

export default {
  name: 'ViewEditItemProcedure',
  mixins: [
    EditItemMixins
  ],
  props: {
    disableCancel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      CandidateItems: [],
      Description: {
        AdditionalProcedureTitle: '',
        Title: '',
        Options: [],
        Multi: false,
        Value: []
      }
    })
  },
  created () {
    if (this.ItemValue.UserTyped && this.ItemValue.UserTyped === true) {
      this.Category = this.ItemValue.Chain[0]
      this.TargetOrgan = this.ItemValue.Chain[1] ? this.ItemValue.Chain[1] : ''
      this.EditableItem = this.ItemValue.Text
      this.$nextTick()
    }
  },
  computed: {
    Categories () {
      return ProceduresTree.Categories()
    },
    TargetOrgans () {
      return ProceduresTree.Targets(this.Category)
    },

    UserEditingAllowed () {
      return !!this.Category && !this.SelectedItem
    },

    DescriptionValue: {
      set (newvalue) {
        if (typeof newvalue === 'string') {
          this.Description.Value.splice(0)
          if (newvalue !== undefined) {
            this.Description.Value.push(newvalue)
          }
        } else {
          this.Description.Value = newvalue
        }
      },
      get () {
        return this.Description.Value
      }
    }
  },
  methods: {
    SetCandidateItemsBySelection () {
      this.CandidateItems = ProceduresTree.Candidates(this.Category, this.TargetOrgan)
      this.SelectedItem = ''
      this.Description.AdditionalProcedureTitle = ''
      this.Description.Title = ''
      this.$nextTick()
    },
    SetCandidateItemsByFreeword () {
      if (this.EditableItem && this.UserEditingAllowed) {
        const flatten = ProceduresTree.flatten(this.Category)
        const arr = getMatchesInProcedures(this.EditableItem, flatten)

        this.CandidateItems.splice(0, this.CandidateItems.length, ...arr)
        this.SelectedItem = ''
        this.Description.AdditionalProcedureTitle = ''
        this.Description.Title = ''
        this.$nextTick()
      }
    },

    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    },

    OnSelected (event) {
      const newValue = event.target.value
      this.SelectedItem = newValue
      this.EditableItem = newValue

      if (!this.TargetOrgan) {
        const searchByName = ProceduresTree.findItemByName(newValue)
        this.TargetOrgan = searchByName.Chain[1]
      }
      const selectedItemObject = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, newValue)

      this.setDataAdditionalProcedure(selectedItemObject)
    },

    setDataAdditionalProcedure (item) {
      const additionalProcedure = ProcedureTree.getAdditioninalProcedure(item)
      if (additionalProcedure) {
        this.Description.AdditionalProcedureTitle = additionalProcedure

        const additionalItem = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, additionalProcedure)
        this.setDataDescription(additionalItem)
      } else {
        this.Description.AdditionalProcedureTitle = ''
        this.setDataDescription(item)
      }
    },

    setDataDescription (item) {
      const setDescriptionProperties = (Title, Multi, Options) => {
        this.Description.Title = Title
        this.$nextTick().then(() => {
          this.Description.Multi = Multi
          this.$nextTick().then(() => {
            if (Options.length === 0) {
              this.Description.Options.splice(0)
            } else {
              this.Description.Options = Options
            }
          })
        })
      }

      const descriptionTitle = ProcedureTree.getDescriptionTitle(item)
      this.Description.Value.splice(0)

      if (descriptionTitle) {
        setDescriptionProperties(
          descriptionTitle,
          ProcedureTree.isDescriptionMultiple(item),
          ProcedureTree.getDescriptionValue(item)
        )
      } else {
        setDescriptionProperties('', false, [])
      }
    },

    CommitChanges () {
      if (this.Category !== '' &&
        this.TrimmedEditableItem !== '' &&
        (this.Description.Title === '' || (this.Description.Title !== '' && this.Description.Value.length > 0))
      ) {
        const temporaryItem = {}
        const descriptionValue = this.Description.Value.filter(item => item[item.length - 1] !== '$')

        temporaryItem.Text = this.TrimmedEditableItem

        if (this.IsItemEdited) {
          this.SetCandidateItemsByFreeword()
          if (this.CandidateItems.length !== 0 && Popups.confirm('候補術式名があります,選択を優先してください.') === false) return
          if (Popups.confirm('直接入力した術式の登録は可能な限り控えてください.') === false) return

          // ユーザ手入力の場合は選択が掛かっていないので最低限の情報のみかつフラグを必ず立てる
          temporaryItem.Chain = [this.Category]
          temporaryItem.UserTyped = true
        } else {
          if (this.TargetOrgan === undefined) {
            Popups.alert('選択操作でのみ登録が可能です.')
            return
          }
          // 選択されたものには適切な付随情報を収納
          temporaryItem.Chain = [this.Category, this.TargetOrgan]

          const dittos = ProcedureTree.getDittos(ProceduresTree.getItemByName(...temporaryItem.Chain, temporaryItem.Text))
          if (dittos) {
            temporaryItem.Ditto = Object.assign([], dittos)
          }

          if (this.Description.AdditionalProcedureTitle !== '') {
            if (descriptionValue.length > 0) {
              temporaryItem.AdditionalProcedure = {
                Text: this.Description.AdditionalProcedureTitle,
                Description: descriptionValue
              }
            }
          } else {
            if (this.Description.Title !== '') {
              if (descriptionValue.length > 0) {
                temporaryItem.Description = descriptionValue
              } else {
                return
              }
            }
          }
        }
        this.$emit('data-upsert', 'Procedures', this.ItemIndex, temporaryItem)
        this.GoBack()
      }
    }
  }
}
</script>
