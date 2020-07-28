<template>
  <div class="setting-section">
    <InputSwitchField
      v-model="DisplayWelcomeMessage"
      title="起動時メッセージを表示する"
      :options="{'しない': false, 'する': true}" />

    <InputSwitchField
      v-model="SaveCurrentListSettingAsDefault"
      title="現在のリスト表示設定を初期設定にする"
      :options="{'しない': false, 'する': true}" />

    <InputSwitchField
      v-model="RevertSystemDefault"
      title="システム初期設定を復元する"
      :options="{'しない': false, 'する': true}" />

    <div>
      <el-button type="primary" @click="CommitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'

export default {
  name: 'SettingOfView',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      DisplayWelcomeMessage: this.$store.getters['system/ShowWelcomeMessage'],
      SaveCurrentListSettingAsDefault: false,
      RevertSystemDefault: false
    })
  },
  methods: {
    CommitSettings () {
      // 現在の設定を初期設定として保存
      if (this.SaveCurrentListSettingAsDefault) {
        // 現在の表示(preserve)を保存
      }
    }
  }
}
</script>
