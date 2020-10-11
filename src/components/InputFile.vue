<template>
  <div style="display: inline-block;">
    <input type="file" ref="inputfile" style="display: none;" :accept="AcceptFileTypes" @change="SelectionMade" />
    <el-button type="primary" @click="OpenFileDialog" :disabled="disabled">{{ButtonText}}</el-button>
  </div>
</template>

<script>
export default {
  name: 'InputFile',
  props: {
    ButtonText: {
      default: 'ファイルを指定'
    },
    AcceptFileTypes: {
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    OpenFileDialog () {
      this.$refs.inputfile.click()
    },
    SelectionMade (event) {
      const files = event.target.files || event.dataTransfer.files
      const reader = new FileReader()
      const self = this
      reader.onload = function () {
        const encoding = require('encoding-japanese')
        const readerarray = new Uint8Array(reader.result)
        const readencoding = encoding.detect(readerarray)
        const unicodetext = encoding.convert(readerarray, {
          to: 'UNICODE',
          from: readencoding === 'UNICODE' ? 'UTF8' : readencoding,
          type: 'string'
        })
        console.log(unicodetext)
        self.$emit('change', unicodetext)
      }
      reader.readAsArrayBuffer(files[0])
    }
  }
}
</script>
