<template>
  <PageCard>
    <v-card :loading="cardLoading">
      <InfoCard
        class="mb-4 top-card"
        title="运行基础信息"
      >
        <info-single-table
          :infos="[
            { key: 'runName', name: '运行名称', value: run.runName},
            { key: 'projectPipelineName', name: '项目/流水线名称', value: 'projectPipelineName'},
            { key: 'labelName', name: '标签名字', value: run.tagName},
            { key: 'startUser', name: '启动用户', value: run.startUser},
            { key: 'endUser', name: '终止用户', value: run.abortUser},
            { key: 'startTime', name: '启动时间', value: run.status.startTime},
            { key: 'runResult', name: '运行结果', value: 'runResult'},
            { key: 'opt', name: '操作', value: 'opt'}
          ]"
        >
          <template v-slot:projectPipelineName>
            <div class="mt-1"><v-chip small color="primary" :to="{name: 'CicdProject', params: {projectName: run.projectName || ''}}">{{run.projectName}}</v-chip></div>
            <div class="mt-1"><v-chip small color="primary" :to="{name: 'CicdPipeline', params: {pipelineName: run.pipelineName || ''}}">{{run.pipelineName}}</v-chip></div>
          </template>
          <template v-slot:runResult>
            <div>{{ run.status.duration }}</div>
            <v-chip small class="mb-1 white--text" :color="statusColorMap[run.status.result] || 'primary'">
              {{run.status.result}}
            </v-chip>
          </template>
          <template v-slot:opt>
            <v-btn class="mr-2" small color="primary" @click="goProjectDef(run.projectName)">项目定义</v-btn>
            <v-btn v-if="run.branchName" small :color="errMsgPipelineDef === '' ? 'primary' : 'error'" class="mr-2" @click="getPipelineDef(run.projectName, run.branchName)">流水线定义</v-btn>
            <v-btn v-if="run.status.result == 'INPUT' || run.status.result == 'RUNNING' || run.status.result == 'PAUSE'" small color="primary" class="mr-2" @click="abortRun(run.runName)">终止</v-btn>
            <v-btn v-else small color="primary" class="mr-2" @click="reRun(run.pipelineName)">重新运行</v-btn>
            <v-btn v-if="run.status.result == 'PAUSE'" color="primary" small @click="topRun(run.runName)">队列置顶</v-btn>
          </template>
        </info-single-table>
      </InfoCard>
    </v-card>
    <info-card
      title="tabs"
      class="mb-4">
      <template v-slot:tabs>
        <v-tabs v-model="tab">
          <v-tab>运行详情</v-tab>
          <v-tab>代码提交记录</v-tab>
          <v-tab>模块信息</v-tab>
          <v-tab>步骤执行记录</v-tab>
        </v-tabs>
      </template>
      <v-tabs-items v-model="tab" class="pa-1">
        <v-tab-item>
          <div v-show="currentSelectNodeData.nodeType">
            <info-single-table
              :infos="[
                { key: 'nodeType', name: '节点类型', value: currentSelectNodeData.nodeType},
                { key: 'nodeName', name: '节点名称', value: currentSelectNodeData.nodeName},
                { key: 'status', name: '状态', value: 'status'},
                { key: 'labelName', name: '启动时间', value: currentSelectNodeData.startTime},
                { key: 'startUser', name: '结束时间', value: currentSelectNodeData.endTime},
                { key: 'endUser', name: '执行时长', value: currentSelectNodeData.duration}
              ]"
            >
              <template v-slot:status>
                <v-chip small class="mb-1 white--text" :color="statusColorMap[currentSelectNodeData.logType] || 'primary'">
                  {{currentSelectNodeData.logType}}
                </v-chip>
              </template>
            </info-single-table>
          </div>
          <div style="overflow-x: auto">
            <vue-pipeline
              ref="pipeline"
              :x="parseInt(50)"
              :y="parseInt(55)"
              :data="phasePipelineData"
              :showArrow="false"
              :ystep="70"
              :xstep="160"
              :lineStyle="'default'"
              :selected-list="phaseSelectedList"
              @node-click="(node, index) => {
                $observables.graphNodeClick$.next({node, index})
              }"
            />
            <br />
            <vue-pipeline
              ref="pipeline"
              :x="parseInt(50)"
              :y="parseInt(55)"
              :data="pipelineData"
              :showArrow="false"
              :ystep="70"
              :xstep="160"
              :lineStyle="'default'"
              :selected-list="selectedList"
              @node-click="(node, index) => {
                $observables.graphNodeClick$.next({node, index})
              }"
            />
          </div>

          <info-card outlined title="" class="mt-1" id="inputConfigForm" v-show="inputConfigMap.data">
            <v-container fluid v-if="inputConfigMap.data">
              <v-row align="center">
                <v-col cols="12" class="py-0">
                  {{ inputConfigMap.data.desc }}
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-if="inputConfigMap.data.options.length > 0"
                    v-model="inputConfigMap.model"
                    :items="inputConfigMap.data.options"
                    :label="inputConfigMap.data.title"
                    :multiple="inputConfigMap.data.isMultiple"
                    item-text="name"
                    item-value="value"
                    dense
                  ></v-select>
                </v-col>
                <v-col cols="12" class="justify-end d-flex">
                  <v-btn
                    color="primary"
                    class="mr-2"
                    @click="() => {
                      if(typeof inputConfigMap.model === 'object'){
                        inputConfigMap.model = inputConfigMap.model.toString()
                      }
                      if(!inputConfigMap.model && inputConfigMap.data.options.length > 0){
                        snackbar.show = true
                        snackbar.text = '请选择输入内容'
                        snackbar.color = 'error'
                      }
                          request.post(`/cicd/run/${$route.params.runName}/input`, {
                            phaseID: inputConfigMap.data.phaseID,
                            inputValue: inputConfigMap.model
                          }).then(() => {
                            inputConfigMap = {}
                          })
                        }"
                  >
                    确定
                  </v-btn>
                  <v-btn
                    @click="() => {
                          request.post(`/cicd/run/${$route.params.runName}/input`, {
                            phaseID: inputConfigMap.data.phaseID,
                            inputValue: 'ABORT'
                          }).then(() => {
                            inputConfigMap = {}
                          })
                        }"
                  >
                    终止
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </info-card>

          <v-expansion-panels class="mt-2">
            <v-expansion-panel v-for="(stepArr, i) in stepsList" :key="i" :id="'ex' + stepArr[0].stepID">
              <v-expansion-panel-header>
                <v-row>
                  <v-col cols="1">步骤</v-col>
                  <v-col class="text-truncate" :title="stepArr[0].content">{{ stepArr[0].content }}</v-col>
                  <!--                  <v-divider vertical class="mx-2" style="height: 15px"/>-->
                  <v-col style="width: 105px; flex: 0 0 105px">
                    <v-chip small class="mb-1 white--text" :color="statusColorMap[stepArr[stepArr.length - 1].logType] || 'primary'">
                      {{stepArr[stepArr.length - 1].logType}}
                    </v-chip>
                  </v-col>
                  <v-col cols="2">
                    <span class="mr-2">启动: </span>
                    <span>{{ stepArr[0].createTime }}</span>
                  </v-col>
                  <!--                  <v-col cols="2">
                                      <span class="mr-2">结束: </span>
                                      <span v-show="['SUCCESS', 'ABORT', 'FAIL'].includes(stepArr[stepArr.length - 1].logType)">
                                        {{ stepArr[stepArr.length - 1].createTime }}
                                      </span>
                                    </v-col>-->
                  <v-col cols="2">
                    <span class="mr-2">时长: </span>
                    <span v-show="['SUCCESS', 'ABORT', 'FAIL'].includes(stepArr[stepArr.length - 1].logType)">
                      {{ stepArr[stepArr.length - 1].content }}
                    </span>
                  </v-col>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative" class="pa-2">
                <pre
                  v-for="(logMsg, i) in logList.filter(log => log.stepID === stepArr[0].stepID)"
                  :key="i"
                  :id="'log' + i"
                >[{{ logMsg.logType }}] {{ logMsg.createTime }}  {{ logMsg.content }}</pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div ref="outputRunLog" style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative" class="pa-2 mt-2" >
            <div ref="outputRunLogDiv"></div>
            <!--              :absolute="logAbsoluteBtn === 'absolute'"-->
            <v-btn
              :fixed="true"
              :style="{
                bottom: '30px',
                right: '38px',
                zIndex: 10000
              }"
              fab
              color="primary"
              ref="logAbsoluteBtn"
              @click="() => {
                if(scrollToEnd) {
                  scrollToEnd = false
                } else {
                  $vuetify.goTo('#log' + (logList.length - 1), {
                    duration: 500
                  })
                  scrollToEnd = true
                }
              }"
              v-click-outside="() => {
                scrollToEnd = false
              }"
            >
              <!--              {{scrollToEnd ? '取消滚动' : '滚动输出'}}-->
              <v-icon v-if="!scrollToEnd" title="滚动输出">mdi-chevron-down</v-icon>
              <v-icon v-else title="取消滚动">mdi-close</v-icon>
            </v-btn>
            <v-btn
              :fixed="true"
              :style="{
                bottom: '102px',
                right: '38px',
                zIndex: 10000
              }"
              fab
              color="primary"
              @click="() => {
                $vuetify.goTo('.top-card', {
                  duration: 500
                })
              }"
            >
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
            <pre
              v-for="(logMsg, i) in logList"
              :key="i"
              :id="'log' + i"
              :ref="'log' + i"
              :style="logMsg.logType | changeColor"
            >[{{ logMsg.logType }}] {{ logMsg.createTime }}  {{ logMsg.content }}</pre>
          </div>
        </v-tab-item>
        <v-tab-item>
          <CommitsDataTable
            :commits="commitsPageData.rows"
            :items-per-page="commitsPageData.pageSize"
            :page="commitsPageData.currentPage"
            :server-items-length="commitsPageData.total"
            class="elevation-1 commits-table"
            dense
            :footer-props="{
                showCurrentPage: true,
                itemsPerPageOptions: [ 5, 10, 15, 20 ]
              }"
            show-expand
            :loading="commitsPageData.loading"
            loading-text="正在加载数据..."
            @update:options="(value) => {
              commitsPageData.currentPage = value.page
              commitsPageData.pageSize = value.itemsPerPage
              $observables.queryCommitsPage$.next('dataOptionChange')
            }"
            :run-link="false"
          />
        </v-tab-item>
        <v-tab-item>
          <module-infos v-if="modules" :modules="modules" :projectName="run.projectName" />
        </v-tab-item>
        <v-tab-item>
          <v-container class="d-flex flex-wrap" fluid>
            <v-select
              :items="statusItems"
              label="执行状态"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="stepsForm.statusResults"
              @blur="() => {
                $observables.queryStepsPage$.next('searchForm')
              }"
            ></v-select>
            <v-select
              :items="stepItems"
              label="步骤类型"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="stepsForm.stepActions"
              @blur="() => {
                $observables.queryStepsPage$.next('searchForm')
              }"
            ></v-select>
            <v-select
              :items="moduleNames"
              label="模块名"
              class="mr-8"
              dense
              clearable
              v-model="stepsForm.moduleName"
              @change="() => {
                $observables.queryStepsPage$.next('searchForm')
              }"
            ></v-select>
            <v-select
              :items="moduleItems"
              label="模块类型"
              class="mr-8"
              dense
              small-chips
              multiple
              v-model="stepsForm.moduleTypes"
              @blur="() => {
                $observables.queryStepsPage$.next('searchForm')
              }"
            ></v-select>
          </v-container>
          <StepsDataTable
            :steps="stepsPageData.rows"
            :server-items-length="stepsPageData.total"
            :loading="stepsPageData.loading"
            :footerProps="{
              showCurrentPage: true
            }"
            :expanded.sync="stepsPageData.expanded"
            :options="{
              page: stepsPageData.currentPage,
              itemsPerPage: stepsPageData.pageSize
            }"
            @update:options="(value) => {
              stepsPageData.currentPage = value.page
              stepsPageData.pageSize = value.itemsPerPage
              $observables.queryStepsPage$.next('dataOptionChange')
            }"
            :console="runLog"
          />
        </v-tab-item>
      </v-tabs-items>
    </info-card>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="2000"
      :color="snackbar.color"
      class="white--text"
    >
      {{ snackbar.text }}
    </v-snackbar>
    <v-dialog
        v-model="pipelineDefDialog"
        max-width="1200px"
        persistent
      >
        <v-card :loading="dialogLoading">
          <v-card-title>
            <span class="headline">设置流水线定义</span>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="pipelineDefHistory(targetBranchName)">mdi-history</v-icon>
              </template>
              <div>历史版本</div>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" v-bind="attrs" v-on="on" @click="openYaml()">mdi-cube-scan</v-icon>
              </template>
              <div>查看YAML定义</div>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="updatePipelineDef()">mdi-progress-upload</v-icon>
              </template>
              <div>提交更新</div>
            </v-tooltip>
            <v-icon @click="() => {
              this.pipelineDefDialog = false
            }">
              mdi-close
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-alert
              prominent
              type="error"
              v-if="errMsgPipelineDef"
            >
              {{ errMsgPipelineDef }}
            </v-alert>
            <v-form ref="pipelineDefRef">
              <v-container>
                <div class="pipeline-switch">
                  <small>是否开启构建模块自动检测（isAutoDetectBuild）</small>
                  <v-switch
                    v-model="pipelineDefForm.isAutoDetectBuild"
                    dense
                    inset
                    hint="假如开启，cicd流水线将会根据代码提交内容自动检测对应构建模块的代码路径中是否有代码文件发生变更，自动设置本次流水线开启哪些构建模块"
                    persistent-hint
                  ></v-switch>
                  <div class="mb-4">
                    <small>如果本设置开启，那么cicd流水线自动忽略以下builds(构建模块开关设置)的设置</small>
                  </div>
                  <small>是否串行执行（isQueue）</small>
                  <v-switch
                    v-model="pipelineDefForm.isQueue"
                    dense
                    inset
                    hint="假如开启，同时只能执行一条流水线，其他流水线将会以队列的形式等待执行"
                    persistent-hint
                  ></v-switch>
                </div>
                <div class="pipelineBuilds">
                  <small>构建模块开关设置（builds）*</small>
                  <div class="my-2" v-show="!pipelineDefForm.isAutoDetectBuild">
                    <v-chip v-for="item in pipelineDefForm.builds" :key="item.name" class="mr-2 mb-2" :color="item.run ? 'success': ''" @click="() => {
                      item.run = !item.run
                    }">{{item.name}}</v-chip>
                  </div>
                  <div class="my-2" v-show="pipelineDefForm.isAutoDetectBuild">
                    <v-chip v-for="item in pipelineDefForm.builds" :key="item.name" :class="item.run ? 'mr-2 mb-2 white--text': 'mr-2 mb-2'" :color="item.run ? 'orange': ''" @click="() => {
                      warnTip(true, '是否开启构建模块自动检测（isAutoDetectBuild）开启状态下不能设置')
                    }">{{item.name}}</v-chip>
                  </div>
                  <small>点击模块chip表示开启或者关闭</small>
                </div>
                <small class="mt-4">流水线步骤开关设置（pipelineStep）*</small>
                <v-card>
                  <v-simple-table dense v-if="stepInformation">
                    <template slot='default'>
                      <thead>
                        <tr>
                          <th class="text-left">
                            步骤标题
                          </th>
                          <th class="text-left" v-show="stepInformation.enable !== undefined">
                            是否启用(enable)
                          </th>
                          <th class="text-left" v-show="stepInformation.ignoreError !== undefined">
                            异常是否继续执行(ignoreError)
                          </th>
                          <th class="text-left" v-show="stepInformation.timeout !== undefined">
                            超时设置(timeout)
                          </th>
                          <th class="text-left" v-show="stepInformation.retry !== undefined">
                            重试设置(retry)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{textName}}</td>
                          <td v-show="stepInformation.enable !== undefined">
                            <span>
                              <v-switch
                                v-model="stepInformation.enable"
                                dense
                                inset
                                small
                                persistent-hint
                              ></v-switch>
                            </span>
                          </td>
                          <td v-show="stepInformation.ignoreError !== undefined">
                            <span>
                              <v-switch
                                v-model="stepInformation.ignoreError"
                                dense
                                inset
                                small
                                persistent-hint
                              ></v-switch>
                            </span>
                          </td>
                          <td v-show="stepInformation.timeout !== undefined">
                            <v-text-field
                              dense
                              persistent-hint
                              hint="0表示不限时，单位:秒"
                              type="number"
                              @blur="() => {
                                if (this.stepInformation.timeout.length <= 0) {
                                  this.stepInformation.timeout = 0
                                } else {
                                  this.stepInformation.timeout = Number(this.stepInformation.timeout)
                                }
                              }"
                              v-model="stepInformation.timeout"
                            />
                          </td>
                          <td v-show="stepInformation.retry !== undefined">
                            <v-text-field
                              dense
                              persistent-hint
                              hint="执行异常的情况下重试次数"
                              type="number"
                              @blur="() => {
                                if (this.stepInformation.retry.length <= 0) {
                                  this.stepInformation.retry = 0
                                } else {
                                  this.stepInformation.retry = Number(this.stepInformation.retry)
                                }
                              }"
                              v-model="stepInformation.retry"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card>
                <div class="pipeline-wrap">
                  <v-breadcrumbs :items="pipelineList">
                    <template v-slot:divider>
                      <v-icon>mdi-forward</v-icon>
                    </template>
                    <template v-slot:item="{item}">
                      <div :class="textName === item.name ? 'step-item avtive' : 'step-item'" >
                        <div v-if="item.type === 'original'" :class="item.data !== null && item.data.enable === false ? 'step-icon original-icon off' : 'step-icon original-icon'" @click.stop="openAddStep(item)">
                          {{item.isPush ? '+' : ''}}
                        </div>
                        <div v-else :class="item.data.enable === false ? 'step-icon custom-icon off' : 'step-icon custom-icon'" @click.stop="deleteStep(item)">-</div>
                        <v-chip @click="() => {
                          stepInformation = item.data
                          textName = item.name
                        }">
                          <div class="text-center">
                            <span>{{item.name}}</span>
                            <br />
                            <small style="height: 22px;">{{item.hint}}</small>
                          </div>
                        </v-chip>
                      </div>
                    </template>
                  </v-breadcrumbs>
                </div>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog
      v-model="customDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">请选择插入的自定义步骤</span>
        </v-card-title>
        <v-card-text>
          <v-select
            :items="customList"
            label="插入的步骤名称"
            dense
            multiple
            small-chips
            v-model="customSteps"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="addStep()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="historyDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">历史版本</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateDef()">mdi-progress-upload</v-icon>
            </template>
            <div>应用旧版本</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="historyClose()">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form class="d-flex" ref="historyRef">
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
                  @change="getHistory()"
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
              :items="commitHashList"
              label="历史版本"
              class="mr-8"
              dense
              item-text="message"
              item-value="commitHash"
              item-disabled="disabled"
              v-model="contentForm.commitHash"
              @change="getHistoryContent()"
            ></v-select>
          </v-form>
          <MonacoDiff
            ref="monacoDiff"
            :monacoOptions="monacoOptions"
            :original="original"
            :modified="modified"
            :height="500"
          ></MonacoDiff>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="YAMLDialog"
      max-width="1200px"
      persistent
      eager
    >
      <v-card>
        <v-card-title>
          <span class="headline">YAML定义</span>
        </v-card-title>
        <v-card-text>
          <Monaco
            ref="monaco"
            :monacoOptions="singleMonacoOptions"
            :height="500"
          ></Monaco>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="closeYaml()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  </PageCard>
