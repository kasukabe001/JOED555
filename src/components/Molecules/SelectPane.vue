<template>
  <div>
    <div class="subtitle-section">{{title}}</div>
    <select ref="SelectPane" :size="lines"
      v-model="PaneValue"
      @change="Change()"
      @dblckick="DblClick()">
      <option v-if="items.length===0" disabled :value="null"/>
      <option v-for="(item,key,index) in items"
        :key="index"
        :value="item">
        {{item}}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectPane',
  model: {
    prop: 'value',
    event: 'change-selection'
  },
  props: {
    value: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: '項目'
    },
    items: {
      type: Array,
      default: () => [],
      required: true
    },
    lines: {
      type: [String, Number],
      default: 8
    }
  },
  computed: {
    PaneValue: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('change-selection', value)
      }
    }
  },
  methods: {
    Change (value) {
      this.$emit('change', value)
    },
    DblCkick (value) {
      this.$emit('dblckick', value)
    },
    Clear () {
      this.$refs.SelectPane.selectIndex = -1
    }
  }
}
</script>
