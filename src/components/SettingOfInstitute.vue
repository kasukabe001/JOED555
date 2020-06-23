<template>
  <div class="setting-section">
    <div class="title-section">施設の設定</div>
    <InputTextField
      v-model="Name"
      title="施設名"
      placeholder=" 未設定 "
      :required="true" />
    <InputTextField
      v-model="InstitutionID"
      title="施設ID"
      placeholder=" 未設定 "
      :required="true" />
    <div>
      <el-button type="primary">施設名から検索してIDを設定</el-button>
    </div>
    <InputTextField
      v-model="JSOGoncologyboardID"
      title="日産婦の腫瘍登録施設番号"
      placeholder="設定なし" />
    <div>
      <el-button type="primary" @click="CommitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputTextField from '@/components/Molecules/InputTextField'
import Popups from '@/modules/Popups'

export default {
  name: 'SettingOfInstutute',
  components: {
    InputTextField
  },
  data () {
    return ({
      Name: '',
      InstitutionID: '',
      JSOGoncologyboardID: ''
    })
  },
  created () {
    const self = this

    this.$store.dispatch('system/LoadPreferences').then(_ => {
      const settings = self.$store.getters['system/GetInstitutionInformation']
      self.Name = settings.Name
      self.InstitutionID = settings.InstitutionID
      self.JSOGoncologyboardID = settings.JSOGoncologyboardID
    })
  },
  methods: {
    CommitSettings () {
      if (this.Name !== '' && this.InstitutionID !== '') {
        if (this.InstitutionID.match(/^\d{5}$/g) !== null) {
          this.$store.commit('system/SetPreferences',
            {
              InstitutionName: this.Name,
              InstitutionID: this.InstitutionID,
              JSOGoncologyboardID: this.JSOGoncologyboardID
            })
          this.$store.dispatch('system/SavePreferences')
        } else {
          Popups.alert('施設IDは5桁の数字です.')
        }
      }
    }
  }
}
</script>
