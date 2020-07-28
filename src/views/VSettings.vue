<template>
  <div>
    <el-tabs>
      <el-tab-pane label="施設情報の設定">
        <SettingOfInstutute></SettingOfInstutute>
      </el-tab-pane>
      <el-tab-pane label="パスワード認証の設定">
        <SettingOfAuthentication></SettingOfAuthentication>
      </el-tab-pane>
      <el-tab-pane label="表示の設定">
        <SettingOfView></SettingOfView>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SettingOfInstutute from '@/components/SettingOfInstitute'
import SettingOfAuthentication from '@/components/SettingOfAuthentication'
import SettingOfView from '@/components/SettingOfView'

export default {
  name: 'ViewSettings',
  components: {
    SettingOfInstutute, SettingOfAuthentication, SettingOfView
  },
  data () {
    return ({
    })
  }
}
</script>
