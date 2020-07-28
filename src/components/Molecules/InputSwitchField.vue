<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field">
      <el-switch
        v-model="SelectedValue"
        :inactive-text="texts[0]"
        :inactive-value="values[0]"
        inactive-color="var(--color-primary)"
        :active-text="texts[1]"
        :active-value="values[1]"
        active-color="var(--color-primary)"
        :disabled="disabled"
      />
    </div>
</div>
</template>

<script>
export default {
  name: 'InputSwitchField',
  props: {
    value: {
      required: true
    },
    title: {
      default: 'SWITCH SELECT'
    },
    options: {
      type: [Array, Object]
    },
    required: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data () {
    return ({
      texts: ['FALSE', 'TRUE'],
      values: [false, true]
    })
  },
  created () {
    if (toString.call(this.options) === '[object Array]') {
      this.texts.splice(0, 2, this.options[0], this.options[1])
      this.values.splice(0, 2, this.options[0], this.options[1])
    }
    if (toString.call(this.options) === '[object Object]') {
      const keys = Object.keys(this.options)
      this.texts.splice(0, 2, keys[0], keys[1])
      this.values.splice(0, 2, this.options[keys[0]], this.options[keys[1]])
    }
  },
  computed: {
    RequiredClass () {
      return (this.required === true && this.value === '') ? 'vacant' : ''
    },
    SelectedValue: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('change', newvalue)
      }
    }
  }
}
</script>
