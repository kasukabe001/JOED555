<template>
  <div class="casecategory" :class="NotificationClass" :style="BoxColorStyle">
    <div :class="MalignancyClass"></div>
  </div>
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
    BoxColorStyle () {
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
    NotificationClass () {
      return this.notification ? 'has-notification' : ''
    },
    MalignancyClass () {
      switch (this.category) {
        case '腹腔鏡悪性':
        case 'ロボット悪性':
          return 'category-malignancy'
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

div.has-notification::after
  position: absolute
  content: ""
  background: transparent
  left: 0
  top: 0
  width: 0
  height: 0
  border-top: 0.38rem solid var(--color-warning)
  border-left: 0.38rem solid var(--color-warning)
  border-right: 0.38rem solid transparent
  border-bottom: 0.38rem solid transparent

div.category-malignancy::after
  position: absolute
  content: ""
  background: transparent
  right: 0
  bottom: 0
  width: 0
  height: 0
  border-top: 0.38rem solid transparent
  border-left: 0.38rem solid transparent
  border-right: 0.38rem solid var(--color-danger)
  border-bottom: 0.38rem solid var(--color-danger)
</style>
