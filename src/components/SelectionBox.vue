<template>
  <div class="selectionbox">
    <div class="subtitle-section">{{title}}</div>
    <select v-model="value" :size="size" :multi="multi" @event="EventHandler">
      <slot name="options"></slot>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectionBox',
  props: {
    title: {
      type: String,
      default: 'TITLE'
    },
    size: {
      type: [String, Number],
      default: 1
    },
    value: {},
    multi: {
      default: false
    }
  },
  computed: {
    ComponentValue: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('update', value)
      }
    }
  },
  methods: {
    EventHandler (event) {
      this.$emit(event)
    }
  }
}
</script>
