<template>
  <div class="runs">
    <PageCard name="运行记录">
      <v-card>
        <v-card-title>
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="projectItems"
                label="项目名称"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="runsForm.projectNames"
                @blur="getRuns()"
              ></v-select>
              <v-select
                :items="pipelineItems"
                label="流水线名称"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="runsForm.pipelineNames"
                @blur="getRuns()"
              ></v-select>
              <v-select
                :items="statusItems"
                label="运行状态"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="runsForm.statusResults"
                @blur="getRuns()"
              ></v-select>
              <v-select
                :items="durationItems"
                label="运行时长"
                class="mr-8"
                dense
                clearable
                v-model="runsForm.duration"
                @change="getRuns()"
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
                      label="启动时间"
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
              <v-text-field
                label="标签名字"
                class="mr-8"
                dense
                v-model="runsForm.tagName"
                @keydown.enter="getRuns()"
              />
              <v-text-field
                label="启动用户"
                class="mr-8"
                dense
                v-model="runsForm.startUser"
                @keydown.enter="getRuns()"
              />
              <v-text-field
                label="运行编号"
                class="mr-8"
                dense
                type="number"
                v-model="runsForm.runNumber"
                @keydown.enter="getRuns()"
              />
            </v-container>
          </v-form>
        </v-card-title>
        <v-card-text>
          <runs-data-table :page="runsForm.page" :perPage="runsForm.perPage" :runsData="runsData" @getpage="pageOptions" :tableLoading="tableLoading" />
        </v-card-text>
      </v-card>
    </PageCard>
  </div>
</template>

<script>
import RunsDataTable from "@/components/RunsDataTable";
import PageCard from '@/lib/ui-lib/page-templates/PageCard';
import MODULE_API from '@/api/cicd/module';
import RUNS_API from '@/api/cicd/runs';
import PROJECTS_API from '@/api/cicd/projects'
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Runs',
  components: { RunsDataTable, PageCard },
  data () {
    return {
      dates: [],
      menu2: false,
      runsForm:{
        projectNames: [],
        pipelineNames: [],
        statusResults: [],
        duration: 0,
        startTimeRage: {
          startDate: '',
          endDate: ''
        },
        tagName: '',
        startUser: '',
        abortUser: '',
        runNumber: null,
        page: 1,
        perPage: 10
      },
      runsData: {},
      tableLoading: true,
      pipelineItems: [],
      projectItems: [],
      statusItems: [ 'RUNNING', 'SUCCESS', 'FAIL', 'ABORT', 'INPUT' ],
      durationItems: [ 
        { text: '0-2分钟', value: 1 }, 
        { text: '2-5分钟', value: 2 }, 
        { text: '5-15分钟', value: 3 }, 
        { text: '15-30分钟', value: 4 }, 
        { text: '30分钟以上', value: 5 }
      ]
    }
  },
  created () {
    MODULE_API.getPipelineName().then(response => {
      this.pipelineItems = response.data.pipelineNames
    }).catch((error) => {
      this.errorTip(true, error.response.data.msg)
    })
    PROJECTS_API.getProjectName().then(response => {
      this.projectItems = response.data.projectNames
    }).catch((error) => {
      this.errorTip(true, error.response.data.msg)
    })
    // RUNS_API.getRuns(this.runsForm).then(response => {
    //   // console.log(response.data)
    //   this.runsData = response.data
    //   this.tableLoading = false
    // }).catch()
  },
  methods: {
    clearDates() {
      this.dates = []
      this.menu2 = false
      this.getRuns()
    },
    dateRangeSubmit() {
      this.menu2 = false
      this.getRuns()
    },
    getRuns() {
      if(this.runsForm.duration == null) {
        this.runsForm.duration = 0
      }
      this.runsForm.startTimeRage.startDate = this.dates[0]
      this.runsForm.startTimeRage.endDate = this.dates[1]
      if(this.runsForm.runNumber == null || this.runsForm.runNumber == '') {
        this.runsForm.runNumber = null
      }else{
        this.runsForm.runNumber = Number(this.runsForm.runNumber)
      }
      RUNS_API.getRuns(this.runsForm).then(response => {
        this.runsData = response.data
        this.tableLoading = false
        this.successTip(true, response.msg)
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    },
    pageOptions(data){
      this.runsForm.page = data.page
      this.runsForm.perPage = data.perPage
      if(this.runsForm.duration == null) {
        this.runsForm.duration = 0
      }
      this.runsForm.startTimeRage.startDate = this.dates[0]
      this.runsForm.startTimeRage.endDate = this.dates[1]
      if(this.runsForm.runNumber == null || this.runsForm.runNumber == '') {
        this.runsForm.runNumber = null
      }else{
        this.runsForm.runNumber = Number(this.runsForm.runNumber)
      }
      RUNS_API.getRuns(this.runsForm).then(response => {
        // console.log(response.data)
        this.runsData = response.data
        this.tableLoading = false
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
      })
    }
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
