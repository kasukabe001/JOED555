<template>
  <div class="thewrapper" :style="Style" @click="Click">
  <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'TheWrapper',
  props: {
    alpha: {
      type: [String, Number],
      validator (val) {
        return val >= 0 && val <= 100
      },
      default: 0
    }
  },
  computed: {
    Style () {
      return 'background-color: rgba(0,0,0,' + this.alpha / 100 + ')'
    }
  },
  methods: {
    Click (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style lang="sass">
div.thewrapper
  position: fixed
  z-index: +1000
  left: 0
  top: 0
  right: 0
  bottom: 0
</style>