</template>

<script>
import YAML from 'yamljs'
import InfoCard from '@/lib/ui-lib/components/InfoCard'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import InfoSingleTable from '@/lib/ui-lib/components/InfoSingleTable'
import StepsDataTable from '@/components/StepsDataTable'
import CommitsDataTable from '@/components/CommitsDataTable'
import MonacoDiff from "@/lib/monaco/MonacoDiff";
import Monaco from "@/lib/monaco/Monaco";
import {
  catchError,
  delay,
  mergeMap,
  pluck,
  retryWhen,
  scan,
  filter,
  map,
  tap,
  startWith,
  auditTime,
  switchMap,
  share,
  distinctUntilChanged,
  delayWhen,
  groupBy,
  shareReplay,
  withLatestFrom, debounceTime, bufferTime
} from 'rxjs/operators'
import RUNS_API from '@/api/cicd/runs'
import STEPS_API from '@/api/cicd/steps'
import COMMITS_API from '@/api/cicd/commits'
import request, { rtnRetryWhenOperator } from '@/utils/request'
import { defer, of, Subject, combineLatest, forkJoin } from 'rxjs'
import ModuleInfos from '@/components/ModuleInfos'
import { webSocket } from 'rxjs/webSocket'
import { debounce } from 'lodash'
import { isEmpty, cloneDeep } from 'lodash/fp'
import User from '@/services/user'

