<template>
  <PageCard name="流水线">
    <VCard style="width: 100%" flat :loading="cardLoading" v-if="pipelineData">
      <VCardText>
        <VCard class="mb-4">
          <VCardTitle>
            <span>流水线信息</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" small color="primary" @click="goProjectDef(pipelineData.projectInfo.projectName)">项目定义</v-btn>
            <v-btn v-if="pipelineData.pipeline.branchName" small :color="errMsgPipelineDef === '' ? 'primary' : 'error'" class="mr-2" @click="getPipelineDef(pipelineData.projectInfo.projectName, pipelineData.pipeline.branchName)">流水线定义</v-btn>
            <v-btn small color="primary" @click="runPipeline(pipelineData.pipeline.pipelineName)">运行</v-btn>
          </VCardTitle>
          <VCardText>
            <v-simple-table dense v-if="pipelineData">
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">
                    流水线名称
                  </th>
                  <th class="text-left">
                    分支名称
                  </th>
                  <th class="text-left">
                    集成环境
                  </th>
                  <th class="text-left">
                    正式环境
                  </th>
                  <th class="text-left">
                    成功/失败/终止次数
                  </th>
                  <th class="text-left">
                    最新启动
                  </th>
                  <th class="text-left">
                    最新运行结果
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{{ pipelineData.pipeline.pipelineName }}</td>
                  <td>{{ pipelineData.pipeline.branchName }}</td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in pipelineData.pipeline.envs" :key="index">
                        <v-chip color="primary" small>{{ item }}</v-chip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in pipelineData.pipeline.envProductions" :key="index">
                        <v-chip color="primary" small>{{ item }}</v-chip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <span class="green--text">{{ pipelineData.pipeline.successCount }}</span>/
                    <span class="red--text">{{ pipelineData.pipeline.failCount }}</span>/
                    <span class="grey--text">{{ pipelineData.pipeline.abortCount }}</span>
                  </td>
                  <td>{{ pipelineData.pipeline.status.startTime }}</td>
                  <td>
                    <template>
                      <div>{{ pipelineData.pipeline.status.duration }}</div>
                      <v-chip v-if="pipelineData.pipeline.status.result == 'FAIL'" small class="mb-1 white--text" color="red">
                        {{ pipelineData.pipeline.status.result }}
                      </v-chip>
                      <v-chip v-else-if="pipelineData.pipeline.status.result == 'SUCCESS'" small class="mb-1 white--text" color="green">
                        {{ pipelineData.pipeline.status.result }}
                      </v-chip>
                      <v-chip v-else-if="pipelineData.pipeline.status.result == 'INPUT'" small class="mb-1 white--text" color="orange">
                        {{ pipelineData.pipeline.status.result }}
                      </v-chip>
                      <v-chip v-else-if="pipelineData.pipeline.status.result == 'RUNNING'" small class="mb-1 white--text" color="blue">
                        {{ pipelineData.pipeline.status.result }}
                      </v-chip>
                      <v-chip v-else-if="pipelineData.pipeline.status.result == 'ABORT'" small class="mb-1 white--text" color="grey">
                        {{ pipelineData.pipeline.status.result }}
                      </v-chip>
                    </template>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </VCardText>
        </VCard>
        <VCard class="mb-4">
          <VCardTitle>
            项目基础信息
          </VCardTitle>
          <VCardText>
            <v-simple-table dense v-if="pipelineData">
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
                      <router-link :to="{ name: 'CicdProject', params: { projectName: pipelineData.projectInfo.projectName }}">
                        <span>{{ pipelineData.projectInfo.projectName }}</span><span>（{{ pipelineData.projectInfo.projectShortName }}）</span>
                        <div>{{ pipelineData.projectInfo.projectDesc }}</div>
                      </router-link>
                    </template>
                  </td>
                  <td>{{ pipelineData.projectInfo.projectTeam }}</td>
                  <td>
                    <div class="repo-wrap">
                      <div class="mb-1">
                        <a target="_Blank" :href="pipelineData.projectRepo.gitRepo">
                          <v-chip small color="success">代码仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="pipelineData.projectRepo.imageRepo">
                          <v-chip small color="success">镜像仓库</v-chip>
                        </a>
                      </div>
                      <div class="mb-1">
                        <a target="_Blank" :href="pipelineData.projectRepo.artifactRepo">
                          <v-chip small color="success">制品仓库</v-chip>
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in pipelineData.projectNodePorts" :key="index">
                        <VChip color="primary" small>
                          {{ item.nodePortStart }}-{{ item.nodePortEnd }}
                        </VChip>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template>
                      <div class="my-1" v-for="(item,index) in pipelineData.projectAvailableEnvs" :key="index">
                        <VChip color="primary" small>
                          {{ item.envName }}
                        </VChip>
                      </div>
                    </template>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </VCardText>
        </VCard>
        <VCard class="mb-4">
          <v-card-text>
            <module-infos v-if="pipelineData" :modules="pipelineData.modules" :projectName="pipelineData.projectInfo.projectName" />
          </v-card-text>
        </VCard>
        <v-card>
          <v-card-title>
            运行记录
            <v-form>
              <v-container class="d-flex flex-wrap">
                <!-- <v-select
                  :items="pipelineItems"
                  label="流水线名称"
                  class="mr-8"
                  dense
                  multiple
                  small-chips
                  clearable
                  v-model="runsForm.pipelineNames"
                ></v-select> -->
                <v-select
                  :items="durationItems"
                  label="运行时长"
                  class="mr-8"
                  dense
                  clearable
                  v-model="runsForm.duration"
                  @change="getRuns()"
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
                        v-model="dateRangeText1"
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
                        @click="clearDates1()"
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
      </VCardText>
    </VCard>
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
        <v-card-text class="mine-css">
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
                v-model="menu3"
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
                  v-model="dates3"
                  range
                  no-title
                  @change="getHistory()"
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
  </PageCard>
