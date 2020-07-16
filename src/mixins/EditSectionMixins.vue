<script>
import draggable from 'vuedraggable'
import ItemOfSection from '@/components/ItemOfEditSection'

export default {
  components:
  {
    draggable, ItemOfSection
  },
  props: {
    container: {
      type: Array,
      required: true
    },
    optionValue: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ItemContainer: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('update:container', value)
      }
    },
    ItemOption: {
      get () {
        return this.optionValue
      },
      set (value) {
        this.$emit('update:optionValue', value)
      }
    }
  },
  methods: {
    AddNewItem () {
      this.$emit('addnewitem')
    },
    EditItem (index, item) {
      this.$emit('edititem',
        {
          ItemIndex: index,
          ItemValue: item
        })
    },
    RemoveItem (index) {
      if (index >= 0) {
        this.$emit('removeitem', index)
      }
    }
  }
}
</script>
