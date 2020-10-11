<template>
  <div class="caseitem" :id="'case-'+uid" tabindex="0" @dblclick="MoveToEditView()">
    <div class="caseitem-icon">
      <CategoryIdentifier :category="Category"></CategoryIdentifier>
    </div>
    <div class="caseitem-description">
      <div class="caseitem-row">
        <span class="w20"> {{DateOfProcedure}} </span>
        <span class="w20"> {{PersonalInformation.Id}} </span>
        <span class="w30 truncatable"> {{PersonalInformation.Name}} </span>
        <span class="w10"> ( {{PersonalInformation.Age}}歳 ) </span>
        <span class="w20"></span>
      </div>
      <div class="caseitem-row">
        <span class="w40 truncatable"> {{Diagnosis}} </span>
        <span class="w40 truncatable"> {{Procedure}} </span>
        <span class="w20" :class="Notification?'caution-badge':''"> {{Notification}} </span>
      </div>
    </div>
    <div class="caseitem-controller">
        <i class="el-icon-edit button-font" @click="MoveToEditView()"></i>
    </div>
    <div class="caseitem-loading" v-if="Loading"><i class="el-icon-loading"></i></div>
  </div>
</template>

<script>
import CategoryIdentifier from '@/components/Atoms/AtomCaseCategoryIdentifier'
import DbItems from '@/modules/DbItemHandler'

export default {
  name: 'Caseitem',
  props: {
    uid: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      Loading: false,
      Item: {}
    }
  },
  computed: {
    ItemDocument () {
      return this.$store.getters.GetItemObject(this.uid)
    },
    Category () {
      return this.ItemDocument.TypeOfProcedure
    },
    DateOfProcedure () {
      return this.ItemDocument.DateOfProcedure
    },
    PersonalInformation () {
      return {
        Id: this.ItemDocument.PatientId,
        Name: this.ItemDocument.Name,
        Age: this.ItemDocument.Age
      }
    },
    Diagnosis () {
      return DbItems.getItemValue(this.ItemDocument.Diagnoses[0])
    },
    Procedure () {
      return DbItems.getItemValue(this.ItemDocument.Procedures[0])
    },
    Notification () {
      return this.ItemDocument.PresentAE ? '合併症あり' : ''
    }
  },
  methods: {
    LoadItem () {

    },
    MoveToEditView () {
      if (!this.Loading) {
        this.$router.push({ name: 'edit', params: { uid: this.uid } })
      }
    }
  },
  components: {
    CategoryIdentifier
  }
}
</script>

<style lang="sass">
div.caseitem
  position: relative
  width: 800px
  height: 60px
  border: black 1px solid
  border-radius: 1.8px
  background-color: white
  margin-left: 59px
  margin-top: 9px
  display: flex
  flex-direction: row
div.caseitem-icon
  width: 60px
  display: flex
  flex-direction: row
div.caseitem-description
  width: 680px
  display: flex
  flex-direction: column
  justify-content: space-around
  div.caseitem-row
    display: flex
    flex-direction: row
    // justify-content: space-between
div.caseitem-controller
  width: 60px
  display: flex
  flex-direction: column
  justify-content: space-around
  text-align: center
.caution-badge
  border-radius: 10px
  background-color: red
  color: white
  text-align: center
  font-size: 0.9rem
.button-font
  font-size: 1.4rem
div.caseitem-loading
  z-index: +1
  position: absolute
  left: 0
  top: 0
  right: 0
  bottom: 0
  width: 100%
  height: 100%
  margin: auto
  background: rgba(0, 0, 0, 0.33)
</style>
