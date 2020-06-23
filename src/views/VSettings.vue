<template>
  <div>
    <el-tabs>
      <el-tab-pane label="施設情報の設定">
        <SettingOfInstutute></SettingOfInstutute>
      </el-tab-pane>
      <el-tab-pane label="アプリケーションの設定">
        <SettingOfApplication></SettingOfApplication>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SettingOfInstutute from '@/components/SettingOfInstitute'
import SettingOfApplication from '@/components/SettingOfApplication'

export default {
  name: 'ViewSettings',
  components: {
    SettingOfInstutute, SettingOfApplication
  },
  data () {
    return ({
    })
  }
}
</script>