</template>

<script>
import InfoCard from "@/lib/ui-lib/components/InfoCard";
import ModuleInfos from "@/components/ModuleInfos";
import PageCard from '@/lib/ui-lib/page-templates/PageCard';
import RunsDataTable from "@/components/RunsDataTable";
import PIPELINE_API from '@/api/cicd/pipeline';
import MODULE_API from '@/api/cicd/module';
import RUNS_API from '@/api/cicd/runs';
import request from '@/utils/request';
import YAML from "yamljs";
import MonacoDiff from "@/lib/monaco/MonacoDiff";
import Monaco from "@/lib/monaco/Monaco";
export default {
  inject: ['successTip', 'errorTip', 'warnTip'],
  name: 'Pipeline',
  components: {
    ModuleInfos,
    InfoCard,
    PageCard,
    RunsDataTable,
    MonacoDiff,
    Monaco
  },
  data () {
    return {
      pipelineData: '',
      cardLoading: true,
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
      dates: [],
      menu2: false,
      pipelineItems: [],
      statusItems: [ 'RUNNING', 'SUCCESS', 'FAIL', 'ABORT', 'INPUT' ],
      durationItems: [ 
        { text: '0-2分钟', value: 1 }, 
        { text: '2-5分钟', value: 2 }, 
        { text: '5-15分钟', value: 3 }, 
        { text: '15-30分钟', value: 4 }, 
        { text: '30分钟以上', value: 5 }
      ],
      runsData: {},
      tableLoading: true,
      targetProjectName: '',
      targetBranchName: '',
      pipelineDefForm: {
        builds: [],
        pipelineStep: {},
        customStepInsertDefs: {},
        customStepPhaseDefs: {}
      },
      pipelineDefDialog: false,
      dialogLoading: false,
      YAMLDialog: false,
      yamlText: "",
      errMsgPipelineDef: '',
      InsertDefNames: [],
      cicdCustomStepInserts: {},
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
      dates3:[],
      menu3: false,
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
  created () {
    const pipelineName = this.$route.params.pipelineName
    this.runsForm.pipelineNames = [pipelineName]
    PIPELINE_API.getPipeline(pipelineName).then(response => {
      this.pipelineData = response.data
      this.errMsgPipelineDef = response.data.pipeline.errMsgPipelineDef
      this.cicdCustomStepInserts = response.data.cicdCustomStepInserts
      this.cardLoading = false
      this.runsForm.projectNames = [response.data.projectInfo.projectName]
      RUNS_API.getRuns(this.runsForm).then(response => {
        // console.log(response.data)
        this.tableLoading = false
        this.runsData = response.data
      }).catch()
    }).catch(error => {
      this.errorTip(true, error.response.data.msg)
      this.timer=setTimeout(() => {
        this.$router.go(-1)
      },2000)
    })
    MODULE_API.getPipelineName().then(response => {
      this.pipelineItems = response.data.pipelineNames
    })
    if(this.runsForm.runNumber == null || this.runsForm.runNumber == '') {
      this.runsForm.runNumber = null
    }else{
      this.runsForm.runNumber = Number(this.runsForm.runNumber)
    }
  },
  methods: {
    clearDates1 () {
      this.dates = []
      this.menu2 = false
      this.getRuns()
    },
    dateRangeSubmit () {
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
    refresh() {
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
      }).catch(error => {
        this.errorTip(true, error.response.data.msg)
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
    getPipelineDef(projectName, branchName) {
      const vm = this;
      vm.targetProjectName = projectName
      vm.targetBranchName = branchName;
      request.get(`/cicd/projectDef/${projectName}/${branchName}/pipelineDef`).then((response) => {
        vm.pipelineDefForm = response.data.pipelineDef;
        vm.organizeData()
        vm.textName = ''
        vm.stepInformation = null
        vm.pipelineDefDialog = true;
      }).catch((error) => {
        vm.errorTip(true, error.response.data.msg);
      });
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
    updatePipelineDef() {
      const vm = this;
      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
      var YAMLstring = YAML.stringify(copyData, 4);
      request.post(`/cicd/projectDef/${vm.targetProjectName}/pipelineDef`, {
        pipelineDefYaml: YAMLstring,
        branchName: vm.targetBranchName,
      }).then((response) => {
        vm.successTip(true, response.msg);
        vm.pipelineDefDialog = false;
        vm.refresh()
      }).catch((error) => {
        vm.errorTip(true, error.response.data.msg);
      });
    },
    openYaml() {
      const vm = this;
      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
      vm.yamlText = YAML.stringify(copyData, 4);
      vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
      vm.YAMLDialog = true;
    },
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
    },
    pageOptions (data){
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
        this.tableLoading = false
        this.runsData = response.data
      }).catch()
    },
    runPipeline (pipelineName) {
      const vm =this
      request.post(`/cicd/pipeline/${pipelineName}`).then(response => {
        console.log(response.data.runName)
        vm.$router.push({
          name: 'CicdRun',
          params: {
            'runName': response.data.runName
          }
        })
      }).catch(_ => {})
    },
    historyClose() {
      const vm = this
      vm.historyDialog = false
      vm.dates3 = []
      vm.contentForm.commitHash = ''
      vm.original = ''
      vm.modified = ''
      vm.$refs.monacoDiff.originalModel.setValue('')
      vm.$refs.monacoDiff.modifiedModel.setValue('')
    },
    getHistory() {
      const vm = this
      var dates = vm.dates3.sort()
      vm.historyForm.createTimeRage.startDate = dates[0]
      vm.historyForm.createTimeRage.endDate = dates[1]
      vm.menu3 = false
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
      vm.dates3 = []
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
          vm.refresh();
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }else{
        vm.warnTip(true, '无历史版本！')
      }
    },
    clearDates3() {
      this.dates3 = []
      this.menu3 = false
      this.getHistory()
    },
  },
  computed: {
    dateRangeText1 () {
      return this.dates.join(' ~ ')
    },
    dateRangeText () {
      return this.dates3.join(' ~ ')
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
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
.pipeline-wrap .v-stepper__header .v-stepper__step {
  flex-shrink: 0;
  justify-content: center;
}
.v-text-field {
  min-width: 300px;
}
.mine-css .v-select {
  width: auto;
}
.v-select {
  width: 280px;
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
</style>
