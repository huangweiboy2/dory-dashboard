<template>
  <page-card name="自定义步骤">
    <v-card-text>
      <v-tabs v-model="tabValue">
        <v-tab>自定义步骤执行次数(次)</v-tab>
        <v-tab @change="change2()">自定义步骤执行平均时长(秒)</v-tab>
        <v-tab @change="change3()">自定义步骤执行次数周环比(次)</v-tab>
        <v-tab @change="change4()">自定义步骤执行状态比率(比率)</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tabValue">
        <!-- 自定义步骤执行次数 -->
        <v-tab-item>
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="dimensionList"
                label="维度"
                class="mr-8"
                dense
                v-model="chartParams.dimension"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="timeZoomList"
                label="统计区间"
                class="mr-8"
                dense
                v-model="chartParams.timeZoom"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="timeRageDaysList"
                label="时间区间"
                class="mr-8"
                dense
                v-model="chartParams.timeRageDays"
                @change="timeRageDaysChange(chartParams.timeRageDays)"
              ></v-select>
              <template>
                <v-menu
                  v-model="menu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRangeText"
                      label="自定义时间"
                      prepend-icon="mdi-calendar"
                      readonly
                      dense
                      :disabled="timeRageStatus"
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
              <v-select
                :items="projectNamesList"
                label="过滤项目"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.projectNames"
                @change="getEcharts()"
                @blur="projectNameBlur(chartParams)"
              ></v-select>
              <v-select
                :items="projectTeamsList"
                label="过滤团队"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.projectTeams"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="branchNamesList"
                label="过滤分支"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.branchNames"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="pipelineNamesList"
                label="过滤流水线"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.pipelineNames"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="statusResultsList"
                label="执行状态"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.statusResults"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="envNamesList"
                label="环境名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.envNames"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="moduleNamesList"
                label="模块名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.moduleNames"
                @change="getEcharts()"
              ></v-select>
              <v-select
                :items="customStepNamesList"
                label="自定义步骤"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams.customStepNames"
                @change="getEcharts()"
              ></v-select>
            </v-container>
          </v-form>
          <v-card :loading="cardLoading">
            <div style="width: 100%; height: 450px; position: relative">
              <canvas ref="testChart"></canvas>
            </div>
          </v-card>
        </v-tab-item>
        <!-- 自定义步骤执行平均时长 -->
        <v-tab-item>
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="dimensionList"
                label="维度"
                class="mr-8"
                dense
                v-model="chartParams2.dimension"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="timeZoomList"
                label="统计区间"
                class="mr-8"
                dense
                v-model="chartParams2.timeZoom"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="timeRageDaysList"
                label="时间区间"
                class="mr-8"
                dense
                v-model="chartParams2.timeRageDays"
                @change="timeRageDaysChange2(chartParams2.timeRageDays)"
              ></v-select>
              <template>
                <v-menu
                  v-model="menu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRangeText2"
                      label="自定义时间"
                      prepend-icon="mdi-calendar"
                      readonly
                      dense
                      :disabled="timeRageStatus2"
                      class="mr-8"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dates2"
                    range
                    no-title
                    @change="dateRangeSubmit2()"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      small
                      @click="clearDates2()"
                    >
                      清空
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <v-select
                :items="projectNamesList"
                label="过滤项目"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.projectNames"
                @change="getEcharts2()"
                @blur="projectNameBlur(chartParams2)"
              ></v-select>
              <v-select
                :items="projectTeamsList"
                label="过滤团队"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.projectTeams"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="branchNamesList"
                label="过滤分支"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.branchNames"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="pipelineNamesList"
                label="过滤流水线"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.pipelineNames"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="statusResultsList"
                label="执行状态"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.statusResults"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="envNamesList"
                label="环境名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.envNames"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="moduleNamesList"
                label="模块名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.moduleNames"
                @change="getEcharts2()"
              ></v-select>
              <v-select
                :items="customStepNamesList"
                label="自定义步骤"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams2.customStepNames"
                @change="getEcharts2()"
              ></v-select>
            </v-container>
          </v-form>
          <v-card :loading="cardLoading2">
            <div style="width: 100%; height: 450px; position: relative">
              <canvas ref="durationChart" id="durationChart"></canvas>
            </div>
          </v-card>
        </v-tab-item>
        <!-- 自定义步骤执行次数周环比 -->
        <v-tab-item>
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="[
                  { text: 'day（日：默认）', value: 'day' },
                  { text: 'hour（小时）', value: 'hour' },
                ]"
                label="统计区间"
                class="mr-8"
                dense
                v-model="chartParams3.timeZoom"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="timeRageDaysList"
                label="时间区间"
                class="mr-8"
                dense
                v-model="chartParams3.timeRageDays"
                @change="timeRageDaysChange3(chartParams3.timeRageDays)"
              ></v-select>
              <template>
                <v-menu
                  v-model="menu3"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRangeText3"
                      label="自定义时间"
                      prepend-icon="mdi-calendar"
                      readonly
                      dense
                      :disabled="timeRageStatus3"
                      class="mr-8"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dates3"
                    range
                    no-title
                    @change="dateRangeSubmit3()"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      small
                      @click="clearDates3()"
                    >
                      清空
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <v-select
                :items="projectNamesList"
                label="过滤项目"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.projectNames"
                @change="getEcharts3()"
                @blur="projectNameBlur(chartParams3)"
              ></v-select>
              <v-select
                :items="projectTeamsList"
                label="过滤团队"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.projectTeams"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="branchNamesList"
                label="过滤分支"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.branchNames"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="pipelineNamesList"
                label="过滤流水线"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.pipelineNames"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="statusResultsList"
                label="执行状态"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.statusResults"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="envNamesList"
                label="环境名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.envNames"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="moduleNamesList"
                label="模块名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.moduleNames"
                @change="getEcharts3()"
              ></v-select>
              <v-select
                :items="customStepNamesList"
                label="自定义步骤"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams3.customStepNames"
                @change="getEcharts3()"
              ></v-select>
            </v-container>
          </v-form>
          <v-card :loading="cardLoading3">
            <div style="width: 100%; height: 450px; position: relative">
              <canvas ref="testChart3"></canvas>
            </div>
          </v-card>
        </v-tab-item>
        <!-- 自定义步骤执行状态比率 -->
        <v-tab-item>
          <v-form>
            <v-container class="d-flex flex-wrap">
              <v-select
                :items="[
                  { text: 'all（全部）', value: 'all' },
                  { text: 'projectName（项目）', value: 'projectName' },
                  { text: 'projectTeam（团队）', value: 'projectTeam' },
                  { text: 'branchName（分支）', value: 'branchName' },
                  { text: 'pipelineName（流水线）', value: 'pipelineName' },
                  { text: 'envName（环境）', value: 'envName' },
                  { text: 'moduleName（模块名）', value: 'moduleName' },
                  { text: 'customStepName（自定义步骤类型）', value: 'customStepName' },
                ]"
                label="维度"
                class="mr-8"
                dense
                v-model="chartParams4.dimension"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="timeZoomList"
                label="统计区间"
                class="mr-8"
                dense
                v-model="chartParams4.timeZoom"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="timeRageDaysList"
                label="时间区间"
                class="mr-8"
                dense
                v-model="chartParams4.timeRageDays"
                @change="timeRageDaysChange4(chartParams4.timeRageDays)"
              ></v-select>
              <template>
                <v-menu
                  v-model="menu4"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRangeText4"
                      label="自定义时间"
                      prepend-icon="mdi-calendar"
                      readonly
                      dense
                      :disabled="timeRageStatus4"
                      class="mr-8"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dates4"
                    range
                    no-title
                    @change="dateRangeSubmit4()"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      small
                      @click="clearDates4()"
                    >
                      清空
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </template>
              <v-select
                :items="projectNamesList"
                label="过滤项目"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.projectNames"
                @change="getEcharts4()"
                @blur="projectNameBlur(chartParams4)"
              ></v-select>
              <v-select
                :items="projectTeamsList"
                label="过滤团队"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.projectTeams"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="branchNamesList"
                label="过滤分支"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.branchNames"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="pipelineNamesList"
                label="过滤流水线"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.pipelineNames"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="envNamesList"
                label="环境名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.envNames"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="moduleNamesList"
                label="模块名"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.moduleNames"
                @change="getEcharts4()"
              ></v-select>
              <v-select
                :items="customStepNamesList"
                label="自定义步骤"
                class="mr-8"
                dense
                small-chips
                multiple
                v-model="chartParams4.customStepNames"
                @change="getEcharts4()"
              ></v-select>
            </v-container>
          </v-form>
          <v-card :loading="cardLoading4">
            <div style="width: 100%; height: 400px; position: relative" v-for="(item,index) in statusResultsList">
              <canvas :ref="`statusChart${index}`" :id="`statusChart${index}`"></canvas>
            </div>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </page-card>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import request from '@/utils/request'
