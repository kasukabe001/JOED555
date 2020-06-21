<template>
  <div>
    <div class="setting-section">
      <div class="title-section">施設の設定</div>
      <InputTextField
        v-model="Institution.Name"
        title="施設名"
        placeholder=" 未設定 "
        :required="true" />
      <InputTextField
        v-model="Institution.ID"
        title="施設ID"
        placeholder=" 未設定 "
        :required="true" />
      <div>
        <el-button type="primary">施設名から検索してIDを設定</el-button>
      </div>
      <InputTextField
        v-model="Institution.JSOGoncologyboardID"
        title="日産婦の腫瘍登録施設番号" />
    </div>

    <div class="setting-section">
      <div class="title-section">アプリケーションの設定</div>
      <div class="subtitle-section"><span>アプリケーション開始時の認証設定</span></div>
      <InputSwitchField
        v-model="UseAuthentication"
        title="起動時のパスワード確認"
        :options="{'しない': false, 'する': true}" />
      <InputPasswordField
        v-model.lazy="PasswordString"
        title="新しいパスワード"
        placeholder="********"
        :required="true"
        v-if="UseAuthentication" />
      <InputPasswordField
        v-model.lazy="PasswordStringVerify"
        title="新しいパスワード(確認)"
        placeholder=" ********"
        :required="true"
        v-if="PasswordString !== ''" />

    </div>
  </div>
</template>

<script>
import InputTextField from '@/components/Molecules/InputTextField'
import InputPasswordField from '@/components/Molecules/InputPasswordField'
import InputSwitchField from '@/components/Molecules/InputSwitchField'

export default {
  name: 'ViewSettings',
  components: {
    InputTextField, InputPasswordField, InputSwitchField
  },
  data () {
    return ({
      Institution: {
        Name: '',
        ID: '',
        JSOGoncologyboardID: ''
      },
      UseAuthentication: this.$store.state.password.PasswordRequired,
      PasswordString: '',
      PasswordStringVerify: ''
    })
  }
}
</script>
