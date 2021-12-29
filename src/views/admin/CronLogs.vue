<template>
  <PageCard name="计划任务日志">
    <v-card>
      <v-card-title>
        <v-form ref="form">
          <v-container class="d-flex flex-wrap">
            <v-select
              :items="projectNames"
              label="项目名称"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="cronLogsForm.projectNames"
              @blur="projectNameBlur(cronLogsForm)"
            >
            </v-select>
            <v-select
              :items="branchNames"
              label="分支名称"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="cronLogsForm.branchNames"
              @blur="cronLogsSearch()"
            >
            </v-select>
            <v-select
              :items="statusesList"
              label="状态"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="cronLogsForm.statuses"
              @blur="cronLogsSearch()"
            >
            </v-select>
            <template>
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="dateRangeText"
                    label="时间"
                    prepend-icon="mdi-calendar"
                    readonly
                    dense
                    class="mr-8"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="dates"
                  range
                  no-title
                  @change="dateRangeSubmit()"
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    small
                    @click="clearDates()"
                  >
                    清空
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </template>
          </v-container>
        </v-form>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="cronLogsHeaders"
          :items="cronLogsData.cronLogs"
          :page="cronLogsForm.page"
          :items-per-page="cronLogsForm.perPage"
          :server-items-length="cronLogsData.totalCount"
          item-key="index"
          show-expand
          :footer-props="{
            showCurrentPage: true,
            itemsPerPageOptions: [ 5, 10, 15, 20 ]
          }"
          :loading="tableLoading"
          @update:options="changeOptions($event)"
          >
          <template v-slot:item.status="{ item }">
            <v-chip small v-if="item.status == 'INFO'" color="primary">
              {{ item.status }}
            </v-chip>
            <v-chip small v-else color="error">
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-1 commits-table">
              <Monaco
                ref="monaco"
                :monacoOptions="{
                  value: item.msg,
                  automaticLayout:true,
                  readOnly: true, // 是否只读
                  theme: "vs-dark", // 编辑器主题
                  language: "yaml"
                }"
                :height="500"
              ></Monaco>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </PageCard>
</template>

<script>
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import Operations from '@/lib/ui-lib/components/Operations'
import request from '@/utils/request'
import Monaco from "@/lib/monaco/Monaco";
export default {
  name: 'CronLogs',
  components: {
    PageCard,
    Operations,
    Monaco
  },
  inject: ['successTip', 'errorTip', 'warnTip'],
  data () {
    return {
      userToken: '',
      cronLogsForm: {
        projectNames: [],
        branchNames: [],
        statuses: [],
        createTimeRage: {
          startDate: '',
          endDate: ''
        },
        page: 1,
        perPage: 10
      },
      cronLogsData: {},
      projectNames: [],
      branchNames: [],
      statusesList: [ 'INFO', 'ERROR' ],
      searchData: {},
      tableLoading: true,
      cronLogsHeaders:[
        { text: '项目名称', value: 'projectName', sortable: false },
        { text: '分支名称', value: 'branchName', sortable: false },
        { text: '计划任务名称', value: 'crontabName', sortable: false },
        { text: '状态', value: 'status', sortable: false },
        { text: '时间', value: 'createTime', sortable: false },
      ],
      dates: [],
      menu: false
    }
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    vm.getList()
    request.get('metrics/runs/options').then(response => {
      vm.searchData = response.data
      vm.projectNames = response.data.projectNames
      vm.branchNames = response.data.branchNames
      vm.projects = response.data.projects
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
    })
  },
  methods: {
    getList () {
      const vm = this
      vm.tableLoading = true
      request.post('admin/cronLogs', vm.cronLogsForm).then(response => {
        response.data.cronLogs.forEach((row, index) => {
          row.index = index
        })
        vm.cronLogsData = response.data
        vm.tableLoading = false
      }).catch(error => {
        vm.tableLoading = false
        vm.errorTip(true, error.response.data.msg)
      })
    },
    cronLogsSearch () {
      const vm = this
      vm.tableLoading = true
      var dates = vm.dates.sort()
      vm.cronLogsForm.createTimeRage.startDate = dates[0]
      vm.cronLogsForm.createTimeRage.endDate = dates[1]
      request.post('admin/cronLogs', vm.cronLogsForm).then(response => {
        response.data.cronLogs.forEach((row, index) => {
          row.index = index
        })
        vm.cronLogsData = response.data
        vm.tableLoading = false
        vm.successTip(true, response.msg)
      }).catch(error => {
        vm.tableLoading = false
        vm.errorTip(true, error.response.data.msg)
      })
    },
    changeOptions (data) {
      const vm = this
      vm.cronLogsForm.page = data.page
      vm.cronLogsForm.perPage = data.itemsPerPage
      vm.getList()
    },
    clearDates () {
      this.dates = []
      this.menu = false
      this.cronLogsSearch()
    },
    dateRangeSubmit () {
      this.menu = false
      this.cronLogsSearch()
    },
    projectNameBlur (cronLogsForm) {
      const vm = this
      if(cronLogsForm.projectNames.length >0){
        var newBranchNames = []
        cronLogsForm.projectNames.forEach(item => {
          vm.searchData.projects.map(i => {
            if(i.projectName == item){
              newBranchNames.push(...i.branchNames)
              vm.branchNames = [... new Set(newBranchNames)]
            }
          })
        })
      }else{
        vm.branchNames = vm.searchData.branchNames
      }
      vm.cronLogsSearch()
    },
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  }
}
</script>

<style>
.commits-table .CodeMirror {
  height: auto;
}
.commits-table .CodeMirror-scroll {
  height: auto;
  overflow-y: hidden;
  overflow-x: auto;
}
</style>
<style lang="scss" scoped>

</style>
