<template>
  <div class="menu-item">
    <div class="subtilte-section">検索対象</div>
    <div class="menu-item-content">
      <div>
        <div>
          <select v-model="Field" @change="changeSelection">
            <option value="" disabled style="display: none;">検索する項目を選択してください.</option>
            <option value="Id">患者ID</option>
            <option value="Name">患者名</option>
            <option value="Procedures">手術診断</option>
            <option value="Diagnoses">実施手術</option>
            <option value="UID">問い合わせ番号</option>
          </select>
        </div>
      </div>
    </div>
    <div class="subtilte-section">検索内容</div>
    <div class="menu-item-content">
      <input type="text" v-model="SearchString" />
    </div>
    <div>
      <InputSwitchField
        v-model="UseRegexp"
        title=""
        :options="{ 部分一致: false, 正規表現: true }"
        :disabled="RegexpDisabled"
      />
    </div>
    <div class="menu-item-bottom">
      <!-- <el-button type="primary" @click="cancelQuery">検索の解除</el-button> -->
      <el-button type="primary" @click="performQuery">検索</el-button>
    </div>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'

const SearchSetting = {
  Id: {
    regexp: false,
    multiple: true,
    createquery: (query) => {
      const queries = query.split(/[\s,，]+/).map(item => item.replace(/[-ｰー－～]/g, ''))

      if (queries.length > 0) {
        const queryRegex = new RegExp('^(' + queries.join('|') + ')$')
        return {
          $where: function () {
            return this.InstitutionalPatientId
              .replace(/[-ｰー－～]/g, '')
              .match(queryRegex) !== null
          }
        }
      } else {
        return null
      }
    }
  },
  Name: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return { Name: { $regex: queryRegex } }
      } else {
        return { $where: function () { return this.Name.includes(query) } }
      }
    }
  },
  Diagnoses: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return {
          $where: function () {
            return this.Diagnoses
              .filter(item => item.Text.match(queryRegex) !== null)
              .length > 0
          }
        }
      } else {
        return {
          $where: function () {
            return this.Diagnoses
              .filter(item => item.Text.includes(query))
              .length > 0
          }
        }
      }
    }
  },
  Procedures: {
    regexp: true,
    createquery: (query, regexp) => {
      if (regexp) {
        let queryRegex
        try {
          queryRegex = new RegExp(query)
        } catch {
          return null
        }
        return {
          $where: function () {
            return this.Procedures
              .filter(
                item => item.Text.match(queryRegex) !== null ||
                (
                  item.AdditionalProcedure &&
                  item.AdditionalProcedure.Text.match(queryRegex) !== null
                )
              )
              .length > 0
          }
        }
      } else {
        return {
          $where: function () {
            return this.Procedures
              .filter(
                item => item.Text.includes(query) ||
                (
                  item.AdditionalProcedure &&
                  item.AdditionalProcedure.Text.includes(query)
                )
              )
              .length > 0
          }
        }
      }
    }
  },
  UID: {
    regexp: false,
    multiple: true,
    createquery: (query) => {
      const queryRegex = new RegExp(/^20[0-9]{2}-(0[1-9]|[23][0-9]|4[0-7])\d{3}-([0-9]+)$/g)
      let queries = query.split(/[\s,，]+/)

      queries = queries
        .filter(query => query.match(queryRegex) !== null)
        .map(value => Number(value.replace(queryRegex, '$2')))

      if (queries.length > 0) {
        return { SequentialId: { $in: [...queries] } }
      } else {
        return null
      }
    }
  }
}

export default {
  name: 'SearchMenu',
  components: {
    InputSwitchField
  },
  data () {
    return ({
      UseRegexp: false,
      FindMulti: false,
      Field: '',
      SearchString: ''
    })
  },
  computed: {
    RegexpDisabled () {
      return (SearchSetting[this.Field] && SearchSetting[this.Field].regexp !== undefined) ? !SearchSetting[this.Field].regexp : true
    }
  },
  methods: {
    changeSelection () {
      if (SearchSetting[this.Field].regexp === false) {
        this.UseRegexp = undefined
      }
    },
    performQuery () {
      if (this.Field && this.SearchString && SearchSetting[this.Field]) {
        const query = SearchSetting[this.Field].createquery(this.SearchString, this.UseRegexp)
        if (query) {
          this.$emit('commit', {
            noPreserve: true,
            Filter: [{
              Field: Object.keys(query)[0],
              Value: query[Object.keys(query)[0]]
            }]
          })
        } else {
          console.log('creating query failed.')
        }
      }
    },
    cancelQuery () {
      this.$emit('commit', {
        noPreserve: true,
        Filter: [...this.$store.state.preservedViewSettings.Filter]
      })
    }
  }
}
</script>
