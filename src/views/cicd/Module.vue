<template>
  <div class="module pa-4">
    <PageCard name="模块查看">
      <v-card class="mb-4" :loading="cardLoading">
        <v-card-title>模块信息</v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="moduleData">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  模块名称
                </th>
                <th class="text-left">
                  模块类型
                </th>
                <th class="text-left">
                  是否最新
                </th>
                <th class="text-left">
                  最新运行时间
                </th>
                <th class="text-left">
                  运行次数
                </th>
                <th class="text-left">
                  最新运行名称
                </th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>
                  {{ moduleData.module.moduleName }}
                </td>
                <td>{{ moduleData.module.moduleType }}</td>
                <td>{{ moduleData.module.isLatest }}</td>
                <td>{{ moduleData.module.runTimeLatest }}</td>
                <td>{{ moduleData.module.runCount }}</td>
                <td>
                  <router-link :to="{name: 'CicdRun', params: { 'runName': moduleData.module.runNameLatest }}">
                    {{ moduleData.module.runNameLatest }}
                  </router-link>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          项目基础信息
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="moduleData">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    项目名称
                  </th>
                  <th class="text-left">
                    项目团队
                  </th>
                  <th class="text-left">
                    项目仓库
                  </th>
                  <th class="text-left">
                    可用NodePort
                  </th>
                  <th class="text-left">
                    可用环境信息
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <template>
                      <router-link :to="{ name: 'CicdProject', params: { projectName: moduleData.projectInfo.projectName }}">
                        <span>{{ moduleData.projectInfo.projectName }}</span><span>（{{ moduleData.projectInfo.projectShortName }}）</span>
                        <div>{{ moduleData.projectInfo.projectDesc }}</div>
                      </router-link>
                    </template>
                  </td>
                  <td>{{ moduleData.projectInfo.projectTeam }}</td>
                  <td>
                    <div class="repo-wrap">
                      <div class="mb-1">
                        <a target="_Blank" :href="moduleData.projectRepo.gitRepo">
                          <v-chip small color="success">代码仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="moduleData.projectRepo.imageRepo">
                          <v-chip small color="success">镜像仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="moduleData.projectRepo.artifactRepo">
                          <v-chip small color="success">制品仓库</v-chip>
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item, index) in moduleData.projectNodePorts" :key="index">
                        <v-chip color="primary" small>
                          {{ item.nodePortStart }}-{{ item.nodePortEnd }}
                        </v-chip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item, index) in moduleData.projectAvailableEnvs"><v-chip color="primary" small>{{ item.envName }}</v-chip></div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-title>
          步骤执行记录
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="pipelineItems"
                label="流水线名称"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="stepsForm.pipelineNames"
                @blur="stepsSearch()"
              ></v-select>
              <v-select
                :items="statusItems"
                label="执行状态"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="stepsForm.statusResults"
                @blur="stepsSearch()"
              ></v-select>
              <v-select
                :items="stepItems"
                label="步骤类型"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="stepsForm.stepActions"
                @blur="stepsSearch()"
              ></v-select>
              <v-select
                :items="durationItems"
                label="运行时长"
                class="mr-8"
                dense
                clearable
                v-model="stepsForm.duration"
                @change="stepsSearch()"
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
                    @change="datePickerChange()"
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

              <!-- <v-text-field
                label="模块名"
                class="mr-8"
                dense
                v-model="stepsForm.moduleName"
                @keydown.enter="stepsSearch()"
              /> -->
              <v-text-field
                label="运行编号"
                class="mr-8"
                dense
                type="number"
                v-model="stepsForm.runNumber"
                @keydown.enter="stepsSearch()"
              />
            </v-container>
          </v-form>
        </v-card-title>
        <v-card-text>
          <StepsDataTable
            :steps="pageData.rows"
            :server-items-length="pageData.total"
            :loading="pageData.loading"
            :footerProps="{
              showCurrentPage: true,
              itemsPerPageOptions: [ 5, 10, 15 ]
            }"
            :expanded.sync="pageData.expanded"
            :options="{
              page: pageData.currentPage,
              itemsPerPage: pageData.pageSize
            }"
            @update:options="(value) => {
              pageData.currentPage = value.page
              pageData.pageSize = value.itemsPerPage
              $observables.queryPage$.next('dataOptionChange')
            }"
            :console="runLog"
          />
        </v-card-text>
      </v-card>
    </PageCard>
    <v-dialog
      v-model="auditDialog"
      max-width="800px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 300px;">
          <pre
            v-for="(logMsg, i) in logPreview"
            :key="i"
            :id="'log' + i"
            :style="logMsg.logType | changeColor"
          >[{{ logMsg.logType }}] {{ logMsg.createTime }}  {{ logMsg.content }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.auditDialog = false
            }"
            :disabled="disableBtn"
            :loading="disableBtn"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { catchError, delay, filter, mergeMap, retryWhen, scan, tap, withLatestFrom } from 'rxjs/operators'
