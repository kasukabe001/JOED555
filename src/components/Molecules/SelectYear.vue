<template>
  <div>
    <select v-model="SelectedValue" v-loading="loadingSelections" @click="onClickSelection()">
      <option v-for="(value, name) of Selections" :key="value" :value="name">{{name}}年 ({{value}}件)</option>
      <option value="">すべて</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectYear',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    value: { required: true }
  },
  data () {
    return ({
      Selections: {},
      loadingSelections: false
    })
  },
  computed: {
    SelectedValue: {
      get () { return this.value },
      set (newvalue) { this.$emit('update', newvalue) }
    }
  },
  methods: {
    onClickSelection () {
      this.loadingSelections = true
      if (Object.keys(this.Selections).length === 0) {
        this.$store.dispatch('GetYears').then((CountByYear) => {
          Object.assign(this.Selections, CountByYear)
          this.loadingSelections = false
        })
      }
    }
  }
}
</script>
