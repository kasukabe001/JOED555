<template>
  <div class="app-dialog-row w600p">
    <div class="w30" id="auth-logo">
      <img src="@/assets/JOED5logo.png" alt="[JOED5]">
    </div>
    <div class="w70" id="auth">
      <div class="title-section">JOED version 5DEV</div>

      <div>
        <label>
          パスワード :
          <el-badge value="パスワードが違います" :hidden="!LoginFailed">
            <input type="password" v-model="Password" id="password-entry-box" :disabled="AuthenticationFree" />
          </el-badge>
        </label>
      </div>

      <div>
          <input type="button" style="float: right" value="ログイン" @click="PerformAuthentication" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewLogin',
  data () {
    return ({
      Password: '',
      LoginFailed: false,
      AuthenticationFree: false
    })
  },
  created () {
    // 認証が設定されていない場合は無条件で認証済みとなる仕様を利用してパスワード認証が必要かを確認
    this.$store.dispatch('password/Authenticate', '')
      .then(() => { this.AuthenticationFree = true })
  },
  methods: {
    PerformAuthentication () {
      this.$store.dispatch('password/Authenticate', this.Password)
        .then(() => this.$router.push({ name: 'list' }))
        .catch(() => { this.LoginFailed = true })
    }
  }
}
</script>

<style lang="sass">
#auth-logo
  display: flex
  flex-direction: row
  justify-content: space-around
  img
    width: 100px
    height: 100px
    padding: 10px
#auth
  display: flex
  flex-direction: column
  justify-content: space-around
  margin: 0 3rem
</style>
