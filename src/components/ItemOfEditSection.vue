<template>
  <div class="section-item">
    <i class="handle el-icon-d-caret" v-if="draggable"></i>
    <slot :item="item">
      <span>{{Title}}</span>
      <span v-if="Description !== ''">
        ( {{Description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="EnterEditItem()" v-if="RequireEditing" />
    <i class="remove-button el-icon-delete" @click="onClick()" />
  </div>
</template>

<script>
import DbItems from '@/modules/DbItemHandler'

export default {
  name: 'ItemOfSection',
  props: {
    item: {
      type: Object,
      required: true
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    Title () {
      return DbItems.getItemValue(this.item)
    },
    Description () {
      if (this.item.Description) {
        return (this.item.Description.length > 1)
          ? [...this.item.Description].join(', ')
          : this.item.Description[0]
      }
      return ''
    },
    RequireEditing () {
      return this.item.UserTyped === true
    }
  },
  methods: {
    onClick () {
      this.$emit('remove')
    },
    EnterEditItem () {
      this.$emit('edit')
    }
  }
}
</script>
