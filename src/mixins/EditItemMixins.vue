<script>
export default {
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
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
    this.ExpandEditsection = (this.ItemValue.UserTyped === true)
  },
  computed: {
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
    ToggleEditsection () {
      this.ExpandEditsection = !this.ExpandEditsection || (this.ItemValue.UserTyped === true) || this.IsItemEdited
    },
    GoBack () {
      this.$router.go(-1)
    },

    SubmitOnEnterkey (event) {
      if (event.keyCode === 13) {
        this.CommitChanges()
      }
    }
  }
}
</script>
