<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field">
      <input type="text"
        v-model="InputText"
        :placeholder="placeholder"
        :class="RequiredClass"
        @keyup.13="$emit('enter')"
        :disabled="disabled"/>
    </div>
</div>
</template>

<script>
export default {
  name: 'InputTextField',
  props: {
    value: {
      required: true
    },
    title: {
      default: 'TEXT FIELD'
    },
    placeholder: {
      default: ''
    },
    required: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    RequiredClass () {
      return (this.required === true && this.value === '') ? 'vacant' : ''
    },
    InputText: {
      get () { return this.value },
      set (newvalue) {
        this.$emit('input', newvalue)
      }
    }
  }
}
</script>
