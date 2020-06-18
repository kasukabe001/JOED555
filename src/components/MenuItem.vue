<template>
  <div>
    <div id="menuitem" :class="Expanded?'expanded':''" @click="Expand()"><slot>{{Title}}</slot></div>
    <div v-if="Expanded">
      <div>
        Here comes menu items.
      </div>
      <div class="outerboxoverlay" @click="UnExpand()"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    Title: {
      type: String,
      default: ''
    }
  },
  data () {
    return ({
      Expanded: false
    })
  },
  methods: {
    Expand () {
      this.Expanded = true
    },
    UnExpand () {
      this.Expanded = false
    }
  }
}
</script>

<style lang="sass" scoped>
div.outerboxoverlay
  position: absolute
  z-index: 98
  top: 0
  left: 0
  right: 0
  bottom: 0
  opacity: 0
div.menuitem
  z-index: 99

</style>
