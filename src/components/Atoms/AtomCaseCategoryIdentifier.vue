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
      return { backgroundColor: colorTable[this.category] }
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
  border: #444444 2px solid
  margin: auto
  width: 31px
  height: 31px

div.badged::after
  position: absolute
  content: ""
  background: transparent
  right: 0
  bottom: 0
  width: 0
  height: 0
  border-top: 0.5rem solid transparent
  border-left: 0.5rem solid transparent
  border-right: 0.5rem solid #FA00A4
  border-bottom: 0.5rem solid #FA00A4
</style>
