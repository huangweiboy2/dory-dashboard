<template>
  <PageCard name="webhook触发日志列表">
    <v-card class=" " flat>
      <v-card-title>
        <v-form ref="form">
          <v-container class="d-flex flex-wrap">
            <v-select
              :items="options.projectNames || []"
              label="项目名称"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.projectNames"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="options.branchNames || []"
              label="分支名称"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.branchNames"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="options.stepActions || []"
              label="步骤类型"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.stepActions"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="options.moduleTypes || []"
              label="模块类型"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.moduleTypes"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="[ 'SUCCESS', 'FAIL' ]"
              label="步骤状态"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.stepResults"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="[ 'SUCCESS', 'FAIL' ]"
              label="webhook状态"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.statusResults"
              @blur="getList(true)"
            ></v-select>
            <v-select
              :items="[ 0, 404 ]"
              label="返回状态码"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="webhookForm.statusCodes"
              @blur="getList(true)"
            ></v-select>
            <template>
              <v-menu
                v-model="menu2"
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
      <v-card-title>
        步骤执行记录信息
      </v-card-title>
      <v-card-text class="commits-table">
        <WebhookDataTable
          :steps="pageData.triggerWebhookLogs"
          :server-items-length="pageData.totalCount"
          :loading="tableLoading"
          :footerProps="{
            showCurrentPage: true,
            itemsPerPageOptions: [ 5, 10, 15 ]
          }"
          :expanded.sync="expanded"
          :options="{
            page: webhookForm.page,
            itemsPerPage: webhookForm.perPage
          }"
          @update:options="(value) => {
            webhookForm.page = value.page
            webhookForm.perPage = value.itemsPerPage
            getList(false)
          }"
        />
      </v-card-text>
    </v-card>
  </PageCard>
</template>

<script>
import WebhookDataTable from '@/components/WebhookDataTable'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import request from '@/utils/request'
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'TriggerWebhookLogs',
  components: { WebhookDataTable, PageCard },
  data () {
    return {
      tableLoading: true,
      webhookForm: {
        projectNames: [],
        branchNames: [],
        stepActions: [],
        moduleTypes: [],
        stepResults: [],
        statusResults: [],
        statusCodes: [],
        createTimeRage: {
          startDate: '',
          endDate: ''
        },
        page: 1,
        perPage: 10
      },
      pageData: {
        triggerWebhookLogs: [],
        totalCount: 0
      },
      expanded: [],
      dates:[],
      menu2: false,
      options: {},
    }
  },
  created () {
    const vm = this
    vm.getList(false)
    request.get('/console/triggerWebhookLogOptions').then(response => {
      vm.options = response.data
    }).catch(error => {
      vm.errorTip(true,error.response.data.msg)
    })
  },
  methods: {
    getList (hasTip) {
      const vm = this
      vm.tableLoading = true
      var dates = vm.dates.sort()
      vm.webhookForm.createTimeRage.startDate = dates[0]
      vm.webhookForm.createTimeRage.endDate = dates[1]
      request.post('/console/triggerWebhookLogs', vm.webhookForm).then(response => {
        vm.pageData = response.data
        vm.tableLoading = false
        if(hasTip) {
          vm.successTip(true,response.msg)
        }
        response.data.triggerWebhookLogs.map((item, index) => {
          item.index = index
        })
      }).catch(error => {
        vm.tableLoading = false
        vm.errorTip(true,error.response.data.msg)
      })
    },
    clearDates () {
      this.dates = []
      this.menu2 = false
      this.getList(true)
    },
    dateRangeSubmit () {
      this.menu2 = false
      this.getList(true)
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
.v-card__title {
  padding: 4px 16px;
  font-size: 1rem;
}
</style>