import { echartOption } from '@/services/echartOption'
import { colorList } from '@/services/colorList'

Chart.register(...registerables)
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'customSteps',
  components: { PageCard },
  data () {
    return {
      tabValue: 0,
      menu1: false,
      menu2: false,
      menu3: false,
      menu4: false,
      cardLoading: true,
      cardLoading2: true,
      cardLoading3: true,
      cardLoading4: true,
      dates: [],
      dates2: [],
      dates3: [],
      dates4: [],
      timeRageStatus: true,
      timeRageStatus2: true,
      timeRageStatus3: true,
      timeRageStatus4: true,
      dimensionList: [
        { text: 'all（全部）', value: 'all' },
        { text: 'projectName（项目）', value: 'projectName' },
        { text: 'projectTeam（团队）', value: 'projectTeam' },
        { text: 'branchName（分支）', value: 'branchName' },
        { text: 'pipelineName（流水线）', value: 'pipelineName' },
        { text: 'statusResult（状态）', value: 'statusResult' },
        { text: 'envName（环境）', value: 'envName' },
        { text: 'moduleName（模块名）', value: 'moduleName' },
        { text: 'customStepName（自定义步骤类型）', value: 'customStepName' },
      ],
      timeZoomList: [
        { text: 'year（年）', value: 'year' },
        { text: 'month（月）', value: 'month' },
        { text: 'week（周）', value: 'week' },
        { text: 'day（日：默认）', value: 'day' },
        { text: 'hour（小时）', value: 'hour' },
      ],
      timeRageDaysList: [
        { text: '最近 7 天：默认', value: 7 },
        { text: '最近 14 天', value: 14 },
        { text: '最近 30 天', value: 30 },
        { text: '最近 90 天', value: 90 },
        { text: '最近 365 天', value: 365 },
        { text: '自定义', value: 0 },
      ],
      chartParams: {
        dimension: 'projectName',
        timeZoom: 'day',
        timeRageDays: 7,
        timeRage: {
          startDate: '',
          endDate: ''
        },
        projectNames: [],
        projectTeams: [],
        pipelineNames: [],
        branchNames: [],
        statusResults: [],
        envNames: [],
        moduleNames: [],
        customStepNames: []
      },
      chartParams2: {
        dimension: 'projectName',
        timeZoom: 'day',
        timeRageDays: 7,
        timeRage: {
          startDate: '',
          endDate: ''
        },
        projectNames: [],
        projectTeams: [],
        pipelineNames: [],
        branchNames: [],
        statusResults: [],
        envNames: [],
        moduleNames: [],
        customStepNames: []
      },
      chartParams3: {
        dimension: 'projectName',
        timeZoom: 'day',
        timeRageDays: 7,
        timeRage: {
          startDate: '',
          endDate: ''
        },
        projectNames: [],
        projectTeams: [],
        pipelineNames: [],
        branchNames: [],
        statusResults: [],
        envNames: [],
        moduleNames: [],
        customStepNames: []
      },
      chartParams4: {
        dimension: 'projectName',
        timeZoom: 'day',
        timeRageDays: 7,
        timeRage: {
          startDate: '',
          endDate: ''
        },
        projectNames: [],
        projectTeams: [],
        pipelineNames: [],
        branchNames: [],
        statusResults: [],
        envNames: [],
        moduleNames: [],
        customStepNames: []
      },
      statusResultsList: [],
      projectNamesList: [],
      projectTeamsList: [],
      branchNamesList: [],
      pipelineNamesList: [],
      envNamesList: [],
      moduleNamesList: [],
      customStepNamesList: [],
      config: {},
      config2: {},
      config3: {},
      config4: [],
      myChart: '',
      myChart2: '',
      myChart3: '',
      myChart4: [],
      e2: '0',
      e3: '0',
      e4: '0',
    }
  },
  created () {
    const vm = this
    request.get('/metrics/customSteps/options').then(response => {
      vm.searchData = response.data
      vm.statusResultsList = response.data.statusResults
      vm.projectNamesList = response.data.projectNames
      vm.projectTeamsList = response.data.projectTeams
      vm.branchNamesList = response.data.branchNames
      vm.pipelineNamesList = response.data.pipelineNames
      vm.envNamesList = response.data.envNames
      vm.moduleNamesList = response.data.moduleNames
      vm.customStepNamesList = response.data.customStepNames
    })
  },
  mounted () {
    const vm = this
    // 自定义步骤执行次数
    var colorList2 = [...colorList]
      var i = Math.floor(Math.random() * colorList2.length);
    request.post('/metrics/customSteps/count', vm.chartParams).then(response => {
      vm.config = {
        type: 'line',
        data: {
          labels: response.data.labels,
          datasets: Object.entries(response.data.datasets).map(([key, value],index) => {
            i++
            return {
              label: key,
              data: value,
              backgroundColor: colorList2[i%(colorList2.length)],
              borderColor: colorList2[i%(colorList2.length)],
            }
          })
        },
        options: echartOption
      }
      vm.myChart = new Chart(
        vm.$refs.testChart,
        vm.config
      )
      vm.cardLoading = false
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
      vm.cardLoading = false
    })
  },
  methods: {
    change2 () {
      const vm = this
      if(vm.e2 === '0'){
        vm.getEcharts2()
      }
      vm.e2 = '1'
    },
    change3 () {
      const vm = this
      if(vm.e3 === '0'){
        vm.getEcharts3()
      }
      vm.e3 = '1'
    },
    change4 () {
      const vm = this
      if(vm.e4 === '0'){
        vm.getEcharts4()
      }
      vm.e4 = '1'
    },
    // 自定义步骤执行次数
    getEcharts () {
      const vm = this
      var colorList2 = [...colorList]
      var i = Math.floor(Math.random() * colorList2.length);
      if(vm.chartParams.timeRageDays == 0 && vm.dates.length == 0){
        vm.warnTip(true, '请选择自定义时间区间')
      }else{
        if(vm.myChart){
          vm.myChart.destroy()
        }
        vm.cardLoading = true
        const dates = [...vm.dates].sort()
        vm.chartParams.timeRage.startDate = dates[0]
        vm.chartParams.timeRage.endDate = dates[1]
        request.post('/metrics/customSteps/count', vm.chartParams).then(response => {
          vm.config = {
            type: 'line',
            data: {
              labels: response.data.labels,
              datasets: Object.entries(response.data.datasets).map(([key, value],index) => {
                i++
                return {
                  label: key,
                  data: value,
                  backgroundColor: colorList2[i%(colorList2.length)],
                  borderColor: colorList2[i%(colorList2.length)],
                }
              })
            },
            options: echartOption
          }
          vm.myChart = new Chart(
            vm.$refs.testChart,
            vm.config
          )
          vm.cardLoading = false
          vm.successTip(true, response.msg)
        }).catch(error => {
          vm.cardLoading = false
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    // 自定义步骤执行平均时长
    getEcharts2 () {
      const vm = this
      var colorList2 = [...colorList]
      var i = Math.floor(Math.random() * colorList2.length);
      if(vm.chartParams2.timeRageDays == 0 && vm.dates2.length == 0){
        vm.warnTip(true, '请选择自定义时间区间')
      }else{
        if(vm.myChart2){
          vm.myChart2.destroy()
        }
        vm.cardLoading2 = true
        const dates = [...vm.dates2].sort()
        vm.chartParams2.timeRage.startDate = dates[0]
        vm.chartParams2.timeRage.endDate = dates[1]
        request.post('/metrics/customSteps/duration', vm.chartParams2).then(response => {
          vm.config2 = {
            type: 'line',
            data: {
              labels: response.data.labels,
              datasets: Object.entries(response.data.datasets).map(([key, value],index) => {
                i++
                return {
                  label: key,
                  data: value,
                  backgroundColor: colorList2[i%(colorList2.length)],
                  borderColor: colorList2[i%(colorList2.length)],
                }
              })
            },
            options: echartOption
          }
          vm.myChart2 = new Chart(
            vm.$refs.durationChart,
            vm.config2
          )
          vm.cardLoading2 = false
          vm.successTip(true, response.msg)
        }).catch(error => {
          vm.cardLoading2 = false
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    // 自定义步骤执行次数周环比
    getEcharts3 () {
      const vm = this
      var colorList2 = [...colorList]
      var i = Math.floor(Math.random() * colorList2.length);
      if(vm.chartParams3.timeRageDays == 0 && vm.dates3.length == 0){
        vm.warnTip(true, '请选择自定义时间区间')
      }else{
        if(vm.myChart3){
          vm.myChart3.destroy()
        }
        vm.cardLoading3 = true
        const dates = [...vm.dates3].sort()
        vm.chartParams3.timeRage.startDate = dates[0]
        vm.chartParams3.timeRage.endDate = dates[1]
        request.post('/metrics/customSteps/countWeekly', vm.chartParams3).then(response => {
          vm.config3 = {
            type: 'line',
            data: {
              labels: response.data.labels,
              datasets: Object.entries(response.data.datasets).map(([key, value],index) => {
                i++
                return {
                  label: key,
                  data: value,
                  backgroundColor: colorList2[i%(colorList2.length)],
                  borderColor: colorList2[i%(colorList2.length)],
                }
              })
            },
            options: echartOption
          }
          vm.successTip(true, response.msg)
          vm.myChart3 = new Chart(
            vm.$refs.testChart3,
            vm.config3
          )
          vm.cardLoading3 = false
        }).catch(error => {
          vm.cardLoading3 = false
          vm.errorTip(true, error.response.data.msg)
        })
      }
    },
    // 自定义步骤执行状态比率
    getEcharts4 () {
      const vm = this
      var colorList2 = [...colorList]
      var options = JSON.parse(JSON.stringify(echartOption))
      var i = Math.floor(Math.random() * colorList2.length);
      if(vm.chartParams4.timeRageDays == 0 && vm.dates4.length == 0){
        vm.warnTip(true, '请选择自定义时间区间')
      }else{
        vm.statusResultsList.map((item,index) => {
          if(vm.myChart4[index]){
            vm.myChart4[index].destroy()
          }
          vm.cardLoading4 = true
          const dates = [...vm.dates4].sort()
          vm.chartParams4.timeRage.startDate = dates[0]
          vm.chartParams4.timeRage.endDate = dates[1]
          request.post(`/metrics/customSteps/status/${item}`, vm.chartParams4).then(response => {
            vm.config4[index] = {
              type: 'line',
              data: {
                labels: response.data.labels,
                datasets: Object.entries(response.data.datasets).map(([key, value],index) => {
                  i++
                  return {
                    label: key,
                    data: value,
                    backgroundColor: colorList2[i%(colorList2.length)],
                    borderColor: colorList2[i%(colorList2.length)],
                  }
                })
              },
              options: options
            }
            vm.successTip(true, response.msg)
            vm.config4[index].options.plugins.title = {
              display: true,
              text: item
            }
            var ctx = document.getElementById(`statusChart${index}`)
            vm.myChart4[index] = new Chart(
              ctx,
              vm.config4[index]
            )
            vm.cardLoading4 = false
          }).catch(error => {
            vm.cardLoading4 = false
            vm.errorTip(true, error.response.data.msg)
          })
        })
      }
    },
    timeRageDaysChange (value) {
      if(value == 0){
        this.warnTip(true, '请选择自定义时间区间')
        this.timeRageStatus = false
      }else{
        this.dates = []
        this.timeRageStatus = true
        this.getEcharts()
      }
    },
    timeRageDaysChange2 (value) {
      if(value == 0){
        this.warnTip(true, '请选择自定义时间区间')
        this.timeRageStatus2 = false
      }else{
        this.dates = []
        this.timeRageStatus2 = true
        this.getEcharts2()
      }
    },
    timeRageDaysChange3 (value) {
      if(value == 0){
        this.warnTip(true, '请选择自定义时间区间')
        this.timeRageStatus3 = false
      }else{
        this.dates = []
        this.timeRageStatus3 = true
        this.getEcharts3()
      }
    },
    timeRageDaysChange4 (value) {
      if(value == 0){
        this.warnTip(true, '请选择自定义时间区间')
        this.timeRageStatus4 = false
      }else{
        this.dates = []
        this.timeRageStatus4 = true
        this.getEcharts4()
      }
    },
    projectNameBlur (chartParams) {
      const vm = this
      if(chartParams.projectNames.length >0){
        var newBranchNames = []
        var newPipelineNames = []
        var newModuleNames = []
        var newEnvNames = []
        chartParams.projectNames.forEach(item => {
          vm.searchData.projects.map(i => {
            if(i.projectName == item){
              newBranchNames.push(...i.branchNames)
              newPipelineNames.push(...i.pipelineNames)
              newModuleNames.push(...i.moduleNames)
              newEnvNames.push(...i.envNames)
              vm.branchNamesList = [... new Set(newBranchNames)]
              vm.pipelineNamesList = [... new Set(newPipelineNames)]
              vm.moduleNamesList = [... new Set(newModuleNames)]
              vm.envNamesList = [... new Set(newEnvNames)]
            }
          })
        })
      }else{
        vm.branchNamesList = vm.searchData.branchNames
        vm.pipelineNamesList = vm.searchData.pipelineNames
        vm.moduleNamesList = vm.searchData.moduleNames
        vm.envNamesList = vm.searchData.envNamesList
      }
    },
    dateRangeSubmit() {
      this.menu1 = false
      this.getEcharts()
    },
    dateRangeSubmit2() {
      this.menu2 = false
      this.getEcharts2()
    },
    dateRangeSubmit3() {
      this.menu3 = false
      this.getEcharts3()
    },
    dateRangeSubmit4() {
      this.menu4 = false
      this.getEcharts4()
    },
    clearDates() {
      this.dates = []
      this.menu1 = false
    },
    clearDates2() {
      this.dates2 = []
      this.menu2 = false
    },
    clearDates3() {
      this.dates3 = []
      this.menu3 = false
    },
    clearDates4() {
      this.dates4 = []
      this.menu4 = false
    },
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    },
    dateRangeText2 () {
      return this.dates2.join(' ~ ')
    },
    dateRangeText3 () {
      return this.dates3.join(' ~ ')
    },
    dateRangeText4 () {
      return this.dates4.join(' ~ ')
    },
  }
}
</script>

<style scoped>

</style>
