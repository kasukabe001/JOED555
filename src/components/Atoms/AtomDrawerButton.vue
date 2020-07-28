<template>
    <div :class="DivClass" class="open-drawer-button" :tabindex="TabIndex" @click="onClick">
    </div>
</template>

<script>
export default {
  name: 'DrawerButton',
  props: {
    DivClass: {
      type: String
    },
    TabIndex: {
      type: String, Number
    }
  },
  methods: {
    onClick (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style lang="sass">
div.open-drawer-button
  position: absolute
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  &::after
    content: '\e798'
    color: var(--color-primary)
    font-family: 'element-icons'
    font-size: 25px
    padding-top: 6px
    padding-left: 3px
  &:hover
    &::after
      color: var(--color-text-regular)
</style>
