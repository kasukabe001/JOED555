<template>
  <div class="casecategory" :class="BadgedClass" :style="BoxColor"></div>
</template>

<script>
export default {
  name: 'CaseCategoryIdentifier',
  props: {
    category: {
      type: String,
      required: true
    },
    notification: {
      default: false
    }
  },
  computed: {
    BoxColor () {
      const colorTable = {
        腹腔鏡: '#8CF700',
        腹腔鏡悪性: '#8CF700',
        ロボット: '#00F063',
        ロボット悪性: '#00F063',
        子宮鏡: '#00BBFF',
        卵管鏡: '#FFD000'
      }
      return this.notification
        ? { backgroundColor: colorTable[this.category] }
        : {
          backgroundColor: colorTable[this.category],
          'border-color': 'var(--color-warning)'
        }
    },
    BadgedClass () {
      switch (this.category) {
        case '腹腔鏡悪性':
        case 'ロボット悪性':
          return 'badged'
        default:
          return ''
      }
    }
  }
}
</script>

<style lang='sass'>
div.casecategory
  position: relative
  border: var(--color-primary) 2px solid
  margin: auto
  width: 1.7rem
  height: 1.7rem

div.badged::after
  position: absolute
  content: ""
  background: transparent
  right: 0
  bottom: 0
  width: 0
  height: 0
  border-top: 0.45rem solid transparent
  border-left: 0.45rem solid transparent
  border-right: 0.45rem solid var(--color-danger)
  border-bottom: 0.45rem solid var(--color-danger)
</style>