const userService = User.getInstance()
const statusMap = {
  finish: 'success',
  SUCCESS: 'success',
  abort: 'aborted',
  ABORT: 'aborted',
  fail: 'failure',
  FAIL: 'failure',
  START: 'running',
  RUNNING: 'running',
  INPUT: 'unstable'
}
export default {
  inject: ['reload', 'successTip', 'errorTip', 'warnTip'],
  name: 'Run',
  components: {
    ModuleInfos,
    StepsDataTable,
    CommitsDataTable,
    InfoSingleTable,
    PageCard,
    InfoCard,
    MonacoDiff,
    Monaco
  },
  subscriptions () {
    const vm = this
    const runName$ = vm.$watchAsObservable('$route', { immediate: true }).pipe(
      pluck('newValue', 'params', 'runName'),
      map(next => {
        return next
      }),
      shareReplay(1)
    )
    const queriedRunInfo$ = runName$.pipe(
      mergeMap((runName) => {
        return defer(() => {
          return RUNS_API.getRun(runName)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(err => {
            console.log(err)
            return of(null).pipe(
              tap(_ => {
                vm.snackbar.show = true
                vm.snackbar.text = err.response.data.msg
                vm.snackbar.color = 'error'
                vm.cardLoading = false
              }),
              delay(2000),
              tap(_ => {
                vm.$router.go(-1)
              })
            )
          })
        )
      }),
      shareReplay(1)
    )
    return {
      runName$: runName$,
      queriedRunInfo$: queriedRunInfo$,
      queryStepsPage$: new Subject(),
      queryCommitsPage$: new Subject(),
      graphNodeClick$: new Subject(),
      stepsLogCompleted$: new Subject(),
      abortRunClick$: new Subject()
    }
  },
  data () {
    const vm = this
    return {
      userToken: '',
      auditDialog: false,
      btnLoading: false,
      logPreview: [],
      disableBtn: false,
      console,
      request,
      logAbsoluteBtn: 'absolute',
      scrollToEnd: false,
      cardLoading: true,
      currentSelectNodeData: {},
      run: {
        status: {}
      },
      modules: '',
      stepsForm: {
        projectNames: [],
        pipelineNames: [],
        statusResults: ['SUCCESS', 'FAIL'],
        stepActions: [],
        moduleTypes: [],
        moduleName: '',
        runNumber: null
      },
      statusItems: [],
      stepItems: [],
      moduleItems: [],
      moduleNames: [],
      statusColorMap: {
        FAIL: 'red',
        RUNNING: 'blue',
        SUCCESS: 'green',
        ABORT: 'grey',
        INPUT: 'orange',
        PAUSE: 'blue-grey'
      },
      stepsPageData: {
        loading: false,
        total: 0,
        pageSize: 10,
        currentPage: 1,
        rows: [],
        expanded: []
      },
      commitsPageData: {
        loading: false,
        total: 0,
        pageSize: 10,
        currentPage: 1,
        rows: [],
        expanded: []
      },
      tab: 0,
      phasePipelineData: [{
        name: 'Start',
        hint: 'start',
        status: 'start',
        next: [
          { index: 1, weight: 0 }
        ],
        data: {}
      }, {
        name: 'End',
        hint: 'finish',
        status: 'end',
        next: [],
        data: {}
      }],
      phasePipelineDataShow: [{
        name: 'Start',
        hint: 'start',
        status: 'start',
        next: [
          { index: 1, weight: 0 }
        ],
        data: {}
      }, {
        name: 'End',
        hint: 'finish',
        get status () {
          return statusMap[vm.run.status.result] || 'end'
        },
        next: [],
        data: {}
      }],
      phaseSelectedList: [],
      pipelineData: [{
        name: 'Start',
        hint: 'start',
        status: 'start',
        next: [
          { index: 1, weight: 0 }
        ],
        data: {}
      }, {
        name: 'End',
        hint: 'finish',
        get status () {
          return statusMap[vm.run.status.result] || 'end'
        },
        // status: 'end',
        next: [],
        data: {}
      }],
      pipelineDataShow: [{
        name: 'Start',
        hint: 'start',
        status: 'start',
        next: [
          { index: 1, weight: 0 }
        ],
        data: {}
      }, {
        name: 'End',
        hint: 'finish',
        get status () {
          return statusMap[vm.run.status.result] || 'end'
        },
        next: [],
        data: {}
      }],
      selectedList: [],
      code: '',
      logList: [],
      value: [],
      snackbar: {
        show: false,
        color: 'success',
        text: ''
      },
      stepsList: [],
      inputConfigMap: {},
      endShow: false,
      targetProjectName: '',
      targetBranchName: '',
      pipelineDefForm: {
        builds: [],
        pipelineStep: {}
      },
      pipelineDefDialog: false,
      dialogLoading: false,
      YAMLDialog: false,
      yamlText: '',
      pipelineStepList: {
        build: {
          name: '是否执行构建(build)*',
          desc: '如果代码还不能构建的情况下，请设置为false，如果设置为false，后续所有步骤都不会执行'
        },
        scanCode: {
          name: '是否执行代码扫描(scanCode)*',
          desc: null
        },
        package: {
          name: '是否执行镜像打包(package)*',
          desc: '如果设置为false，后续镜像扫描、容器发布等步骤不会执行'
        },
        artifact: {
          name: '是否执行制品打包(artifact)*',
          desc: '如果设置为false，后续制品发布步骤不会执行'
        },
        scanImage: {
          name: '是否执行镜像扫描(scanImage)*',
          desc: null
        },
        deployContainer: {
          name: '是否进行容器发布(deployContainer)*',
          desc: null
        },
        deployArtifact: {
          name: '是否进行制品发布(deployArtifact)*',
          desc: null
        },
        syncProductionEnvImage: {
          name: '是否把正式环境的镜像同步到集成环境(syncProductionEnvImage)*',
          desc: null
        },
        apiTesting: {
          name: '是否进行接口测试(apiTesting)*',
          desc: null
        },
        performanceTesting: {
          name: '是否进行性能测试(performanceTesting)*',
          desc: null
        },
        webuiTesting: {
          name: '是否进行界面测试(webuiTesting)*',
          desc: null
        },
        scanCodeIgnoreError: {
          name: '代码扫描失败情况下是否继续执行流水线(scanCodeIgnoreError)*',
          desc: null
        },
        scanImageIgnoreError: {
          name: '镜像扫描失败情况下是否继续执行流水线(scanImageIgnoreError)*',
          desc: null
        },
        checkDeployIgnoreError: {
          name: '容器发布检查失败情况下是否继续执行流水线(checkDeployIgnoreError)*',
          desc: null
        },
        apiTestingIgnoreError: {
          name: '接口测试失败情况下是否继续执行流水线(apiTestingIgnoreError)*',
          desc: null
        },
        performanceTestingIgnoreError: {
          name: '性能测试失败情况下是否继续执行流水线(performanceTestingIgnoreError)*',
          desc: null
        },
        webuiTestingIgnoreError: {
          name: '界面测试失败情况下是否继续执行流水线(webuiTestingIgnoreError)*',
          desc: null
        }
      },
      originLogWebsocket$: null,
      originDirectiveWebsocket$: null,
      errMsgPipelineDef: '',
      cicdCustomStepInserts: {},
      InsertDefNames: [],
      monacoOptions: {
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
      },
      singleMonacoOptions: {
        value: '',
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
        language: "yaml"
      },
      original: '',
      modified: '',
      commitHashList: [],
      historyForm: {
        defName: '',
        branchName: '',
        envName: '',
        customStepName: '',
        createTimeRage: {
          startDate: '',
          endDate: ''
        }
      },
      historyDialog: false,
      dates:[],
      menu2: false,
      contentForm: {
        defName: '',
        branchName: '',
        envName: '',
        customStepName: '',
        commitHash: ''
      },
      pipelineList: [],
      stepDesc: {
        gitPull: '拉取代码',
        createRunFiles: '创建流水线运行文件',
        build: '编译构建代码',
        scanCode: '代码扫描',
        packageImage: '容器镜像打包上传',
        scanImage: '容器镜像扫描',
        artifact: '制品打包上传',
        syncImage: '同步生产环境镜像到集成环境',
        deploy: '容器应用部署',
        applyIngress: '部署ingress',
        applyMesh: '服务网格设置',
        checkDeploy: '容器应用状态检查',
        checkQuota: '项目容器资源配额检查',
        deployArtifact: '主机应用部署',
        testApi: '接口自动化测试',
        testPerformance: '性能自动化测试',
        testWebui: '界面自动化测试'
      },
      customDialog: false,
      customList: [],
      customSteps: [],
      targetName: '',
      stepInformation: null,
      textName: ''
    }
  },
  methods: {
    abortRun (runName) {
      request.patch(`/cicd/run/${runName}`).then(response => {
      }).catch(_ => {})
    },
    reRun (pipelineName) {
      request.post(`/cicd/pipeline/${pipelineName}`).then(response => {
        this.$router.push({
          name: 'CicdRun',
          params: {
            runName: response.data.runName
          }
        })
      })
    },
    topRun (runName) {
      const vm = this
      request.post(`/cicd/queue/${runName}/top`).then(response => {
        vm.successTip(true, response.msg)
        vm.$router.push({
          name: 'CicdQueue'
        })
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
        // console.log(error)
      })
    },
    goProjectDef(projectName) {
      const vm = this
      vm.$router.push({
        name: 'CicdProjectDef',
        params: {
          projectName: projectName
        }
      })
    },
    getPipelineDef (projectName, branchName) {
      const vm = this
      vm.targetProjectName = projectName
      vm.targetBranchName = branchName
      request.get(`/cicd/projectDef/${projectName}/${branchName}/pipelineDef`).then((response) => {
        vm.pipelineDefForm = response.data.pipelineDef
        vm.errMsgPipelineDef = response.data.errMsgPipelineDef
        vm.organizeData()
        vm.textName = ''
        vm.stepInformation = null
        vm.pipelineDefDialog = true
      }).catch((error) => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    organizeData() {
      const vm = this
      var pipelineList = []
      Object.keys(vm.pipelineDefForm.pipelineStep).map((item, i) => {
        let obj = {
          name: '',
          hint: '',
          data: '',
          type: '',
          isPush: true
        }
        if (item === 'gitPull' || item === 'syncImage') {
          obj.isPush = false
        } else {
          obj.isPush = true
        }
        obj.name = item
        obj.hint = vm.stepDesc[item]
        obj.type = 'original'
        obj.data = vm.pipelineDefForm.pipelineStep[item]
        pipelineList.push(obj)
      })
      pipelineList.splice(1, 0, {
        name: 'createRunFiles',
        hint: '创建流水线运行文件',
        data: null,
        type: 'original',
        isPush: true
      })
      vm.pipelineList = pipelineList
      vm.pipelineList.forEach((row, i) => {
        if (vm.pipelineDefForm.customStepInsertDefs[row.name] !== undefined) {
          vm.pipelineDefForm.customStepInsertDefs[row.name].forEach(c => {
            console.log(row.name, c, i)
            vm.pipelineList.splice(i + 1, 0, {
              name: c,
              hint: '',
              type: 'custom',
              higher: row.name,
              data: vm.pipelineDefForm.customStepPhaseDefs[c]
            })
          })
        }
      })
      console.log(vm.pipelineList)
    },
    addStep() {
      const vm = this
      vm.pipelineDefForm.customStepInsertDefs[vm.targetName] = vm.customSteps
      vm.customDialog = false
      if (vm.pipelineDefForm.customStepInsertDefs[vm.targetName] === undefined || vm.pipelineDefForm.customStepInsertDefs[vm.targetName].length <= 0) {
        delete vm.pipelineDefForm.customStepInsertDefs[vm.targetName]
      }
      vm.organizeData()
      console.log(vm.pipelineDefForm)
    },
    openAddStep(item) {
      const vm = this
      if (item.isPush) {
        vm.targetName = item.name
        vm.customList = vm.cicdCustomStepInserts[vm.targetName]
        vm.customDialog = true
        vm.customSteps = vm.pipelineDefForm.customStepInsertDefs[vm.targetName]
        console.log(vm.customList)
      }
    },
    deleteStep(item) {
      const vm = this
      vm.pipelineDefForm.customStepInsertDefs[item.higher].forEach((row, i) => {
        if (row === item.name) {
          vm.pipelineDefForm.customStepInsertDefs[item.higher].splice(i, 1)
        }
      })
      if (vm.pipelineDefForm.customStepInsertDefs[item.higher].length <= 0) {
        delete vm.pipelineDefForm.customStepInsertDefs[item.higher]
      }
      vm.organizeData()
      console.log(vm.pipelineDefForm)
    },
    addInsertDef() {
      const vm = this
      var addItem = [ '', [] ]
      vm.pipelineDefForm.customStepInsertDefs.unshift(addItem)
    },
    deleteInsertDef(i) {
      const vm = this
      vm.pipelineDefForm.customStepInsertDefs.splice(i, 1)
    },
    updatePipelineDef () {
      const vm = this;
      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
      var YAMLstring = YAML.stringify(copyData, 4);
      request.post(`/cicd/projectDef/${vm.targetProjectName}/pipelineDef`, {
        pipelineDefYaml: YAMLstring,
        branchName: vm.targetBranchName
      }).then((response) => {
        vm.successTip(true, response.msg)
        vm.pipelineDefDialog = false
        console.log(vm.runName$)
        request.get(`/cicd/run/${vm.runName$}`).then(response => {
          vm.cicdCustomStepInserts = response.data.cicdCustomStepInserts
          vm.errMsgPipelineDef = response.data.errMsgPipelineDef
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }).catch((error) => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    openYaml () {
      const vm = this;
      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
      vm.yamlText = YAML.stringify(copyData, 4);
      vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
      vm.YAMLDialog = true
    },
    closeYaml () {
      const vm = this
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false
    },
    runLog(runName, stepID) {
      const vm = this
      vm.logPreview = []
      vm.auditDialog = true
      vm.ws = new WebSocket(`${vm.GLOBAL}/ws/log/run/${runName}?kind=log&stepID=${stepID}&x-user-token=${vm.userToken}`)
      const logPreviewData = []
      const setLogPreview = debounce(function (logPreviewData) {
        vm.logPreview = cloneDeep(logPreviewData)
      }, 500, {
        leading: true
      })
      vm.ws.onmessage = (event) => {
        logPreviewData.push(JSON.parse(event.data))
        setLogPreview(logPreviewData)
      }
      vm.ws.onclose = () => {
        logPreviewData.push({ logType: 'END' })
        vm.disableBtn = false
      }
    },
    historyClose() {
      const vm = this
      vm.historyDialog = false
      vm.dates = []
      vm.contentForm.commitHash = ''
      vm.original = ''
      vm.modified = ''
      vm.$refs.monacoDiff.originalModel.setValue('')
      vm.$refs.monacoDiff.modifiedModel.setValue('')
    },
    getHistory() {
      const vm = this
      var dates = vm.dates.sort()
      vm.historyForm.createTimeRage.startDate = dates[0]
      vm.historyForm.createTimeRage.endDate = dates[1]
      vm.menu2 = false
      request.post(`/cicd/projectDef/${vm.targetProjectName}/history`, vm.historyForm).then(response => {
        vm.commitHashList = response.data.logs
        if(vm.commitHashList.length > 0){
          vm.getOriginal()
          vm.getModified()
        }else{
          vm.original = ''
          vm.modified = ''
          vm.$refs.monacoDiff.originalModel.setValue('')
          vm.$refs.monacoDiff.modifiedModel.setValue('')
        }
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg);
      })
    },
    getOriginal() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      if(vm.commitHashList.length > 0){
        vm.contentForm.commitHash = vm.commitHashList[0].commitHash
        vm.commitHashList[0].disabled = true
      }
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.original = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    getModified() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      if(vm.commitHashList.length > 1){
        vm.contentForm.commitHash = vm.commitHashList[1].commitHash
      }
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.modified = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    getHistoryContent() {
      const vm = this
      vm.contentForm.defName = vm.historyForm.defName
      vm.contentForm.branchName = vm.historyForm.branchName
      vm.contentForm.envName = vm.historyForm.envName
      vm.contentForm.customStepName = vm.historyForm.customStepName
      vm.dialogLoading = true
      request.post(`/cicd/projectDef/${vm.targetProjectName}/content`, vm.contentForm).then(response => {
        vm.modified = response.data.content
        vm.dialogLoading = false
        vm.$refs.monacoDiff.originalModel.setValue(vm.original)
        vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg); 
      })
    },
    pipelineDefHistory(branchName) {
      const vm = this
      vm.historyForm = {
        defName: 'pipelineDef',
        branchName: branchName,
        envName: '',
        customStepName: '',
        createTimeRage: {
          startDate: '',
          endDate: ''
        }
      }
      vm.dates = []
      vm.getHistory()
      vm.historyDialog = true
    },
    updateDef() {
      const vm = this
      if(vm.modified !== ''){
        request.post(`/cicd/projectDef/${vm.targetProjectName}/pipelineDef`,{
          pipelineDefYaml: vm.modified,
          branchName: vm.targetBranchName
        }).then(response => {
          vm.historyDialog = false
          vm.pipelineDefDialog = false
          vm.successTip(true, response.msg);
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }else{
        vm.warnTip(true, '无历史版本！')
      }
    },
    clearDates() {
      this.dates = []
      this.menu2 = false
      this.getHistory()
    },
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    STEPS_API.getStepActions().then(response => {
      vm.statusItems = response.data.statusResults
      vm.stepItems = response.data.stepActions
      vm.moduleItems = response.data.moduleTypes
      vm.moduleNames = response.data.moduleNames
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg)
    })
    vm.$watchAsObservable('tab').pipe(
      pluck('newValue')
    ).subscribe(next => {
      if (next === 1) {
        vm.$observables.queryCommitsPage$.next('tabChange')
      } else if (next === 3) {
        vm.$observables.queryStepsPage$.next('tabChange')
      }
    })
    vm.$observables.queriedRunInfo$.pipe(
      filter(next => next),
      tap(next => {
        vm.cardLoading = false
        vm.run = next.data.run
        vm.errMsgPipelineDef = next.data.errMsgPipelineDef
        if(next.data.errMsgPipelineDef === undefined){
          vm.errMsgPipelineDef = ''
        }
        vm.cicdCustomStepInserts = next.data.cicdCustomStepInserts
        vm.modules = next.data.modules
      }),
      map(next => {
        return [
          vm.run.projectName,
          vm.run.pipelineName,
          Number(vm.$route.params.runName.split('-')[vm.$route.params.runName.split('-').length - 1]),
          next
        ]
      }),
      filter(next => {
        return vm.stepsForm.projectNames[0] !== next[0] || vm.stepsForm.pipelineNames[0] !== next[1] || vm.stepsForm.runNumber !== next[2]
      }),
      tap(next => {
        vm.stepsForm.projectNames = [next[0]]
        vm.stepsForm.pipelineNames = [next[1]]
        vm.stepsForm.runNumber = next[2]
        // vm.$observables.queryStepsPage$.next('runLoadedAndParamChanged')
        // vm.$observables.queryCommitsPage$.next('runLoadedAndParamChanged')
      }),
      map(next => next[3]),
      filter(next => {
        const status = next.data.run.status.result
        return status !== 'SUCCESS' && status !== 'ABORT' && status !== 'FAIL'
      })
    ).subscribe(next => {
    })
    vm.$observables.queryCommitsPage$.pipe(
      tap(next => {
        vm.commitsPageData.loading = true
      }),
      mergeMap(next => {
        return defer(() => {
          return COMMITS_API.getCommits(Object.assign({}, {
            projectNames: [vm.run.projectName],
            runName: vm.$route.params.runName
          }, {
            page: vm.commitsPageData.currentPage,
            perPage: vm.commitsPageData.pageSize
          }))
        }).pipe(
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
          catchError(err => {
            console.log(err)
            vm.snackbar.show = true
            vm.snackbar.text = err.response.data.msg
            vm.snackbar.color = 'error'
            vm.commitsPageData.loading = false
            return of(null)
          })
        )
      })
    ).subscribe(response => {
      vm.commitsPageData.loading = false
      vm.commitsPageData.rows = response.data.commits
      vm.commitsPageData.total = response.data.totalCount
      vm.commitsPageData.expanded = []
    })

    vm.$observables.queryStepsPage$.pipe(
      tap(next => {
        vm.stepsPageData.loading = true
      }),
      withLatestFrom(vm.$observables.runName$),
      mergeMap(([next, runName]) => {
        return defer(() => {
          return STEPS_API.getSteps(Object.assign({}, { ...vm.stepsForm }, {
            page: vm.stepsPageData.currentPage,
            perPage: vm.stepsPageData.pageSize
          }))
        }).pipe(
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
          catchError(err => {
            vm.snackbar.show = true
            vm.snackbar.text = err.response.data.msg
            vm.snackbar.color = 'error'
            vm.stepsPageData.loading = false
            return of(null)
          })
        )
      })
    ).subscribe(response => {
      vm.stepsPageData.loading = false
      vm.stepsPageData.rows = response.data.steps
      vm.stepsPageData.displayRows = response.data.steps
      vm.stepsPageData.total = response.data.totalCount
      vm.stepsPageData.expanded = []
    })

    let logWebsocket$ = null
    let reactiveWebsocket$ = null
    logWebsocket$ = vm.$observables.runName$.pipe(
      switchMap(next => {
        vm.originLogWebsocket$ = webSocket({
          url: `${vm.GLOBAL}/ws/log/run/${next}?kind=log&x-user-token=${userService.userObj$.getValue().userToken}`
        })
        return vm.originLogWebsocket$.pipe(
          catchError(err => {
            // console.log(err)
            return of({ logType: 'END' })
          })
        )
      }),
      filter(next => next),
      // tap(console.log),
      // filter(next => false),
      share()
    )
    reactiveWebsocket$ = vm.$observables.runName$.pipe(
      switchMap(next => {
        vm.originDirectiveWebsocket$ = webSocket({
          url: `${vm.GLOBAL}/ws/log/run/${next}?kind=directive&x-user-token=${userService.userObj$.getValue().userToken}`
        })
        return vm.originDirectiveWebsocket$.pipe(
          catchError(err => {
            // console.log(err)
            return of(null)
          })
        )
      }),
      filter(next => next),
      // tap(console.log),
      // filter(next => false),
      share()
    )
    vm.$subscribeTo(combineLatest([
      logWebsocket$.pipe(
        scan((acc, value) => {
          acc.push(value)
          return acc
        }, []),
        auditTime(500)
      ),
      vm.$observables.graphNodeClick$.pipe(
        startWith({ node: { data: {} }, index: 0 }),
        tap(({ node, index }) => {
          if (!node || isEmpty(node.data)) {
            vm.selectedList = vm.pipelineData.map(_ => false)
            vm.phaseSelectedList = vm.phasePipelineData.map(_ => false)
          } else if (node.data.stageID === '') {
            vm.selectedList = vm.pipelineData.map(_ => false)
            vm.phaseSelectedList = vm.phasePipelineData.map((_, nodeIndex) => nodeIndex === index)
          } else {
            vm.selectedList = vm.pipelineData.map((_, nodeIndex) => nodeIndex === index)
            vm.phaseSelectedList = vm.phasePipelineData.map(_ => false)
          }
        }),
        pluck('node')
      )
    ]), {
      next (next) {
        const logList = next[0]
        const nodeClick = next[1]
        const nodeStageId = nodeClick.data.stageID || ''
        const nodePhaseId = nodeClick.data.phaseID || ''
        vm.logList = logList.filter(row => {
          if (
            !nodeClick || (nodeStageId === '' && nodePhaseId === '') ||
            (nodeStageId !== '' && row.phaseID === nodePhaseId && row.stageID === nodeStageId) ||
            (nodeStageId === '' && row.phaseID === nodePhaseId)
          ) {
            return true
          } else {
            return false
          }
        })
        if (vm.scrollToEnd) {
          vm.$nextTick(() => {
            vm.$vuetify.goTo('#log' + (vm.logList.length - 1), {
              duration: 500
            })
            vm.$observables.stepsLogCompleted$.next('')
          })
        } else {
          vm.$nextTick(() => {
            vm.$observables.stepsLogCompleted$.next('')
          })
        }
      },
      error () {},
      complete () {}
    })
    const reactiveData$ = reactiveWebsocket$.pipe(
      bufferTime(500),
      filter(next => next && next.length > 0),
      scan((acc, nextArr) => {
        acc.inputConfigData = {}
        nextArr.forEach((next, index) => {
          const reactiveKey = next.phaseID + '_' + next.stageID + '_' + next.stepID
          let reactiveObj = acc.reactiveMap[reactiveKey]
          if (!reactiveObj) {
            acc.reactiveMap[reactiveKey] = {
              dataList: []
            }
            reactiveObj = acc.reactiveMap[reactiveKey]
          }
          reactiveObj.dataList.push(next)

          if (next.logType === 'INPUT') {
            // console.log(next)
            acc.inputConfigData = next
          }
          if (next.logType === 'CREATE' && next.stepID === '' && next.stageID === '' && next.phaseID !== '') {
            acc.phasePipelineData.push({
              name: next.content,
              hint: next.content,
              status: 'aborted',
              data: next,
              next: [{ index: acc.phasePipelineData.length + 2, weight: 0 }]
            })
            reactiveObj.phasePipeLineIndex = acc.phasePipelineData.length - 1
          } else if (next.logType !== 'CREATE' && next.stepID === '' && next.stageID === '' && next.phaseID !== '') {
            acc.phasePipelineData[reactiveObj.phasePipeLineIndex].status = statusMap[next.logType]
          } else if (next.logType === 'CREATE' && next.stepID === '' && next.stageID !== '' && next.phaseID !== '') {
            const pipelineDataMap = acc.pipelineDataMap
            const phaseList = acc.pipelineDataMap.phaseList
            const phaseListLength = phaseList.length
            const lastPhaseID = phaseList[phaseListLength - 1]
            const phaseID = next.phaseID
            const pipelineData = acc.pipelineData
            const pipelineDataLength = acc.pipelineData.length
            if (!pipelineDataMap[phaseID]) {
              const graphNode = {
                name: next.content,
                hint: next.content,
                status: 'aborted',
                data: next,
                next: [{ index: pipelineDataLength + 1, weight: 0 }]
              }
              pipelineData.push(graphNode)
              pipelineDataMap[phaseID] = pipelineDataLength
              const lastPhaseNodesListStartIndex = pipelineDataMap[lastPhaseID]
              for (let i = lastPhaseNodesListStartIndex; i < pipelineDataLength; i++) {
                pipelineData[i].next[0].index = pipelineDataLength
              }
              acc.pipelineDataMap.phaseList.push(next.phaseID)
            } else {
              const graphNode = {
                name: next.content,
                hint: next.content,
                status: 'aborted',
                data: next,
                next: [{ index: pipelineDataLength + 1, weight: 0 }]
              }
              pipelineData.push(graphNode)
              const last2PhaseID = phaseList[phaseListLength - 2]
              const last2PhaseNodesListStartIndex = pipelineDataMap[last2PhaseID]
              pipelineData[last2PhaseNodesListStartIndex].next.push({ index: pipelineDataLength, weight: 0 })
              const lastPhaseNodesListStartIndex = pipelineDataMap[lastPhaseID]
              for (let i = lastPhaseNodesListStartIndex; i < pipelineDataLength; i++) {
                pipelineData[i].next[0].index = pipelineDataLength + 1
              }
            }
            reactiveObj.pipeLineDataIndex = acc.pipelineData.length - 1
          } else if (next.logType !== 'CREATE' && next.stepID === '' && next.stageID !== '' && next.phaseID !== '') {
            acc.pipelineData[reactiveObj.pipeLineDataIndex].status = statusMap[next.logType]
          } else if (next.logType === 'CREATE' && next.stepID !== '') {
            acc.stepsList.push(reactiveObj.dataList)
          }
        })
        return acc
      }, {
        runResult: null,
        reactiveMap: {},
        phasePipelineData: [],
        pipelineData: [{
          name: 'Start',
          hint: 'start',
          status: 'start',
          next: [{ index: 1, weight: 0 }],
          data: {}
        }],
        pipelineDataMap: {
          phaseList: ['graphStartNode'],
          graphStartNode: 0
        },
        stepsList: [],
        inputConfigData: {}
      }),
      // tap(next => {console.log(next)}),
      shareReplay(1)
    )
    vm.$subscribeTo(reactiveData$.pipe(
      tap(next => {
        const startTime = new Date().getTime()
        vm.phasePipelineData = [
          {
            name: 'Start',
            hint: 'start',
            status: 'start',
            next: [
              { index: 1, weight: 0 }
            ],
            data: {}
          }, ...next.phasePipelineData, {
            name: 'End',
            hint: 'finish',
            // status: vm.phasePipelineData[vm.phasePipelineData.length - 1].status,
            get status () {
              return statusMap[vm.run.status.result] || 'end'
            },
            next: [],
            data: {}
          }
        ]
        vm.pipelineData = [
          ...next.pipelineData, {
            name: 'End',
            hint: 'finish',
            // status: vm.pipelineData[vm.pipelineData.length - 1].status,
            get status () {
              return statusMap[vm.run.status.result] || 'end'
            },
            next: [],
            data: {}
          }
        ]
        // console.log('赋值:', new Date() - startTime)
        vm.$nextTick(() => {
          // console.log('dom:', new Date() - startTime)
        })
      })
    ), () => {})
    vm.$subscribeTo(combineLatest([
      reactiveData$,
      vm.$observables.graphNodeClick$.pipe(
        pluck('node')
      )]).pipe(
      map(next => {
        const reactiveMap = next[0].reactiveMap
        const clickNode = next[1].data || {}
        const reactiveObj = reactiveMap[clickNode.phaseID + '_' + clickNode.stageID + '_'] || {
          dataList: []
        }
        return [...(reactiveObj.dataList)]
      }),
      distinctUntilChanged((x, y) => {
        return JSON.stringify(x) === JSON.stringify(y)
      })
    ), next => {
      const currentSelectNodeData = {}
      next.forEach(row => {
        currentSelectNodeData.logType = row.logType
        currentSelectNodeData.nodeType = (() => {
          if (row.phaseID === '') {
            return 'run'
          } else if (row.stageID === '') {
            return '阶段'
          } else if (row.stepID === '') {
            return '环节'
          } else {
            return '步骤'
          }
        })()
        if (row.logType === 'CREATE') {
          currentSelectNodeData.nodeName = row.content
        } else if (row.logType === 'START') {
          currentSelectNodeData.startTime = row.createTime
        } else if (row.logType === 'SUCCESS') {
          currentSelectNodeData.endTime = row.createTime
          currentSelectNodeData.duration = row.content
        } else if (row.logType === 'ABORT') {
          currentSelectNodeData.endTime = row.createTime
          currentSelectNodeData.duration = row.content
        } else if (row.logType === 'FAIL') {
          currentSelectNodeData.endTime = row.createTime
          currentSelectNodeData.duration = row.content
        } else if (row.logType === 'INPUT') {
          // currentSelectNodeData.endTime = row.createTime
          // currentSelectNodeData.duration = row.content
        }
      })
      vm.currentSelectNodeData = currentSelectNodeData
    })

    vm.$subscribeTo(combineLatest([
      reactiveData$,
      vm.$observables.graphNodeClick$.pipe(
        pluck('node'),
        startWith({})
      )
    ]).pipe(
      map(next => {
        const reactiveStepArr = next[0].stepsList
        const clickNode = next[1].data || {}
        if (!clickNode.phaseID || clickNode.phaseID === '') {
          return reactiveStepArr
        } else if (clickNode.stageID === '') {
          return reactiveStepArr.filter(row => {
            return row[0].phaseID === clickNode.phaseID
          })
        } else {
          return reactiveStepArr.filter(row => {
            return row[0].phaseID === clickNode.phaseID && row[0].stageID === clickNode.stageID
          })
        }
      }),
      distinctUntilChanged((x, y) => {
        return JSON.stringify(x) === JSON.stringify(y)
      })
    ), (next) => {
      vm.stepsList = next
    })

    vm.$subscribeTo(reactiveData$.pipe(
      filter(next => next.inputConfigData && !isEmpty(next.inputConfigData)),
      tap(next => {}),
      withLatestFrom(vm.$observables.runName$),
      mergeMap(next => {
        return request.get(`/cicd/run/${next[1]}/input`)
      }),
      tap(next => {
        const inputResponse = next
        if (inputResponse.data.phaseID === '') {
          vm.inputConfigMap = {}
        } else {
          vm.inputConfigMap = Object.assign({}, inputResponse, {
            model: inputResponse.data.options.length === 0 ? 'CONFIRM' : ''
          })
          vm.$nextTick(() => {
            vm.$vuetify.goTo('#inputConfigForm', {
              offset: 20
            })
          })
        }
      }),
      delayWhen(next => vm.$observables.stepsLogCompleted$),
      tap(next => {
        if (next.data.phaseID !== '') {
          vm.$vuetify.goTo('#inputConfigForm', {
            offset: 20
          })
        }
      })
    ), (next) => {})

    /* vm.$subscribeTo(reactiveWebsocket$.pipe(
      filter(next => next.logType === 'INPUT'),
      map(next => {
        const findStepArr = vm.stepsList.find(stepArr => next.stepID === stepArr[0].stepID)
        return [next, findStepArr]
      }),
      tap(([next, findStepArr]) => {
        if (!findStepArr) {
          vm.$observables.graphNodeClick$.next({ node: { data: {} } })
        }
      }),
      delayWhen(([next, findStepArr]) => {
        if (findStepArr) {
          return of(null)
        } else {
          return vm.$observables.stepsLogCompleted$
        }
      }),
      map(([next, findStepArr]) => {
        if (!findStepArr) {
          findStepArr = vm.stepsList.find(stepArr => next.stepID === stepArr[0].stepID)
        }
        return [next, findStepArr]
      }),
      withLatestFrom(vm.$observables.runName$),
      mergeMap(next => {
        return forkJoin([
          of(next[0]),
          request.get(`/cicd/run/${next[1]}/input`)
        ])
      })
    ), (next) => {
      const findStepArr = next[0][1]
      const inputResponse = next[1]
      vm.$set(findStepArr[0], 'inputConfig', inputResponse)
      if (inputResponse.data.phaseID === '') {
        vm.inputConfigMap = {}
      } else {
        vm.inputConfigMap = Object.assign({}, inputResponse, {
          model: inputResponse.data.options.length === 0 ? 'CONFIRM' : inputResponse.data.options[0].value
        })
        vm.$nextTick(() => {
          vm.$vuetify.goTo('#inputConfigForm', {
            offset: 20
          })
        })
      }
    }) */

    const filteredQueriedRunInfo$ = vm.$observables.queriedRunInfo$.pipe(
      tap(next => {
        // vm.phasePipelineData[vm.phasePipelineData.length - 1].status = statusMap[next.data.run.status.result]
        // vm.pipelineData[vm.pipelineData.length - 1].status = statusMap[next.data.run.status.result]
      }),
      filter(next => {
        const status = next.data.run.status.result
        return status !== 'SUCCESS' && status !== 'ABORT' && status !== 'FAIL' && status !== 'PAUSE'
        // return true
      }),
      shareReplay(1)
    )
    vm.$subscribeTo(reactiveWebsocket$.pipe(
      mergeMap(reactiveItem => {
        return filteredQueriedRunInfo$.pipe(
          map(_ => reactiveItem)
        )
      }),
      distinctUntilChanged((x, y) => {
        return !(
          (x.logType === 'INPUT' && ['START', 'CREATE'].includes(y.logType)) ||
          y.logType === 'INPUT' ||
          (y.phaseID === '' && ['SUCCESS', 'ABORT', 'FAIL'].includes(y.logType))
        )
      })
    ), next => {
      if (['SUCCESS', 'INPUT', 'FAIL'].includes(next.logType)) {
        vm.run.status.result = next.logType
      } else if (next.logType === 'ABORT') {
        vm.run.status.result = 'ABORT'
        vm.run.abortUser = User.getInstance().state.userObj.username
      } else {
        vm.run.status.result = 'RUNNING'
      }
      // vm.phasePipelineData[vm.phasePipelineData.length - 1].statue = statusMap[vm.run.status.result]
      // vm.pipelineData[vm.pipelineData.length - 1].statue = statusMap[vm.run.status.result]
    })
  },
  mounted () {
    const vm = this
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          vm.logAbsoluteBtn = 'absolute'
        } else if (entry.isIntersecting === false && entry.boundingClientRect.top <= 70) {
          vm.logAbsoluteBtn = 'fixed'
        } else if (entry.isIntersecting === false && entry.boundingClientRect.top >= window.innerHeight) {
          vm.logAbsoluteBtn = 'absolute'
        }
      })
    }, {
      rootMargin: '-70px 0px 0px 0px',
      threshold: [0, 1]
    })
    io.observe(vm.$refs.outputRunLogDiv)
  },
  filters: {
    changeColor: function (value) {
      if (value == 'ERROR') {
        return { color: 'red' }
      } else if (value == 'WARNING') {
        return { color: 'orange' }
      } else {
        return null
      }
    }
  },
  beforeDestroy () {
    const vm = this
    // console.log('before destroy')
    vm.originLogWebsocket$.error({ code: 1005, reason: 'page destroy' })
    vm.originLogWebsocket$.complete()
    // vm.originDirectiveWebsocket$.error({ code: 1005, reason: 'page destroy' })
    vm.originDirectiveWebsocket$.complete()
  }
}
</script>

<style scoped lang="scss">
.pipeline-wrap .v-chip.v-size--default {
  height: 42px;
  margin-top: 8px;
}
.pipeline-switch .v-input--selection-controls {
  margin-top: 0px;
}
.pipeline-wrap {
  overflow-y: auto;
}
.pipeline-wrap .v-breadcrumbs{
  flex-wrap: nowrap;
  padding: 18px 0;
}
.step-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}
.step-item.avtive {
  background-color: #D1D1D1;
}
.step-icon {
  width: 24px;
  height: 24px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  line-height: 24px;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  user-select: none;
}
.step-icon.off {
  background-color: #607D8B;
}
.original-icon {
  background-color: #2196F3;
}
.custom-icon {
  background-color: #4CAF50;
}
.modules-item {
  cursor: pointer;
}
.steps-switch {
  width: 50%;
}
.yaml-btn {
  background-color: #fff !important;
  box-shadow: none !important;
}
.yaml-btn:hover::before {
  opacity: 0 !important;
}
.form-item-15 {
  width: 15%;
}
.form-item-20 {
  width: 20%;
}
.form-item {
  width: 30%;
}
.form-item-40 {
  width: 40%;
}
.form-item-45 {
  width: 45%;
}
.form-item-50 {
  width: 50%;
}
.form-item-60 {
  width: 60%;
}
.form-item-70 {
  width: 70%;
}
.form-item-100 {
  width: 100%;
}
.yaml-btn {
  background-color: #fff !important;
  box-shadow: none !important;
}
.yaml-btn:hover::before {
  opacity: 0 !important;
}
.pr-20 {
  padding-right: 80px;
}
.tip-color {
  color: rgba(0, 0, 0, 0.6);
}
.error-text {
  font-size: 16px;
  font-weight: 400;
  color: #ff5252;
}
.params-item {
  padding: 8px;
  border: 1px solid #d2c7c7;
  border-radius: 5px;
  margin-bottom: 16px;
}
</style>
