<script>
export default {
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
    },
    year: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      Category: '',
      TargetOrgan: '',
      SelectedItem: '',
      EditableItem: '',
      ExpandEditsection: false
    }
  },
  mounted () {
    this.ExpandEditsection = (this.ItemValue && this.ItemValue.UserTyped === true)
  },
  computed: {
    UserEditingAllowed () {
      return !!this.Category && !this.SelectedItem
    },

    TrimmedEditableItem () {
      const enteredValue = this.EditableItem.toString().replace(/^[\s|\u3000]+$/g, '')
      return enteredValue
    },

    IsReadyToCommit () {
      return (this.TrimmedEditableItem !== '')
    },

    IsItemEdited () {
      return this.SelectedItem !== this.EditableItem
    }
  },
  methods: {
    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    },

    ToggleEditsection () {
      this.ExpandEditsection = !this.ExpandEditsection || (this.ItemValue.UserTyped === true) || this.IsItemEdited
    },
    GoBack () {
      this.$router.go(-1)
    },

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

    SubmitOnEnterkey (event) {
      if (event.keyCode === 13) {
        this.CommitChanges()
      }
    }
  }
}
</script>
