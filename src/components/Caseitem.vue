<template>
  <div class="caseitem" @dblclick="MoveToEditView()">
    <CaseCategoryIdentifier :category="CaseCategory"></CaseCategoryIdentifier>
    <div class="caseitem-description">
      <div class="caseitem-row">
        <span class="w20"> {{CaseDate}} </span>
        <span class="w20"> {{CasePersonalInformation.Id}} </span>
        <span class="w40 truncatable"> {{CasePersonalInformation.Name}} </span>
        <span class="w20"> ( {{CasePersonalInformation.Age}}歳 ) </span>
      </div>
      <div class="caseitem-row">
        <span class="w40 truncatable"> {{CaseDiagnosis}} </span>
        <span class="w40 truncatable"> {{CaseProcedure}} </span>
        <span class="w20" :class="CaseNotification?'caution-badge':''"> {{CaseNotification}} </span>
      </div>
    </div>
    <div class="caseitem-controller">
        <i class="el-icon-edit button-font" @click="MoveToEditView()"></i>
    </div>
  </div>
</template>

<script>
import CaseCategoryIdentifier from '@/components/Atoms/AtomCaseCategoryIdentifier'
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
    return {}
  },
  computed: {
    $ItemDocument () {
      return this.$store.getters.GetItemObject(this.uid)
    },
    CaseCategory () {
      return this.$ItemDocument.TypeOfProcedure
    },
    CaseDate () {
      return this.$ItemDocument.DateOfProcedure
    },
    CasePersonalInformation () {
      return {
        Id: this.$ItemDocument.InstitutionalPatientId,
        Name: this.$ItemDocument.Name,
        Age: this.$ItemDocument.Age
      }
    },
    CaseDiagnosis () {
      return DbItems.getItemValue(this.$ItemDocument.Diagnoses[0])
    },
    CaseProcedure () {
      return DbItems.getItemValue(this.$ItemDocument.Procedures[0])
    },
    CaseNotification () {
      return this.$ItemDocument.PresentAE ? '合併症あり' : ''
    }
  },
  methods: {
    MoveToEditView () {
      this.$router.push({ name: 'edit', params: { uid: this.uid } })
    }
  },
  components: {
    CaseCategoryIdentifier
  }
}
</script>

<style lang="sass">
div.caseitem
  position: relative
  width: 900px
  height: 60px
  border: black 1px solid
  background-color: white
  margin-left: 39px
  margin-top: 9px
  display: flex
  justify-content: space-between
  div.caseitem-description
    width: 700px
    display: flex
    flex-direction: column
    justify-content: space-around
    div.caseitem-row
      display: flex
      flex-direction: row
      justify-content: space-between
  div.caseitem-controller
    width: 80px
    padding-left: 16px
    padding-right: 16px
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
</style>
