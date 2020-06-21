<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field number">
      <el-input-number
        v-model="InputText"
        controls-position="right"
        size="mini"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        @change="HandleRequired()"
        />
    </div>
</div>
</template>

<script>
export default {
  name: 'InputNumberField',
  props: {
    value: {
      type: [Number, String]
    },
    title: {
      default: 'NUMBER FIELD'
    },
    placeholder: {
      default: ''
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    required: {
      default: false
    }
  },
  mounted () {
    this.HandleRequired()
  },
  computed: {
    InputText: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  },
  methods: {
    HandleRequired () {
      if (this.required === false) return

      const inputElement = this.$el.getElementsByClassName('el-input__inner')[0]
      if (this.value === undefined) {
        inputElement.classList.add('vacant')
      } else {
        inputElement.classList.remove('vacant')
      }
      this.$nextTick()
    }
  }
}
</script>
