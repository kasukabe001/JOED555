<template>
  <div class="setting-section">
    <div class="title-section">施設の設定</div>
    <InputTextField
      v-model="InstitutionName"
      title="施設名"
      placeholder=" 未設定 "
      :required="true" />
    <InputTextField
      v-model="InstitutionID"
      title="施設ID"
      placeholder=" 未設定 "
      :required="true" />
    <div>
      <el-button type="primary" @click="ListInstitutes" :disabled="InstitutionName === '' || InstitutionID !== ''">施設名から検索</el-button>
    </div>
    <el-collapse-transition>
      <div v-if="InstituteListView">
        <el-table
          :data="InstituteList"
          @row-click="SetInstituteProperties"
          height="300"
          style="width: 80%; border-radius: 5px;"
          v-loading="InstituteListLoading"
          >
          <el-table-column
            label="所在"
            prop="Prefecture"
            width="100"
          />
          <el-table-column
            label="施設名"
            prop="name"
          />
          <el-table-column
            label="施設ID"
            prop="ID"
            width="100"
          />
        </el-table>
      </div>
    </el-collapse-transition>
    <InputTextField
      v-model="JSOGoncologyboardID"
      title="日産婦の腫瘍登録施設番号"
      placeholder="設定なし" />
    <div>
      <el-button type="primary" @click="CommitSettings" :disabled="!Validation">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputTextField from '@/components/Molecules/InputTextField'
import Popups from '@/modules/serve/Popups'

export default {
  name: 'SettingOfInstutute',
  components: {
    InputTextField
  },
  data () {
    return ({
      InstitutionName: '',
      InstitutionID: '',
      JSOGoncologyboardID: '',
      InstituteList: [],
      InstituteListView: false,
      InstituteListLoading: true
    })
  },
  created () {
    const self = this

    this.$store.dispatch('system/LoadPreferences').then(_ => {
      const settings = self.$store.getters['system/GetInstitutionInformation']
      self.InstitutionName = settings.InstitutionName
      self.InstitutionID = settings.InstitutionID
      self.JSOGoncologyboardID = settings.JSOGoncologyboardID
    })
  },
  watch: {
    InstituteList: { handler: _ => {}, deep: true }
  },
  computed: {
    Validation () {
      return this.InstitutionName.trim() !== '' && this.InstitutionID.match(/[0-9]{5}/) !== null
    }
  },
  methods: {
    ListInstitutes () {
      this.InstituteList.splice(0)

      if (this.InstitutionName.trim() === '') return

      const [, search, , , pref] = /([^@＠]+)(([@＠](.+))|)/.exec(this.InstitutionName.trim())

      if (search === '') return

      this.InstituteListView = true
      this.InstituteListLoading = true

      import('@/modules/InstituteList').then((list) => {
        let prefecturesMatch = ''
        if (pref) {
          const matched = []
          for (const index in list.ListOfPrefectures) {
            if (list.ListOfPrefectures[index].match(pref)) {
              matched.push(('0' + (Number(index) + 1).toString(10)).slice(-2))
            }
          }
          if (matched.length > 0) {
            prefecturesMatch = '^(' + matched.join('|') + ')'
          }
        }

        const filterdItems = list.ListOfInstitutions.filter(item => {
          if (!prefecturesMatch || item.ID.match(prefecturesMatch)) {
            return !!item.name.match(search)
          }
          return false
        })

        if (filterdItems.length > 0) {
          this.InstituteList.splice(0, 0, ...filterdItems.map(item => {
            item.Prefecture = list.ListOfPrefectures[Number(item.ID.substr(0, 2)) - 1]
            return item
          }))
        }

        this.InstituteListLoading = false
      })
    },

    SetInstituteProperties (instituteProperties) {
      this.InstitutionName = instituteProperties.name
      this.InstitutionID = instituteProperties.ID

      this.InstituteListView = false
    },

    CommitSettings () {
      if (this.InstitutionName !== '' && this.InstitutionID !== '') {
        if (this.InstitutionID.match(/^\d{5}$/g) !== null) {
          this.$store.commit('system/SetPreferences',
            {
              InstitutionName: this.InstitutionName,
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