import StepsDataTable from '@/components/StepsDataTable'
import { defer, of, Subject } from 'rxjs'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import MODULE_API from '@/api/cicd/module'
import STEPS_API from '@/api/cicd/steps'
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Module',
  components: { StepsDataTable, PageCard },
  subscriptions () {
    return {
      queryPage$: new Subject()
    }
  },
  data () {
    return {
      moduleData: '',
      cardLoading: true,
      stepsForm:{
        projectNames: [],
        pipelineNames: [],
        statusResults: [],
        stepActions: [],
        moduleTypes: [],
        moduleName: '',
        duration: 0,
        createTimeRage: {
            startDate: '',
            endDate: ''
        },
        runNumber: null,
      },
      pageData: {
        loading: false,
        total: 0,
        pageSize: 10,
        currentPage: 1,
        rows: [],
        displayRows: [],
        expanded: []
      },
      dates: [],
      menu2: false,
      pipelineItems: [],
      statusItems: ['RUNNING', 'SUCCESS', 'FAIL', 'ABORT'],
      stepItems: ['build', 'scanCode', 'packageImage', 'scanImage', 'deploy', 'undo', 'syncImage', 'checkDeploy', 'artifact', 'deployArtifac', 'testApi', 'testPerformance', 'testWebui', 'databaseExec', 'databaseRollback', 'applyMesh', 'changeMesh', 'deployDebug', 'deployStatic'],
      durationItems: [
        { text: '0-2分钟', value: 1 }, 
        { text: '2-5分钟', value: 2 }, 
        { text: '5-15分钟', value: 3 }, 
        { text: '15-30分钟', value: 4 }, 
        { text: '30分钟以上', value: 5 }
      ],
      userToken: '',
      auditDialog: false,
      btnLoading: false,
      logPreview: [],
      disableBtn: false
    }
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    // @ projectName
    // @ moduleType
    // @ moduleName
    const projectName = this.$route.params.projectName
    const moduleType = this.$route.params.moduleType
    const moduleName = this.$route.params.moduleName
    vm.stepsForm.projectNames = [projectName]
    vm.stepsForm.moduleTypes = [moduleType]
    vm.stepsForm.moduleName = moduleName
    MODULE_API.getModule(projectName,moduleType,moduleName).then(response => {
      console.log(response.data)
      this.moduleData = response.data
      this.cardLoading = false
    }).catch(error => {
      this.errorTip(true, error.response.data.msg)
      this.timer=setTimeout(() => {
        this.$router.go(-1)
      },2000)
    })
    MODULE_API.getPipelineName().then(response => {
      this.pipelineItems = response.data.pipelineNames
    }).catch(_ => {})
    vm.$observables.queryPage$.pipe(
      tap(next => {
        vm.pageData.loading = true
      }),
      mergeMap(next => {
        const param = Object.assign({}, {...vm.stepsForm}, {
          page: vm.pageData.currentPage,
          perPage: vm.pageData.pageSize
        })
        return defer(() => STEPS_API.getSteps(param)).pipe(
          retryWhen((errors) => {
            return errors.pipe(
              scan((acc, next) => {
                acc += 1
                if (acc > 2) {
                  throw next
                }
                return acc
              }, 0)
            )
          }),
          catchError((err, caught) => {
            console.log(err)
            vm.errorTip(true, err.response.data.msg)
            vm.pageData.loading = false
            return of(null)
          }),
          withLatestFrom(of(next))
        )
      }),
      filter(next => {
        return next[0]
      })
    ).subscribe(response => {
      vm.pageData.loading = false
      if(response[1] == 'stepsSearch'){
        vm.successTip(true, response[0].msg)
      }
      vm.pageData.rows = response[0].data.steps
      vm.pageData.displayRows = response[0].data.steps
      vm.pageData.total = response[0].data.totalCount
      vm.pageData.expanded = []
    })
  },
  methods: {
    clearDates () {
      this.dates = []
      this.menu2 = false
      this.stepsSearch()
    },
    datePickerChange(){
      this.menu2 = false
      this.stepsSearch()
    },
    stepsSearch() {
      const vm = this
      this.stepsForm.createTimeRage.startDate = this.dates[0]
      this.stepsForm.createTimeRage.endDate = this.dates[1]
      if(this.stepsForm.runNumber == null || this.stepsForm.runNumber == '') {
        this.stepsForm.runNumber = null
      }else{
        this.stepsForm.runNumber = Number(this.stepsForm.runNumber)
      }
      this.stepsForm.duration = Number(this.stepsForm.duration)
      vm.$observables.queryPage$.next('stepsSearch')
    },
    runLog(runName, stepID) {
      const vm = this
      vm.logPreview = []
      vm.auditDialog = true
      vm.ws = new WebSocket(`${vm.GLOBAL}/ws/log/run/${runName}?kind=log&stepID=${stepID}&x-user-token=${vm.userToken}`)
      vm.ws.onmessage = (event) => {
        vm.logPreview.push(JSON.parse(event.data))
      }
      vm.ws.onclose = () => {
        vm.logPreview.push({logType: 'END'})
        vm.disableBtn = false
      }
    }
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  },
  filters: {
    changeColor: function (value) {
      if(value == 'ERROR'){
        return {color: 'red'}
      }else if(value == 'INFO'){
        return {color: 'white'}
      }else{
        return null
      }
    },
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
.v-card__title {
  padding: 4px 16px;
  font-size: 1rem;
}
</style>
