<template>
  <div class="setting-section">
    <div class="title-section">パスワード認証の設定</div>
    <div class="subtitle-section"><span>アプリケーション開始時の認証設定</span></div>
    <InputSwitchField
      v-model="UseAuthentication"
      title="起動時のパスワード確認"
      :options="{'しない': false, 'する': true}" />

    <InputPasswordField
      v-model.lazy="PasswordString"
      title="現在のパスワード"
      placeholder="********"
      :required="true"
      v-if="$store.getters['password/isPasswordRequired']" />

    <InputPasswordField
      v-model.lazy="NewPasswordString"
      title="新しいパスワード"
      placeholder="********"
      :required="true"
      v-if="UseAuthentication" />
    <InputPasswordField
      v-model.lazy="NewPasswordStringVerify"
      title="新しいパスワード(確認)"
      placeholder=" ********"
      :required="true"
      v-if="UseAuthentication" />
    <div>
      <el-button type="primary" @click="CommitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputPasswordField from '@/components/Molecules/InputPasswordField'
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import Popups from '@/modules/Popups'

export default {
  name: 'SettingOfAuthentication',
  components: {
    InputPasswordField, InputSwitchField
  },
  data () {
    return ({
      UseAuthentication: this.$store.getters['password/isPasswordRequired'],
      PasswordString: '',
      NewPasswordString: '',
      NewPasswordStringVerify: ''
    })
  },
  methods: {
    CommitSettings () {
      if (this.$store.getters['password/isPasswordRequired']) {
        this.$store.dispatch('password/Authenticate',
          { PasswordString: this.PasswordString, SuppressStateChange: true })
          .then(() => {
            let newPassword = ''
            if (this.UseAuthentication === true) {
              if (this.NewPasswordString.length >= 5 && this.NewPasswordString === this.NewPasswordStringVerify) {
                newPassword = this.NewPasswordString
              } else {
                Popups.alert('新しいパスワードが確認できません.パスワードは5文字以上で設定してください.')
                return
              }
            }

            this.$store.dispatch('password/SetPassword', newPassword).then(() => {
              Popups.alert('認証設定が変更されました.')
            })
          })
          .catch(() => Popups.alert('パスワードが違うので設定変更できません.'))
      } else {
        let newPassword = ''
        if (this.UseAuthentication === true) {
          if (this.NewPasswordString.length >= 5 && this.NewPasswordString === this.NewPasswordStringVerify) {
            newPassword = this.NewPasswordString
          } else {
            Popups.alert('新しいパスワードが確認できません.パスワードは5文字以上で設定してください.')
            return
          }

          this.$store.dispatch('password/SetPassword', newPassword).then(() => {
            Popups.alert('認証設定が変更されました.')
          })
        }
      }
    }
  }
}
</script>
