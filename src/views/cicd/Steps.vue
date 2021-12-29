<template>
  <div>
    <v-card
      class=" "
      flat
    >
      <v-card-title>
        步骤执行记录列表
      </v-card-title>
      <v-card-text>
        <VForm>
          <VContainer fluid>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="projectItems"
                label="项目名称"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="stepsForm.projectNames"
                @blur="stepsSearch()"
              ></v-select>
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
              <v-select
                :items="moduleNames"
                label="模块名"
                class="mr-8"
                dense
                clearable
                v-model="stepsForm.moduleName"
                @change="stepsSearch()"
              ></v-select>
              <v-select
                :items="moduleItems"
                label="模块类型"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="stepsForm.moduleTypes"
                @blur="stepsSearch()"
              ></v-select>
              <v-text-field
                label="运行编号"
                class="mr-8"
                dense
                type="number"
                v-model="stepsForm.runNumber"
                @keydown.enter="stepsSearch()"
              />
            </v-container>
          </VContainer>
        </VForm>
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
import STEPS_API from '@/api/cicd/steps'
import MODULE_API from '@/api/cicd/module'
import PROJECTS_API from '@/api/cicd/projects'
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Steps',
  components: { StepsDataTable },
  subscriptions () {
    return {
      queryPage$: new Subject()
    }
  },
  data () {
    return {
      stepsForm:{
        projectNames: [],
        pipelineNames: [],
        statusResults: ['SUCCESS', 'FAIL'],
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
      projectItems: [],
      statusItems: [],
      stepItems: [],
      moduleItems: [],
      moduleNames: [],
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
    // vm.$watchAsObservable('testYmlDialog').pipe(
    //   filter(next => next),
    //   delay(300)
    // ).subscribe(next => {
    //   if (vm.$refs.yamlCodeMirror) {
    //     vm.$refs.yamlCodeMirror.refresh()
    //   }
    // })
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
      console.log(response[0].data.steps)
      vm.pageData.displayRows = response[0].data.steps
      vm.pageData.total = response[0].data.totalCount
      vm.pageData.expanded = []
    })
    // vm.$observables.queryPage$.next('init')
    // MODULE_API.getPipelineName().then(response => {
    //   vm.pipelineItems = response.data.pipelineNames
    // }).catch(_ => {})
    // PROJECTS_API.getProjectName().then(response => {
    //   vm.projectItems = response.data.projectNames
    // }).catch(_ => {})
    STEPS_API.getStepActions().then(response => {
      // vm.stepItems = response.data.stepActions
      vm.pipelineItems = response.data.pipelineNames || []
      vm.projectItems = response.data.projectNames || []
      vm.statusItems = response.data.statusResults || []
      vm.stepItems = response.data.stepActions || []
      vm.moduleItems = response.data.moduleTypes || []
      vm.moduleNames = response.data.moduleNames || []
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
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
  }
}
</script>

<style lang="scss" scoped>
.v-text-field {
  //min-width: 300px;
}
.v-select {
  //width: 280px;
}
</style>
