<template>
  <div class="project pa-4">
    <PageCard name="项目定义查看">
      <v-card class="mb-4" :loading="cardLoading">
        <v-card-title>
          项目基础信息
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="project" class="mb-4">
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
                    项目代码仓库
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <template>
                      <span>{{ project.projectInfo.projectName }}</span><span>（{{ project.projectInfo.projectShortName}}）</span>
                      <div>{{ project.projectInfo.projectDesc }}</div>
                    </template>
                  </td>
                  <td>{{ project.projectInfo.projectTeam }}</td>
                  <td>{{ project.projectInfo.projectGroup }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-simple-table dense v-if="project">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    模块构建定义
                  </th>
                  <th class="text-left">
                    模块镜像打包定义
                  </th>
                  <th class="text-left">
                    容器打包忽略定义
                  </th>
                  <th class="text-left">
                    自定义步骤模块定义
                  </th>
                  <th class="text-left">
                    自定义ops流水线定义
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <template>
                      <v-btn small class="my-1" color="primary" @click="openBuildDef()">模块构建定义</v-btn>
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-btn small class="my-1" :color="project.projectDef.errMsgPackageDefs === '' ? 'primary' : 'error'" @click="openPackageDef()">模块镜像打包定义</v-btn>
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-btn small class="my-1" color="primary" @click="openDockerIgnoreDef()">容器打包忽略定义</v-btn>
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            dark
                            v-bind="attrs"
                            v-on="on"
                            small
                          >
                            自定义步骤模块定义
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(item, index) in project.customStepAvailables"
                            :key="index"
                            link
                          >
                            <v-list-item-title :class="customStepColor(item)" @click="openCustomStepDef(item)">{{ item }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-btn small class="my-1" color="primary" @click="openOpsDef()">ops流水线定义</v-btn>
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          流水线设置信息
        </v-card-title>
        <v-card-text>
          <DefsPipelinesTable
            :pipelines="project.pipelines"
            hideDefaultFooter
            disablePagination
            :goRun="goRun"
            :getPipelineDef="getPipelineDef"
          />
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          环境设置信息
        </v-card-title>
        <v-card-text>
          <v-simple-table dense v-if="project">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    环境名称
                  </th>
                  <th class="text-left">
                    模块容器发布定义
                  </th>
                  <th class="text-left">
                    自定义步骤模块定义
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in project.projectAvailableEnvs" :key="item.envName">
                  <td>
                    <template>
                      {{ item.envName }}
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-btn small class="my-1" :color="item.errMsgDeployContainerDefs === '' ? 'primary' : 'error'" @click="openDeployContainerDef(item.envName)">模块容器发布定义</v-btn>
                    </template>
                  </td>
                  <td>
                    <template>
                      <v-menu offset-y v-if="project.customStepAvailableEnvs.length > 0">
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            dark
                            v-bind="attrs"
                            v-on="on"
                            small
                          >
                            自定义步骤模块定义
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(row, index) in project.customStepAvailableEnvs"
                            :key="index"
                            link
                          >
                            <v-list-item-title :class="customStepEnvColor(item, row)" @click="openCustomStepEnvDef(item, row)">{{ row }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <!-- <div v-else>暂无环境相关自定义步骤</div> -->
                    </template>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </PageCard>
    <v-dialog
      v-model="varsDialog"
      max-width="1200px"
      persistent
    >
      <v-card>
        <v-card-title>
          <v-spacer></v-spacer>
          <v-icon class="ml-4" @click="() => {
            this.varsDialog = false
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <mavon-editor
            :value="vars"
            defaultOpen="preview"
            :boxShadow="false"
            style="z-index:4;"
            :editable="false"
            :subfield="false"
            :toolbarsFlag="false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="opsDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">自定义ops流水线定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="customOpsDefsHistory('customOpsDefs')">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="addOps()">mdi-table-plus</v-icon>
            </template>
            <div>新增配置</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="mx-4" v-bind="attrs" v-on="on" @click="previewOpsDef()" color="primary">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateOpsDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.opsDefDialog = false
            this.$refs.opsDefRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
            v-if="errMsgCustomOpsDefs"
          >
            {{ errMsgCustomOpsDefs }}
          </v-alert>
          <v-form ref="opsDefRef">
            <v-expansion-panels accordion class="buildDef-panel">
              <v-expansion-panel v-for="(item, index) in opsDefForm" :key="index">
                <v-expansion-panel-header>
                  <div class="form-row d-flex justify-space-between" @click.stop="() => {}">
                    <div class="form-item-45">
                      <v-text-field
                        label="自定义ops流水线批处理名称(customOpsName)*"
                        dense
                        v-model="item.customOpsName"
                        hint="例如：tp1-run-all-test"
                        persistent-hint
                        :rules="[v => !!v || '自定义ops流水线批处理名称为必填项']"
                      />
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="自定义ops流水线批处理说明(customOpsDesc)*"
                        dense
                        v-model="item.customOpsDesc"
                        :rules="[v => !!v || '自定义ops流水线批处理说明为必填项']"
                      />
                      <v-tooltip right max-width="350px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>可以使用中文填写流水线的批处理说明</div>
                        <div>批处理说明会出现在ops流水线的操作选择菜单中</div>
                        <div>例如：运行所有自动化测试</div>
                      </div>
                    </v-tooltip>
                    </div>
                  </div>
                  <div class="v-expansion-panel-header__icon">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="success" class="diy-icon" v-bind="attrs" v-on="on" @click.stop="copyOps(index)">mdi-content-copy</v-icon>
                      </template>
                      <span>复制</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="error" class="ml-2 diy-icon" v-bind="attrs" v-on="on" @click.stop="deleteOps(index)">mdi-trash-can-outline</v-icon>
                      </template>
                      <span>删除</span>
                    </v-tooltip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content eager>
                  <div class="form-row d-flex justify-space-between pr-20 mt-4" @click.stop="() => {}">
                    <div class="form-item-100 d-flex align-center">
                      <v-select
                        :items="customOpsSteps"
                        label="批处理执行的步骤(customOpsSteps)*"
                        dense
                        small-chips
                        multiple
                        v-model="item.customOpsSteps"
                        :rules="[v => v.length > 0 || '批处理执行的步骤为必填项']"
                      />
                      <v-tooltip right max-width="350px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>请注意批处理执行步骤的顺序</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="customStepDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">设置自定义步骤模块定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="customStepDefsHistory('customStepDefs', targetCustomStepName)">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="() => {varsDialog = true}">mdi-progress-question</v-icon>
            </template>
            <div>变量说明</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="previewCustomStepDef()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateCustomStepDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.customStepDefDialog = false
            this.$refs.customStepDefRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
            v-if="errMsgCustomStepDefs"
          >
            {{ errMsgCustomStepDefs }}
          </v-alert>
          <v-alert
            prominent
            type="info"
            v-if="customStepUsage"
          >
            <pre>{{ customStepUsage }}</pre>
          </v-alert>
          <v-form ref="customStepDefRef">
            <div class="form-row d-flex justify-space-between">
              <div class="form-item-45">
                <v-text-field
                  label="自定义步骤名(customStepName)*"
                  dense
                  v-model="customStepDefForm.customStepName"
                  disabled
                />
              </div>
              <div class="form-item-45 d-flex align-center">
                <v-select
                  :items="project.customStepEnableModes"
                  label="自定义步骤的启用模式(enableMode)"
                  dense
                  v-model="customStepDefForm.customStepDef.enableMode"
                  @change="enableModeChange($event)"
                ></v-select>
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>手动模式必须设置manualEnable表示是否启用本模块</div>
                    <div>选择其他模式表示对应的内置模块被设置为启用的时候，本自定义步骤模块为启用。自动模式必须设置relatedStepModules，支持设置多个模块，任何一个设置的模块被设置为启用，那么本模块则设置为启用</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="form-row mt-4">
              <small>自定义步骤的模块设置(customStepModuleDefs)*</small>
              <v-icon color="success" class="ml-2" @click="addCustomStepModuleDefs()">mdi-table-plus</v-icon>
              <div class="d-flex justify-space-between mt-4" v-for="(item, index) in customStepDefForm.customStepDef.customStepModuleDefs" :key="index">
                <div class="form-item-15">
                  <v-text-field
                    label="模块名称(moduleName)*"
                    dense
                    v-model="item.moduleName"
                    hint="例如：tp1-test-app"
                    persistent-hint
                    :rules="[v => !!v || '模块名称为必填项']"
                  />
                </div>
                <div class="form-item-15">
                  <v-select
                    v-if="manualEnableFlag"
                    :items="[ true, false ]"
                    label="手动启用模式(manualEnable)"
                    dense
                    hint="手工设置本模块是否启用"
                    persistent-hint
                    v-model="item.manualEnable"
                  />
                  <div class="d-flex align-center" v-if="relatedStepModulesFlag">
                    <v-select
                      :items="relatedStepModules"
                      label="相关启用的步骤模块(relatedStepModules)*"
                      dense
                      small-chips
                      multiple
                      v-model="item.relatedStepModules"
                      :rules="[v => v.length > 0 || '模相关启用的步骤模块为必填项']"
                    />
                    <v-tooltip right max-width="350px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>支持设置多个模块，任何一个设置的模块被设置为启用，那么本模块则设置为启用</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
                <div class="form-item-50 d-flex align-center">
                  <v-textarea
                    label="模块输入参数(paramInputYaml)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="item.paramInputYaml"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>自定义步骤的输入参数设置以及参数说明信息，使用yaml格式</div>
                      <div>设置该模块特定的步骤执行参数</div>
                      <div>该输入参数将会以文件的形式挂装到步骤执行容器的/tmp/dory/paramInput文件，步骤执行容器可以读取该输入参数，进行相应的步骤处理</div>
                    </div>
                  </v-tooltip>
                </div>
                <div>
                  <v-icon color="success" class="mr-4" @click="copyCustomStepModuleDefs(index)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteCustomStepModuleDefs(index)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="customStepEnvDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">设置自定义步骤模块定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="customStepDefsEnvHistory('customStepDefs', targetCustomStepName)">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="" v-bind="attrs" v-on="on" @click="() => {varsDialog = true}">mdi-progress-question</v-icon>
            </template>
            <div>变量说明</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="openCustomStepDefToEnv()">mdi-arrow-left-bold-hexagon-outline</v-icon>
            </template>
            <div>复制到其他环境</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="previewCustomStepDefEnv()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateCustomStepDefEnv()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.customStepEnvDefDialog = false
            this.$refs.customStepEnvDefRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
            v-if="errMsgCustomStepDefs"
          >
            {{ errMsgCustomStepDefs }}
          </v-alert>
          <v-alert
            prominent
            type="info"
            v-if="customStepUsage"
          >
            <pre>{{ customStepUsage }}</pre>
          </v-alert>
          <v-form ref="customStepEnvDefRef">
            <div class="form-row d-flex justify-space-between">
              <div class="form-item-45">
                <v-text-field
                  label="自定义步骤名(customStepName)*"
                  dense
                  v-model="customStepEnvDefForm.customStepName"
                  disabled
                />
              </div>
              <div class="form-item-45 d-flex align-center">
                <v-select
                  :items="project.customStepEnableModeEnvs"
                  label="自定义步骤的启用模式(enableMode)"
                  dense
                  v-model="customStepEnvDefForm.customStepDef.enableMode"
                  @change="enableModeChangeEnv($event)"
                ></v-select>
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>手动模式必须设置manualEnable表示是否启用本模块</div>
                    <div>选择其他模式表示对应的内置模块被设置为启用的时候，本自定义步骤模块为启用。自动模式必须设置relatedStepModules，支持设置多个模块，任何一个设置的模块被设置为启用，那么本模块则设置为启用</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="form-row mt-4">
              <small>自定义步骤的模块设置(customStepModuleDefs)*</small>
              <v-icon color="success" class="ml-2" @click="addCustomStepModuleDefsEnv()">mdi-table-plus</v-icon>
              <div class="d-flex justify-space-between mt-4" v-for="(item, index) in customStepEnvDefForm.customStepDef.customStepModuleDefs" :key="index">
                <v-checkbox class="diy-icon" @change="checkcustomStepModuleDef($event, index)"></v-checkbox>
                <div class="form-item-15">
                  <v-text-field
                    label="模块名称(moduleName)*"
                    dense
                    v-model="item.moduleName"
                    hint="例如：tp1-test-app"
                    persistent-hint
                    :rules="[v => !!v || '模块名称为必填项']"
                  />
                </div>
                <div class="form-item-15">
                  <v-select
                    v-if="manualEnableFlag"
                    :items="[ true, false ]"
                    label="手动启用模式(manualEnable)"
                    dense
                    hint="手工设置本模块是否启用"
                    persistent-hint
                    v-model="item.manualEnable"
                  />
                  <div class="d-flex align-center" v-if="relatedStepModulesFlag">
                    <v-select
                      :items="relatedStepModules"
                      label="相关启用的步骤模块(relatedStepModules)*"
                      dense
                      small-chips
                      multiple
                      v-model="item.relatedStepModules"
                      :rules="[v => v.length > 0 || '模相关启用的步骤模块为必填项']"
                    />
                    <v-tooltip right max-width="350px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>支持设置多个模块，任何一个设置的模块被设置为启用，那么本模块则设置为启用</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
                <div class="form-item-50 d-flex align-center">
                  <v-textarea
                    label="模块输入参数(paramInputYaml)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="item.paramInputYaml"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>自定义步骤的输入参数设置以及参数说明信息，使用yaml格式</div>
                      <div>设置该模块特定的步骤执行参数</div>
                      <div>该输入参数将会以文件的形式挂装到步骤执行容器的/tmp/dory/paramInput文件，步骤执行容器可以读取该输入参数，进行相应的步骤处理</div>
                    </div>
                  </v-tooltip>
                </div>
                <div>
                  <v-icon color="success" class="mr-4" @click="copyCustomStepModuleDefsEnv(index)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteCustomStepModuleDefsEnv(index)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
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
                <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="pipelineDefHistory('pipelineDef', targetBranchName)">mdi-history</v-icon>
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
      v-model="buildDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">设置模块构建定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="buildDefsHistory('buildDefs')">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="addDef()">mdi-table-plus</v-icon>
            </template>
            <div>新增配置</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="previewBuildDef()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateBuildDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.buildDefDialog = false
            this.$refs.buildDefRef.resetValidation()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="buildDefRef">
            <v-expansion-panels accordion class="buildDef-panel">
              <v-expansion-panel v-for="(item, index) in buildDefForm" :key="index">
                <v-expansion-panel-header>
                  <div class="form-row d-flex justify-space-between" @click.stop="() => {}">
                    <div class="form-item">
                      <v-text-field
                        label="构建模块名称(buildName)*"
                        dense
                        v-model="item.buildName"
                        :rules="[v => !!v || '构建模块名称必填项']"
                      />
                    </div>
                    <div class="form-item">
                      <v-select
                        :items="[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]"
                        label="构建步骤ID(buildPhaseID)*"
                        dense
                        hint="相同的构建步骤ID表示并行构建，必须大于0"
                        persistent-hint
                        v-model="item.buildPhaseID"
                        :rules="[v => !!v || '构建步骤ID必填项']"
                      ></v-select>
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="构建模块代码路径(buildPath)*"
                        dense
                        hint="构建模块在代码仓库中的相对路径"
                        persistent-hint
                        v-model="item.buildPath"
                        :rules="[v => !!v || '构建模块代码路径必填项']"
                      />
                    </div>
                  </div>
                  <div class="v-expansion-panel-header__icon">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="success" class="diy-icon" v-bind="attrs" v-on="on" @click.stop="copyDef(index)">mdi-content-copy</v-icon>
                      </template>
                      <span>复制</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="error" class="ml-2 diy-icon" v-bind="attrs" v-on="on" @click.stop="deleteDef(index)">mdi-trash-can-outline</v-icon>
                      </template>
                      <span>删除</span>
                    </v-tooltip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content eager>
                  <div class="form-row d-flex justify-space-between pr-20 mt-4" @click.stop="() => {}">
                    <div class="form-item-15">
                      <v-select
                        :items="project.buildEnvs"
                        label="模块构建环境(buildEnv)*"
                        dense
                        v-model="item.buildEnv"
                        :rules="[v => !!v || '模块构建环境必填项']"
                      ></v-select>
                    </div>
                    <div class="form-item-40">
                      <v-textarea
                        label="模块构建命令(buildCmds)*"
                        auto-grow
                        v-model="item.buildCmds"
                        dense
                        style="white-space:nowrap;"
                        wrap="off"
                        row-height="12"
                        :rules="[v => !!v || '模块构建命令必填项']"
                      ></v-textarea>
                    </div>
                    <div class="form-item-40">
                      <v-textarea
                        label="模块构建结果验证命令(buildChecks)*"
                        auto-grow
                        v-model="item.buildChecks"
                        rows="1"
                        dense
                        style="white-space:nowrap;"
                        wrap="off"
                        row-height="12"
                        :rules="[v => !!v || '模块构建结果验证命令必填项']"
                      ></v-textarea>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="packageDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">设置模块容器打包定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mr-4" v-bind="attrs" v-on="on" @click="packageDefsHistory('packageDefs')">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="addPackageDef()">mdi-table-plus</v-icon>
            </template>
            <div>新增配置</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="previewPackageDef()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updatePackageDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.packageDefDialog = false
            this.$refs.packageDefRef.resetValidation()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
            v-if="errMsgPackageDefs"
          >
            {{ errMsgPackageDefs }}
          </v-alert>
          <v-form ref="packageDefRef">
            <v-expansion-panels accordion class="buildDef-panel">
              <v-expansion-panel v-for="(item, index) in packageDefForm" :key="index">
                <v-expansion-panel-header>
                  <div class="form-row d-flex justify-space-between" @click.stop="() => {}">
                    <div class="form-item-20">
                      <v-text-field
                        label="镜像打包模块名称(packageName)*"
                        dense
                        v-model="item.packageName"
                        :rules="[v => !!v || '镜像打包模块名称必填项']"
                      />
                    </div>
                    <div class="form-item-20">
                      <v-select
                        :items="project.buildNames"
                        label="来源构建模块(relatedBuilds)*"
                        dense
                        hint="镜像打包模块的制品来源于哪些构建模块"
                        persistent-hint
                        multiple
                        small-chips
                        v-model="item.relatedBuilds"
                        :rules="[v => v.length > 0 || '来源构建模块必填项']"
                      ></v-select>
                    </div>
                    <div class="form-item-45">
                      <v-text-field
                        label="镜像来源(packageFrom)*"
                        dense
                        :messages="['可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像（公网镜像拉取可能不稳定，不建议拉取公网镜像，同时建议不要使用latest标签的镜像）', '也可以填写harbor中的镜像']"
                        v-model="item.packageFrom"
                        :rules="[v => !!v || '镜像来源必填项']"
                      >
                        <template v-slot:message>
                          <div>可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像（公网镜像拉取可能不稳定，不建议拉取公网镜像，同时建议不要使用latest标签的镜像）</div>
                          <div>也可以填写harbor中的镜像</div>
                        </template>
                      </v-text-field>
                    </div>
                  </div>
                  <div class="v-expansion-panel-header__icon">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="success" class="diy-icon" v-bind="attrs" v-on="on" @click.stop="copyPackageDef(index)">mdi-content-copy</v-icon>
                      </template>
                      <span>复制</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="error" class="ml-2 diy-icon" v-bind="attrs" v-on="on" @click.stop="deletePackageDef(index)">mdi-trash-can-outline</v-icon>
                      </template>
                      <span>删除</span>
                    </v-tooltip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="form-row d-flex justify-space-between pr-20 mt-4" @click.stop="() => {}">
                    <div class="form-item-100">
                      <v-textarea
                        label="制作镜像的Dockerfile指令(packages)*"
                        auto-grow
                        v-model="item.packages"
                        rows="1"
                        dense
                        hint="用于生成Dockerfile，不包含FROM指令，请注意Dockerfile指令执行顺序"
                        persistent-hint
                        style="white-space:nowrap;"
                        wrap="off"
                        row-height="12"
                        :rules="[v => !!v || '制作镜像的Dockerfile指令必填项']"
                      ></v-textarea>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dockerIgnoreDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">设置容器打包忽略定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="dockerIgnoreDefsHistory('dockerIgnoreDefs')">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="previewDockerIgnoreDef()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateDockerIgnoreDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.dockerIgnoreDefDialog = false
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="dockerIgnoreDefRef">
            <div class="form-item-100">
              <v-textarea
                label="docker打包忽略目录设置"
                dense
                :messages="['docker打包会扫描仓库的所有目录，假如项目仓库的文件太多会导致打包扫描过程太慢。如果需要提高打包速度，请设置忽略目录设置', '“/abc*” 代表根目录（上下文环境目录中）中以abc开头的任意直接子目录或者直接子文件将被忽略，如/abc  abc.txt', '“*/abc*” 代表根目录（上下文环境目录中）中任意直接子目录中以abc开头的任意直接子目录或者直接子文件将被忽略，如 /file/abc  /file/abc.txt', '“*/*/abc*” 代表根目录（上下文环境目录中）中任意两级目录下以abc开头的任意直接子目录或者直接子文件将被忽略，如 /file1/file2/abc  /file1/file2/abc.txt', '“**/abc*” **匹配任意数量目录（包括零）的特殊通配符字符串，如 /a/b/abc.txt /c/abc.md /a/b/c/abcde', '“temp?” 排除根目录中的文件和目录，其名称是单字符扩展名temp，如 /tempa /tempb']"
                v-model="dockerIgnoreDefForm"
                row="1"
                auto-grow
                style="white-space:nowrap;"
                wrap="off"
                row-height="12"
              >
                <template v-slot:message>
                  <div class="my-1">docker打包会扫描仓库的所有目录，假如项目仓库的文件太多会导致打包扫描过程太慢。如果需要提高打包速度，请设置忽略目录设置</div>
                  <div class="my-1">“/abc*” 代表根目录（上下文环境目录中）中以abc开头的任意直接子目录或者直接子文件将被忽略，如/abc  abc.txt</div>
                  <div class="my-1">“*/abc*” 代表根目录（上下文环境目录中）中任意直接子目录中以abc开头的任意直接子目录或者直接子文件将被忽略，如 /file/abc  /file/abc.txt</div>
                  <div class="my-1">“*/*/abc*” 代表根目录（上下文环境目录中）中任意两级目录下以abc开头的任意直接子目录或者直接子文件将被忽略，如 /file1/file2/abc  /file1/file2/abc.txt</div>
                  <div class="my-1">“**/abc*” **匹配任意数量目录（包括零）的特殊通配符字符串，如 /a/b/abc.txt /c/abc.md /a/b/c/abcde</div>
                  <div class="my-1">“temp?” 排除根目录中的文件和目录，其名称是单字符扩展名temp，如 /tempa /tempb</div>
                </template>
              </v-textarea>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deployContainerDefDialog"
      max-width="1200px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">设置模块容器发布定义</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="deployContainerDefsHistory('deployContainerDefs')">mdi-history</v-icon>
            </template>
            <div>历史版本</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="openDeployContainerDefToEnv()">mdi-arrow-left-bold-hexagon-outline</v-icon>
            </template>
            <div>复制到其他环境</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="addDeployContainerDef()">mdi-table-plus</v-icon>
            </template>
            <div>新增配置</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="mx-4" v-bind="attrs" v-on="on" @click="previewDeployContainerDef()">mdi-cube-scan</v-icon>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateDeployContainerDef()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.deployContainerDefDialog = false
            this.$refs.deployContainerDefRef.resetValidation()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-alert
            prominent
            type="error"
            v-if="errMsgDeployContainerDefs"
          >
            {{ errMsgDeployContainerDefs }}
          </v-alert>
          <v-form ref="deployContainerDefRef">
            <v-expansion-panels accordion multiple class="buildDef-panel">
              <v-expansion-panel v-for="(item, index) in deployContainerDefForm" :key="index">
                <v-expansion-panel-header>
                  <div class="v-expansion-panel-header__icon">
                    <v-checkbox class="diy-icon" @change="checkdeployContainerDef($event, index)" @click.stop="()=>{}"></v-checkbox>
                  </div>
                  <div class="form-row d-flex justify-space-between" @click.stop="() => {}">
                    <div class="form-item">
                      <v-text-field
                        label="容器发布模块名称(deployName)*"
                        dense
                        v-model="item.deployName"
                        :rules="[v => !!v || '容器发布模块名称为必填项']"
                      />
                    </div>
                    <div class="form-item">
                      <v-select
                        :items="project.packageNames"
                        label="来源镜像打包模块(relatedPackage)*"
                        dense
                        hint="容器发布模块的制品来源于哪些镜像打包模块"
                        persistent-hint
                        v-model="item.relatedPackage"
                        :rules="[v => !!v || '来源构建模块必填项']"
                      ></v-select>
                    </div>
                    <div class="form-item">
                      <v-text-field
                        label="应用启动的副本实例数(deployReplicas)*"
                        dense
                        type="number"
                        v-model="item.deployReplicas"
                        :rules="[v => !!v || '应用启动副本的实例数为必填项']"
                      >
                      </v-text-field>
                    </div>
                  </div>
                  <div class="v-expansion-panel-header__icon">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="success" class="diy-icon" v-bind="attrs" v-on="on" @click.stop="copyDeployContainerDef(index)">mdi-content-copy</v-icon>
                      </template>
                      <span>复制</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon color="error" class="ml-2 diy-icon" v-bind="attrs" v-on="on" @click.stop="deleteDeployContainerDef(index)">mdi-trash-can-outline</v-icon>
                      </template>
                      <span>删除</span>
                    </v-tooltip>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content eager>
                  <div class="form-row pr-20 pl-2" @click.stop="() => {}">
                    <div class="form-item">
                      <v-spacer></v-spacer>
                      <v-select
                        :items="[
                          { text: '应用的资源配额设置', value: 'deployResources' },
                          { text: '杂项', value: '杂项' },
                          { text: '服务端口设置', value: '服务端口设置' },
                          { text: '应用挂装存储设置', value: 'deployVolumes' },
                          { text: '应用状态检查设置', value: 'deployHealthCheck' },
                          { text:'应用水平扩缩容设置', value: 'hpaConfig' },
                          { text: '服务依赖', value:'dependServices' },
                          { text: '应用容器主机名解析', value: 'hostAliases' },
                          { text: '启动应用使用的用户和用户组配置', value: 'securityContext' },
                          { text: '从代码仓库发送配置文件到容器云的项目共享存储目录的配置', value: 'deployConfigSettings' }
                        ]"
                        dense
                        label="选择添加配置参数"
                        @change="chooseParams($event, index)"
                      ></v-select>
                    </div>
                    <div class="form-item-100 params-item" v-if="item.deployResources.cpuLimit !== '' || item.deployResources.cpuRequest !== '' || item.deployResources.memoryLimit !== '' || item.deployResources.memoryRequest !== ''" :id="'deployResources-' + index">
                      <div>
                        应用的资源配额设置(deployResources)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <span style="font-size: 12px;">给应用分配多少cpu和内存资源</span>
                        </v-tooltip>
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'deployResources')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4" v-if="item.deployResources">
                        <div class="form-item-20 d-flex">
                          <v-text-field
                            label="内存请求配额(memoryRequest)*"
                            dense
                            v-model="item.deployResources.memoryRequest"
                            :rules="[v => !!v || '内存请求配额为必填项']"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <span style="font-size: 12px;">应用预占的内存，所有应用的预占内存总量如超过节点内存总量将无法启动应用（100Mi表示100M内存，1Gi表示1G内存）</span>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex">
                          <v-text-field
                            label="内存最大配额(memoryLimit)*"
                            dense
                            v-model="item.deployResources.memoryLimit"
                            :rules="[v => !!v || '内存最大配额为必填项']"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <span style="font-size: 12px;">应用可以分配的最大内存资源，所有应用的最大内存配额总量可以超过节点内存总量（200Mi表示200M内存，1Gi表示1G内存）</span>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex">
                          <v-text-field
                            label="cpu请求配额(cpuRequest)*"
                            dense
                            v-model="item.deployResources.cpuRequest"
                            :rules="[v => !!v || 'cpu请求配额为必填项']"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <span style="font-size: 12px;">应用预占的cpu，所有应用的预占cpu总量如超过节点cpu总量将无法启动应用（100m表示0.1，表示0.1个CPU）</span>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex">
                          <v-text-field
                            label="cpu最大配额(cpuLimit)*"
                            dense
                            v-model="item.deployResources.cpuLimit"
                            :rules="[v => !!v || 'cpu最大配额为必填项']"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <span style="font-size: 12px;">应用可以分配的最大cpu资源，所有应用的最大cpu配额总量可以超过节点cpu总量（100m表示0.1，表示0.1个CPU）</span>
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.deployCommand !== '' || item.deployEnvs !== null || item.deploySessionAffinityTimeoutSeconds !== 0" :id="'杂项-' + index">
                      <div>杂项 <v-icon color="error" class="ml-4" @click="clearParams(index, 'other')">mdi-minus-circle-outline</v-icon></div>
                      <div class="params-content d-flex justify-space-between mt-4">
                        <div class="form-item">
                          <small>环境变量(deployEnvs)</small>
                          <v-icon color="success" class="ml-4" @click="addDeployEnvs(index)">mdi-table-plus</v-icon>
                          <div class="env-item d-flex justify-space-between" v-for="(row, i) in item.deployEnvs" :key="i" v-if="item.deployEnvs">
                            <div class="form-item-45 mt-4">
                              <v-text-field
                                label="变量名*"
                                dense
                                v-model="row[0]"
                                :rules="[v => !!v || '环境变量名为必填项']"
                              />
                            </div>
                            <div class="form-item-45 mt-4">
                              <v-text-field
                                label="变量值*"
                                dense
                                v-model="row[1]"
                                :rules="[v => !!v || '环境变量值为必填项']"
                              />
                            </div>
                            <v-icon color="error" class="mt-4" @click="deleteDeployEnvs(index, i)">mdi-trash-can-outline</v-icon>
                          </div>
                          <div><small class="tip-color">应用容器中的环境变量设置</small></div>
                        </div>
                        <div class="form-item-45 d-flex align-center">
                          <v-text-field
                            label="启动应用命令行(deployCommand)"
                            dense
                            v-model="item.deployCommand"
                          />
                        </div>
                        <div class="form-item-15 d-flex align-center">
                          <v-text-field
                            label="会话持久时间(deploySessionAffinityTimeoutSeconds)"
                            dense
                            type="number"
                            v-model="item.deploySessionAffinityTimeoutSeconds"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <span style="font-size: 12px;">对于多实例的有状态服务，如果需要启用session sticky支持，需要设置session sticky超时时间，单位秒</span>
                          </v-tooltip>
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" :id="'服务端口设置-' + index" v-if="item.deployNodePorts !== null || item.deployLocalPorts !== null">
                      <div class="form-item-45 mt-4 d-flex align-center">
                        <v-select
                          :items="[
                            { text: '模块的内部端口设置', value: 'deployLocalPorts' },
                            { text: '模块的NodePort端口设置', value: 'deployNodePorts' },
                          ]"
                          dense
                          :value="item.deployLocalPorts === null ? 'deployNodePorts' : 'deployLocalPorts'"
                          label="选择添加配置参数"
                          @change="changePortSet($event, index)"
                        ></v-select>
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'portSetting')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="form-item-100" v-if="item.deployLocalPorts !== null" :id="'deployLocalPorts-' + index">
                        <div>
                          模块的内部端口设置(deployLocalPorts)
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>假如模块应用不需要在kubernetes集群外被访问，那么设置内部端口即可</div>
                              <div>选择后不能选deployNodePorts</div>
                            </div>
                          </v-tooltip>
                          <v-icon color="success" class="mx-4" @click="addDeployLocalPort(index)">mdi-table-plus</v-icon> 
                        </div>
                        <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in item.deployLocalPorts">
                          <div class="form-item-20">
                            <v-text-field
                              label="模块的内部服务端口号(port)*"
                              dense
                              type="number"
                              v-model="row.port"
                              :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                            />
                          </div>
                          <div class="form-item-20">
                            <v-select
                              :items="[ 'http', 'tcp' ]"
                              label="协议类型(protocol)*"
                              dense
                              v-model="row.protocol"
                              :rules="[v => !!v || '协议类型为必填项']"
                            />
                          </div>
                          <div class="form-item-20">
                            <v-text-field
                              label="访问域名(ingress.domainName)"
                              dense
                              v-model="row.ingress.domainName"
                              hint="访问该服务的域名"
                              persistent-hint
                            />
                          </div>
                          <div class="form-item-20 d-flex">
                            <v-text-field
                              label="访问子路径(ingress.pathPrefix)"
                              dense
                              v-model="row.ingress.pathPrefix"
                              hint="访问该服务的子路径前缀"
                              persistent-hint
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <div style="font-size: 12px;">
                                <div>kubernetes集群外通过域名和子路径访问该服务</div>
                                <div>访问方式为 http://${domainName}${pathPrefix}</div>
                              </div>
                            </v-tooltip>
                          </div>
                          <div>
                            <v-icon color="success" class="mr-4" @click="copyDeployLocalPort(index, i)">mdi-content-copy</v-icon>
                            <v-icon color="error" @click="deleteDeployLocalPort(index, i)">mdi-trash-can-outline</v-icon>
                          </div>
                        </div>
                      </div>
                      <div class="form-item-100" v-if="item.deployNodePorts !== null" :id="'deployNodePorts-' + index">
                        <div>
                          模块的NodePort端口设置(deployNodePorts)
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>模块应用需要在kubernetes集群外被访问的时候，需要通过NodePort端口对外提供服务</div>
                              <div>选择后不能选deployLocalPorts</div>
                            </div>
                          </v-tooltip>
                          <v-icon color="success" class="mx-4" @click="addDeployNodePort(index)">mdi-table-plus</v-icon> 
                        </div>
                        <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in item.deployNodePorts">
                          <div class="form-item">
                            <v-text-field
                              label="模块的内部服务端口号(port)*"
                              dense
                              type="number"
                              v-model="row.port"
                              :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                            />
                          </div>
                          <div class="form-item">
                            <v-select
                              :items="[ 'http', 'tcp' ]"
                              label="协议类型(protocol)*"
                              dense
                              v-model="row.protocol"
                              :rules="[v => !!v || '协议类型为必填项']"
                            />
                          </div>
                          <div class="form-item d-flex">
                            <v-select
                              :items="project.nodePorts"
                              label="模块的外部服务端口号(nodePort)*"
                              dense
                              v-model="row.nodePort"
                              :rules="[v => !!v || '模块的外部服务端口号为必填项']"
                              hint="访问该服务的域名"
                              persistent-hint
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <div style="font-size: 12px;">
                                <div>kubernetes集群外通过访问NodePort可以访问到模块的内部端口，请保证项目的管理控制台该nodePort可用，并且nodePort没有复用，否则会无法发布应用。</div>
                              </div>
                            </v-tooltip>
                          </div>
                          <v-icon color="success" class="mr-4" @click="copyDeployNodePort(index, i)">mdi-content-copy</v-icon>
                          <v-icon color="error" @click="deleteDeployNodePort(index, i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.deployVolumes !== null" :id="'deployVolumes-' + index">
                      <div>
                        应用挂装存储设置(deployVolumes)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <span style="font-size: 12px;">该应用哪些目录或者文件需要进行持久化到共享存储</span>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addDeployVolumes(index)">mdi-table-plus</v-icon> 
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'deployVolumes')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in item.deployVolumes">
                        <div class="form-item">
                          <v-text-field
                            label="容器中挂装的目录或文件的绝对路径(pathInPod)*"
                            dense
                            v-model="row.pathInPod"
                            :rules="[v => !!v || '容器中挂装的目录或文件的绝对路径为必填项']"
                          />
                        </div>
                        <div class="form-item">
                          <v-text-field
                            label="持久化卷pvc中目录或文件的相对路径(pathInPv)*"
                            dense
                            v-model="row.pathInPv"
                            :rules="[v => !!v || '持久化卷pvc中目录或文件的相对路径为必填项']"
                          />
                        </div>
                        <div class="form-item d-flex">
                          <v-select
                            :items="pvs || []"
                            label="挂装的pvc名字(pvc)"
                            dense
                            v-model="row.pvc"
                            hint="如果使用默认pvc请不要填写"
                            persistent-hint
                          />
                        </div>
                        <v-icon color="success" class="mr-4" @click="copyDeployVolumes(index, i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteDeployVolumes(index, i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-if="item.deployHealthCheck.livenessDelaySeconds !== 0 || item.deployHealthCheck.livenessPeriodSeconds !== 0 || item.deployHealthCheck.readinessDelaySeconds !== 0 || item.deployHealthCheck.readinessPeriodSeconds !== 0 || item.deployHealthCheck.checkPort !== 0 || item.deployHealthCheck.httpGet.port !== 0 || item.deployHealthCheck.httpGet.path !== '' || item.deployHealthCheck.httpGet.httpHeaders !== null" :id="'deployHealthCheck-' + index">
                      <div>
                        应用状态检查设置(deployHealthCheck)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <span style="font-size: 12px;">检查应用是否能正常对外提供服务，如果不能正常对外提供服务则进行重启或者标记服务不可访问</span>
                        </v-tooltip>
                        <v-icon color="error" @click="clearParams(index, 'deployHealthCheck')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4">
                        <div class="form-item-20 d-flex align-center">
                          <v-text-field
                            label="启动容器后等待多长时间才启动可访问性检查(readinessDelaySeconds)*"
                            dense
                            v-model="item.deployHealthCheck.readinessDelaySeconds"
                            :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动可访问性检查为必填项']"
                            type="number"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>如果检查通过service才可以正常对外访问，单位秒</div>
                            </div>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex align-center">
                          <v-text-field
                            label="多长时间间隔进行一次可访问性检查(readinessPeriodSeconds)*"
                            dense
                            v-model="item.deployHealthCheck.readinessPeriodSeconds"
                            :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次可访问性检查为必填项']"
                            type="number"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>如果检查通过service才可以正常对外访问，单位秒</div>
                            </div>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex align-center">
                          <v-text-field
                            label="启动容器后等待多长时间才启动服务异常检查(livenessDelaySeconds)*"
                            dense
                            v-model="item.deployHealthCheck.livenessDelaySeconds"
                            :rules="[v => v >= 0 && v!== '' || '启动容器后等待多长时间才启动服务异常检查为必填项']"
                            type="number"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>如果检查不通过容器将会自动重启，单位秒</div>
                            </div>
                          </v-tooltip>
                        </div>
                        <div class="form-item-20 d-flex align-center">
                          <v-text-field
                            label="多长时间间隔进行一次服务异常检查(livenessPeriodSeconds)*"
                            dense
                            v-model="item.deployHealthCheck.livenessPeriodSeconds"
                            :rules="[v => v >= 0 && v!== '' || '多长时间间隔进行一次服务异常检查为必填项']"
                            type="number"
                          />
                          <v-tooltip right max-width="200px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                            </template>
                            <div style="font-size: 12px;">
                              <div>如果检查不通过容器将会自动重启，单位秒</div>
                            </div>
                          </v-tooltip>
                        </div>
                      </div>
                      <div class="params-content d-flex justify-space-between">
                        <div class="form-item-100">
                          <div class="form-item-20">
                            <v-select
                              :items="[ 'httpGet', 'checkPort' ]"
                              label="选择httpGet或checkPort"
                              @change="checkChange($event, index)"
                              hint="checkPort和httpGet必须选其一"
                              persistent-hint
                              :value="deployContainerDefForm[index].deployHealthCheck.checkPort === 0 ? 'httpGet' : 'checkPort'"
                            ></v-select>
                          </div>
                          <div class="mt-4" v-if="deployContainerDefForm[index].deployHealthCheck.checkPort !== 0">
                            <v-text-field
                              label="检查tcp端口是否可连接(checkPort)*"
                              dense
                              v-model="item.deployHealthCheck.checkPort"
                              :rules="[v => !!v || '检查tcp端口是否可连接为必填项']"
                              type="number"
                            />
                          </div>
                          <div v-if="deployContainerDefForm[index].deployHealthCheck.checkPort === 0">
                            <small>通过http get方法检查是否可连接(httpGet)*</small>
                            <div class="d-flex justify-space-between mt-4">
                              <div class="form-item-45">
                                <v-text-field
                                  label="本应用的http路径(path)*"
                                  dense
                                  v-model="item.deployHealthCheck.httpGet.path"
                                  :rules="[v => !!v || '本应用的http路径为必填项']"
                                />
                              </div>
                              <div class="form-item-45">
                                <v-text-field
                                  label="本应用的http端口(port)*"
                                  dense
                                  v-model="item.deployHealthCheck.httpGet.port"
                                  :rules="[v => !!v || '本应用的http端口为必填项']"
                                  type="number"
                                />
                              </div>
                            </div>
                            <small>请求中自定义的HTTP头(httpHeaders)</small>
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <div style="font-size: 12px;">
                                <div>通过http get方法访问指定路径和端口返回的状态码，如果状态码返回2XX-3XX则表示服务正常</div>
                                <div>建议每个应用单独开发一个http-get方式获取服务健康状态controller</div>
                              </div>
                            </v-tooltip>
                            <v-icon color="success" class="ml-4" @click="addHttpHeaders(index)">mdi-table-plus</v-icon>
                            <div v-for="(row, i) in item.deployHealthCheck.httpGet.httpHeaders" :key="i">
                              <div class="d-flex justify-space-between mt-4">
                                <div class="form-item-45">
                                  <v-text-field
                                    label="httpHeader名称(name)*"
                                    dense
                                    v-model="row.name"
                                    :rules="[v => !!v || 'httpHeader名称为必填项']"
                                  />
                                </div>
                                <div class="form-item-45">
                                  <v-text-field
                                    label="httpHeader值(value)*"
                                    dense
                                    v-model="row.value"
                                    :rules="[v => !!v || 'httpHeader值为必填项']"
                                  />
                                </div>
                                <v-icon color="success" class="mr-4" @click="copyHttpHeaders(index, i)">mdi-content-copy</v-icon>
                                <v-icon color="error" @click="deleteHttpHeaders(index, i)">mdi-trash-can-outline</v-icon>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-if="item.hpaConfig.cpuAverageRequestPercent !== 0 || item.hpaConfig.maxReplicas !== 0 || item.hpaConfig.memoryAverageRequestPercent !== 0 || item.hpaConfig.cpuAverageValue !== '' || item.hpaConfig.memoryAverageValue !== ''" :id="'hpaConfig-' + index">
                      <div>
                        应用水平扩缩容设置(hpaConfig)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>注意，仅适用于无状态应用，有状态应用启动水平扩缩容可能引起服务异常</div>
                            <div>当应用一段时间内实际平均使用的cpu或者内存高于预设值情况下，应用会自动进行水平扩容</div>
                            <div>当应用水平扩容后，应用一段时间内实际平均使用的cpu或者内存低于预设值情况下，应用会自动进行水平缩容</div>
                          </div>
                        </v-tooltip>
                        <v-icon color="error" @click="clearParams(index, 'hpaConfig')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div v-if="item.hpaConfig">
                        <div class="params-content d-flex justify-space-between mt-4">
                          <div class="form-item-100">
                            <v-text-field
                              label="应用能够扩容的最大副本实例数(maxReplicas)*"
                              dense
                              v-model="item.hpaConfig.maxReplicas"
                              :rules="[v => v > 0  || '应用能够扩容的最大副本实例数为必填项']"
                              type="number"
                            />
                          </div>
                        </div>
                        <div class="params-content d-flex justify-space-between mt-4">
                          <div class="form-item-20 d-flex align-center">
                            <v-text-field
                              label="内存平均值(memoryAverageValue)"
                              dense
                              v-model="item.hpaConfig.memoryAverageValue"
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <span style="font-size: 12px;">应用一段时间内的内存平均值达到该数值将启动自动扩容（100Mi表示100M内存，1Gi表示1G内存）</span>
                            </v-tooltip>
                          </div>
                          <div class="form-item-20 d-flex align-center">
                            <v-text-field
                              label="内存平均百分比(memoryAverageRequestPercent)"
                              dense
                              v-model="item.hpaConfig.memoryAverageRequestPercent"
                              type="number"
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <span style="font-size: 12px;">应用一段时间内的内存平均值达到预设值的百分比将启动自动扩容（1 - 100）</span>
                            </v-tooltip>
                          </div>
                          <div class="form-item-20 d-flex align-center">
                            <v-text-field
                              label="cpu平均值(cpuAverageValue)"
                              dense
                              v-model="item.hpaConfig.cpuAverageValue"
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <span style="font-size: 12px;">应用一段时间内的cpu平均值达到该数值将启动自动扩容（100m表示0.1，表示0.1个CPU）</span>
                            </v-tooltip>
                          </div>
                          <div class="form-item-20 d-flex align-center">
                            <v-text-field
                              label="cpu平均百分比(cpuAverageRequestPercent)"
                              dense
                              v-model="item.hpaConfig.cpuAverageRequestPercent"
                              type="number"
                            />
                            <v-tooltip right max-width="200px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                              </template>
                              <span style="font-size: 12px;">应用一段时间内的cpu平均值达到预设值的百分比将启动自动扩容（1 - 100）</span>
                            </v-tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.dependServices !== null" :id="'dependServices-' + index">
                      <div>
                        服务依赖(dependServices)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            启动该服务前必须先保证哪个服务的哪个端口先启动，如果有多个服务依赖请注意依赖的先后顺序
                          </div>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addDependServices(index)">mdi-table-plus</v-icon> 
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'dependServices')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in item.dependServices">
                        <div class="form-item">
                          <v-text-field
                            label="依赖的服务名(dependName)*"
                            dense
                            v-model="row.dependName"
                            :rules="[v => !!v || '依赖的服务名为必填项']"
                            hint="可以是集群内的服务名，也可以是集群外的ip地址或者主机名"
                            persistent-hint
                          />
                        </div>
                        <div class="form-item">
                          <v-text-field
                            label="依赖的服务端口(dependPort)*"
                            dense
                            v-model="row.dependPort"
                            :rules="[v => !!v || '依赖的服务端口为必填项']"
                            type="number"
                          />
                        </div>
                        <div class="form-item">
                          <v-select
                            :items="[ 'TCP', 'UDP' ]"
                            label="依赖的服务协议类型(dependType)"
                            dense
                            v-model="row.dependType"
                            :rules="[v => !!v || '依赖的服务协议类型为必填项']"
                          />
                        </div>
                        <v-icon color="success" class="mr-4" @click="copyDependServices(index, i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteDependServices(index, i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.hostAliases !== null" :id="'hostAliases-' + index">
                      <div>
                        应用容器主机名解析(hostAliases)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            设置后应用容器中的/etc/hosts将增加相关主机名解析
                          </div>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addHostAliases(index)">mdi-table-plus</v-icon> 
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'hostAliases')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4 align-center" v-for="(row, i) in item.hostAliases">
                        <div class="form-item">
                          <v-text-field
                            label="对应的ip地址(ip)*"
                            dense
                            v-model="row.ip"
                            :rules="[v => !!v || '对应的ip地址为必填项']"
                          />
                        </div>
                        <div class="form-item-45">
                          <v-combobox
                            label="对应的主机名(hostnames)*"
                            dense
                            multiple
                            small-chips
                            hide-selected
                            v-model="row.hostnames"
                            hint="一个ip地址支持对应多个主机名"
                            persistent-hint
                            append-icon=""
                            :rules="[v => v.length > 0 || '对应的主机名为必填项']"
                          />
                        </div>
                        <v-icon color="success" class="mr-4" @click="copyHostAliases(index, i)">mdi-content-copy</v-icon>
                        <v-icon color="error" @click="deleteHostAliases(index, i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.securityContext.runAsUser !== 0 || item.securityContext.runAsGroup !== 0" :id="'securityContext-' + index">
                      <div>
                        启动应用使用的用户和用户组配置(securityContext)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            假如使用容器镜像的默认启动用户请勿配置该选项
                          </div>
                        </v-tooltip>
                        <v-icon color="error" @click="clearParams(index, 'securityContext')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between mt-4" v-if="item.securityContext">
                        <div class="form-item-45">
                          <v-text-field
                            label="应用运行的用户ID(runAsUser)*"
                            dense
                            type="number"
                            v-model="item.securityContext.runAsUser"
                          />
                        </div>
                        <div class="form-item-45">
                          <v-text-field
                            label="应用运行的用户组ID(runAsGroup)*"
                            dense
                            type="number"
                            v-model="item.securityContext.runAsGroup"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="form-item-100 params-item" v-show="item.deployConfigSettings !== null" :id="'deployConfigSettings-' + index">
                      <div>
                        从代码仓库发送配置文件到容器云的项目共享存储目录的配置(deployConfigSettings)
                        <v-tooltip right max-width="200px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                          </template>
                          <div style="font-size: 12px;">
                            <div>注意，只支持发送到默认pvc共享存储中，不支持发送配置文件到项目自定义挂载的pvc共享存储中</div>
                            <div>流水线会自动把 ${配置文件所在代码目录相对路径}/test 目录下的所有文件发送到test环境的 ${共享存储项目目录相对路径}目录下</div>
                          </div>
                        </v-tooltip>
                        <v-icon color="success" class="ml-4" @click="addDeployConfigSettings(index)">mdi-table-plus</v-icon>
                        <v-icon color="error" class="ml-4" @click="clearParams(index, 'deployConfigSettings')">mdi-minus-circle-outline</v-icon>
                      </div>
                      <div class="params-content d-flex justify-space-between align-center mt-4" v-for="(row, i) in item.deployConfigSettings">
                        <div class="form-item">
                          <v-text-field
                            label="配置文件所在代码目录相对路径*"
                            dense
                            v-model="row[0]"
                            :rules="[v => v.length>0 && v.slice(0,1) !='/' || '配置文件所在代码目录相对路径为必填项且不能以“/”开头']"
                          />
                        </div>
                        <div class="form-item">
                          <v-text-field
                            label="共享存储项目目录相对路径*"
                            dense
                            v-model="row[1]"
                            :rules="[v => v.length>0 && v.slice(0,1) !='/' || '共享存储项目目录相对路径为必填项且不能以“/”开头']"
                          />
                        </div>
                        <div>
                          <v-icon color="success" class="mr-4" @click="copyDeployConfigSettings(index, i)">mdi-content-copy</v-icon>
                          <v-icon color="error" @click="deleteDeployConfigSettings(index, i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="copyToEnvDialog"
      max-width="600px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">复制定义到其他环境</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="deployContainerDefToEnv()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.copyToEnvDialog = false
            this.$refs.copyToEnvRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="copyToEnvRef">
            <v-select
              :items="copyEnvList"
              label="选择环境"
              dense
              v-model="envNames"
              multiple
              small-chips
              :rules="[v => v.length > 0 || '依赖的服务协议类型为必填项']"
            />
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="copyToEnv2Dialog"
      max-width="600px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">复制定义到其他环境</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="deployArtifactDefToEnv()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.copyToEnv2Dialog = false
            this.$refs.copyToEnv2Ref.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="copyToEnv2Ref">
            <v-select
              :items="copyEnvList"
              label="选择环境"
              dense
              v-model="envNames"
              multiple
              small-chips
              :rules="[v => v.length > 0 || '依赖的服务协议类型为必填项']"
            />
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="copyToEnv4Dialog"
      max-width="600px"
      persistent
    >
      <v-card :loading="dialogLoading">
        <v-card-title>
          <span class="headline">复制定义到其他环境</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="customStepDefToEnv()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.copyToEnv4Dialog = false
            this.$refs.copyToEnv4Ref.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="copyToEnv4Ref">
            <v-select
              :items="copyEnvList"
              label="选择环境"
              dense
              v-model="envNames"
              multiple
              small-chips
              :rules="[v => v.length > 0 || '环境为必填项']"
            />
          </v-form>
        </v-card-text>
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
  </div>
</template>

<script>
import PageCard from "@/lib/ui-lib/page-templates/PageCard";
import DefsPipelinesTable from "@/components/DefsPipelinesTable";
import request from "@/utils/request";
import YAML from "yamljs";
import { flatMap } from 'rxjs/operators';
import MonacoDiff from "@/lib/monaco/MonacoDiff";
import Monaco from "@/lib/monaco/Monaco";
export default {
  inject: ["successTip", "errorTip", "warnTip"],
  name: "Project",
  components: {
    PageCard,
    DefsPipelinesTable,
    MonacoDiff,
    Monaco
  },
  data() {
    return {
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
      pipelineStepList: {
        build: {
          name: "是否执行构建(build)*",
          desc: "如果代码还不能构建的情况下，请设置为false，如果设置为false，后续所有步骤都不会执行",
        },
        package: {
          name: "是否执行镜像打包(package)*",
          desc: "如果设置为false，后续镜像扫描、容器发布等步骤不会执行",
        },
        artifact: {
          name: "是否执行制品打包(artifact)*",
          desc: "如果设置为false，后续制品发布步骤不会执行",
        },
        deployContainer: {
          name: "是否进行容器发布(deployContainer)*",
          desc: null,
        },
        deployArtifact: {
          name: "是否进行制品发布(deployArtifact)*",
          desc: null,
        },
        syncProductionEnvImage: {
          name: "是否把正式环境的镜像同步到集成环境(syncProductionEnvImage)*",
          desc: null,
        },
        apiTesting: {
          name: "是否进行接口测试(apiTesting)*",
          desc: null,
        },
        performanceTesting: {
          name: "是否进行性能测试(performanceTesting)*",
          desc: null,
        },
        webuiTesting: {
          name: "是否进行界面测试(webuiTesting)*",
          desc: null,
        },
        scanCodeIgnoreError: {
          name: "代码扫描失败情况下是否继续执行流水线(scanCodeIgnoreError)*",
          desc: null,
        },
        scanImageIgnoreError: {
          name: "镜像扫描失败情况下是否继续执行流水线(scanImageIgnoreError)*",
          desc: null,
        },
        checkDeployIgnoreError: {
          name: "容器发布检查失败情况下是否继续执行流水线(checkDeployIgnoreError)*",
          desc: null,
        },
        apiTestingIgnoreError: {
          name: "接口测试失败情况下是否继续执行流水线(apiTestingIgnoreError)*",
          desc: null,
        },
        performanceTestingIgnoreError: {
          name: "性能测试失败情况下是否继续执行流水线(performanceTestingIgnoreError)*",
          desc: null,
        },
        webuiTestingIgnoreError: {
          name: "界面测试失败情况下是否继续执行流水线(webuiTestingIgnoreError)*",
          desc: null,
        },
      },
      project: "",
      cardLoading: true,
      tableLoading: true,
      targetProjectName: "",
      targetEnvName: "",
      buildDefForm: [],
      pipelineDefForm: {
        isAutoDetectBuild: null,
        builds: [],
        pipelineStep: {},
        customStepInsertDefs: {},
        customStepPhaseDefs: {}
      },
      pipelineDefDialog: false,
      targetBranchName: "",
      YAMLDialog: false,
      yamlText: "",
      buildDefDialog: false,
      dialogLoading: false,
      packageDefDialog: false,
      packageDefForm: [],
      artifactDefForm: [],
      dockerIgnoreDefDialog: false,
      dockerIgnoreDefForm: [],
      deployContainerDefDialog: false,
      deployContainerDefForm: [],
      pvs: [],
      errMsgArtifactDefs: "",
      errMsgPackageDefs: "",
      DeployArtifactDefForm: [],
      hostnames: [],
      copyDeployContainerDefForm: [],
      copyDeployContainerDefIndex: [],
      copyToEnvDialog: false,
      copyEnvList: [],
      envNames: [],
      copyDeployArtifactDefIndex: [],
      copyDeployArtifactDefForm: [],
      copyToEnv2Dialog: false,
      errMsgDeployArtifactDefs: "",
      errMsgDeployContainerDefs: "",
      deployContainerNames: [],
      copyToEnv3Dialog: false,
      customStepDefDialog: false,
      customStepDefForm: {
        customStepName: '',
        customStepDef: {}
      },
      manualEnableFlag: false,
      relatedStepModulesFlag: false,
      relatedStepModules: [],
      customStepEnvDefForm: {
        customStepName: '',
        customStepDef: {}
      },
      customStepEnvDefDialog: false,
      targetEnvDef: {},
      copyToEnv4Dialog: false,
      errMsgCustomStepDefs: '',
      opsDefForm: [],
      opsDefDialog: false,
      errMsgCustomOpsDefs: '',
      errMsgPipelineDef: '',
      InsertDefNames: [],
      copyInsertDefNames: [],
      customStepUsage: '',
      vars: '',
      varsDialog: false,
      indexList: [],
      copyCustomStepModuleDefsForm: [],
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
      targetDefName: '',
      targetCustomStepName: '',
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
    };
  },
  created() {
    const vm = this;
    vm.targetProjectName = vm.$route.params.projectName;
    request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
      vm.project = response.data.project;
      console.log(response.data.project);
      vm.cardLoading = false;
    }).catch((error) => {
      vm.cardLoading = false;
      vm.errorTip(true, error.response.data.msg);
    });
    request.get('/cicd/customStepConf/vars').then(response => {
      vm.vars = response.data.content
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg);
    })
  },
  methods: {
    openOpsDef() {
      const vm = this
      vm.opsDefForm = JSON.parse(JSON.stringify(vm.project.projectDef.customOpsDefs))
      vm.errMsgCustomOpsDefs = vm.project.projectDef.errMsgCustomOpsDefs
      vm.customOpsSteps = vm.project.customOpsStepNames
      vm.opsDefDialog = true
    },
    addOps() {
      const vm = this
      var addItem = {
        customOpsName: '',
        customOpsDesc: '',
        customOpsSteps: []
      };
      vm.opsDefForm.unshift(addItem);
    },
    previewOpsDef() {
      const vm = this
      if(vm.$refs.opsDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.opsDefForm))
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    updateOpsDef() {
      const vm = this
      if(vm.$refs.opsDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.opsDefForm))
        let customOpsDefsYaml = YAML.stringify(copyData, 4)
        request.post(`/cicd/projectDef/${vm.targetProjectName}/customOpsDefs`,{
          customOpsDefsYaml: customOpsDefsYaml
        }).then(response => {
          vm.opsDefDialog = false
          vm.successTip(true, response.msg);
          vm.refresh();
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    copyOps(i) {
      const vm = this;
      var copyItem = JSON.parse(JSON.stringify(vm.opsDefForm[i]));
      copyItem.customOpsName = vm.opsDefForm[i].customOpsName + "-copy";
      vm.opsDefForm.push(copyItem);
    },
    deleteOps(i) {
      const vm = this;
      vm.opsDefForm.splice(i, 1);
    },
    customStepColor(item) {
      const vm = this
      if(vm.project.projectDef.errMsgCustomStepDefs !== null){
        if(vm.project.projectDef.errMsgCustomStepDefs[item] !== '' && vm.project.projectDef.errMsgCustomStepDefs[item] !== undefined){
          return 'red--text'
        }else{
          if(vm.project.projectDef.customStepDefs !== null && vm.project.projectDef.customStepDefs[item] !== undefined){
            if(vm.project.projectDef.customStepDefs[item].customStepModuleDefs !== null){
              return 'blue--text'
            }else{
              return 'green--text'
            }
          }else{
            return 'green--text'
          }
        }
      }else{
        if(vm.project.projectDef.customStepDefs !== null){
          if(vm.project.projectDef.customStepDefs[item].customStepModuleDefs !== null){
            return 'blue--text'
          }else{
            return 'green--text'
          }
        }else{
          return 'green--text'
        }
      }
    },
    enableModeChange(e) {
      const vm = this
      if(vm.customStepDefForm.customStepDef.enableMode === ''){
        vm.manualEnableFlag = true
        vm.relatedStepModulesFlag = false
      }else{
        vm.customStepDefForm.customStepDef.customStepModuleDefs.map(item => {
          item.relatedStepModules = []
        })
        vm.relatedStepModulesFlag = true
        vm.manualEnableFlag = false
        if(e === 'build'){
          vm.relatedStepModules = vm.project.buildNames
        }else if(e === 'package'){
          vm.relatedStepModules = vm.project.packageNames
        }else if(e === 'artifact'){
          vm.relatedStepModules = vm.project.artifactNames
        }
      }
    },
    openCustomStepDef(item) {
      const vm = this
      vm.errMsgCustomStepDefs = vm.project.projectDef.errMsgCustomStepDefs[item]
      vm.customStepDefDialog = true
      vm.targetCustomStepName = item
      var defaultYaml = ''
      vm.project.customStepConfs.map(row => {
        if(row.customStepName === item){
          defaultYaml = row.paramInputYamlDef
          vm.customStepUsage = row.customStepUsage
        }
      })
      if(vm.project.projectDef.customStepDefs !== null && vm.project.projectDef.customStepDefs[item] !== undefined){
        vm.customStepDefForm.customStepDef = JSON.parse(JSON.stringify(vm.project.projectDef.customStepDefs[item]))
        vm.customStepDefForm.customStepName = item
      }else{
        vm.customStepDefForm.customStepDef = {
          enableMode: '',
          customStepModuleDefs: [
            {
              moduleName: '',
              manualEnable: false,
              paramInputYaml: defaultYaml
            }
          ]
        }
        vm.customStepDefForm.customStepName = item
      }
      if(vm.customStepDefForm.customStepDef.enableMode === ''){
        vm.manualEnableFlag = true
        vm.relatedStepModulesFlag = false
      }else{
        vm.relatedStepModulesFlag = true
        vm.manualEnableFlag = false
        if(vm.customStepDefForm.customStepDef.enableMode === 'build'){
          vm.relatedStepModules = vm.project.buildNames
        }else if(vm.customStepDefForm.customStepDef.enableMode === 'package'){
          vm.relatedStepModules = vm.project.packageNames
        }else if(vm.customStepDefForm.customStepDef.enableMode === 'artifact'){
          vm.relatedStepModules = vm.project.artifactNames
        }
      }
    },
    addCustomStepModuleDefs() {
      const vm = this
      var defaultYaml = ''
      vm.project.customStepConfs.map(row => {
        if(row.customStepName === vm.customStepDefForm.customStepName){
          defaultYaml = row.paramInputYamlDef
        }
      })
      if(vm.customStepDefForm.customStepDef.enableMode === ''){
        var addItem = {
          moduleName: '',
          manualEnable: false,
          paramInputYaml: defaultYaml
        }
        vm.customStepDefForm.customStepDef.customStepModuleDefs.push(addItem)
      }else{
        var addItem = {
          moduleName: '',
          relatedStepModules: [],
          paramInputYaml: defaultYaml
        }
        vm.customStepDefForm.customStepDef.customStepModuleDefs.push(addItem)
      }
    },
    copyCustomStepModuleDefs(i) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.customStepDefForm.customStepDef.customStepModuleDefs[i])
      );
      vm.customStepDefForm.customStepDef.customStepModuleDefs.push(copyItem);
    },
    deleteCustomStepModuleDefs(i) {
      const vm = this;
      vm.customStepDefForm.customStepDef.customStepModuleDefs.splice(i, 1);
    },
    previewCustomStepDef() {
      const vm = this
      if(vm.$refs.customStepDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.customStepDefForm.customStepDef))
        if(!vm.manualEnableFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.manualEnable
          })
        }
        if(!vm.relatedStepModulesFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.relatedStepModules
          })
        }
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    updateCustomStepDef() {
      const vm = this
      if(vm.$refs.customStepDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.customStepDefForm.customStepDef))
        if(!vm.manualEnableFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.manualEnable
          })
        }
        if(!vm.relatedStepModulesFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.relatedStepModules
          })
        }
        var customStepDefYaml = YAML.stringify(copyData, 4)
        request.post(`/cicd/projectDef/${vm.targetProjectName}/customStepDef`, {
          customStepName: vm.customStepDefForm.customStepName,
          customStepDefYaml: customStepDefYaml
        }).then(response => {
          vm.customStepDefDialog = false
          vm.successTip(true, response.msg);
          vm.refresh();
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    customStepEnvColor(item, row) {
      const vm = this
      if(item.errMsgCustomStepDefs !== null){
        if(item.errMsgCustomStepDefs[row] !== '' && item.errMsgCustomStepDefs[row] !== undefined){
          return 'red--text'
        }else{
          if(item.customStepDefs !== null){
            if(item.customStepDefs[row] && item.customStepDefs[row].customStepModuleDefs !== null){
              return 'blue--text'
            }else{
              return 'green--text'
            }
          }else{
            return 'green--text'
          }
        }
      }else{
        if(item.customStepDefs !== null){
          if(item.customStepDefs[row] && item.customStepDefs[row].customStepModuleDefs !== null){
            return 'blue--text'
          }else{
            return 'green--text'
          }
        }else{
          return 'green--text'
        }
      }
    },
    enableModeChangeEnv(e) {
      const vm = this
      if(vm.customStepEnvDefForm.customStepDef.enableMode === ''){
        vm.manualEnableFlag = true
        vm.relatedStepModulesFlag = false
      }else{
        vm.customStepEnvDefForm.customStepDef.customStepModuleDefs.map(item => {
          item.relatedStepModules = []
        })
        vm.relatedStepModulesFlag = true
        vm.manualEnableFlag = false
        if(e === 'build'){
          vm.relatedStepModules = vm.project.buildNames
        }else if(e === 'package'){
          vm.relatedStepModules = vm.project.packageNames
        }else if(e === 'artifact'){
          vm.relatedStepModules = vm.project.artifactNames
        }else if(e === 'deploy'){
          vm.relatedStepModules = vm.targetEnvDef.deployContainerNames
        }else if(e === 'deployArtifact'){
          vm.relatedStepModules = vm.targetEnvDef.deployArtifactNames
        }
      }
    },
    openCustomStepEnvDef(item, row) {
      const vm = this
      vm.targetCustomStepName = row
      vm.targetEnvName = item.envName
      vm.customStepEnvDefDialog = true
      vm.targetEnvDef = item
      vm.copyCustomStepModuleDefsForm = []
      var defaultYaml = ''
      vm.project.customStepConfs.map(i => {
        if(i.customStepName === row){
          defaultYaml = i.paramInputYamlDef
          vm.customStepUsage = i.customStepUsage
        }
      })
      if(item.errMsgCustomStepDefs !== null){
        vm.errMsgCustomStepDefs = item.errMsgCustomStepDefs[row]
      }
      if(item.customStepDefs !== null && item.customStepDefs[row] !== undefined){
        vm.customStepEnvDefForm.customStepDef = JSON.parse(JSON.stringify(item.customStepDefs[row]))
        vm.customStepEnvDefForm.customStepName = row
      }else{
        vm.customStepEnvDefForm.customStepDef = {
          enableMode: '',
          customStepModuleDefs: [
            {
              moduleName: '',
              manualEnable: false,
              paramInputYaml: defaultYaml
            }
          ]
        }
        vm.customStepEnvDefForm.customStepName = row
      }
      if(vm.customStepEnvDefForm.customStepDef.enableMode === ''){
        vm.manualEnableFlag = true
        vm.relatedStepModulesFlag = false
      }else{
        vm.relatedStepModulesFlag = true
        vm.manualEnableFlag = false
        if(vm.customStepEnvDefForm.customStepDef.enableMode === 'build'){
          vm.relatedStepModules = vm.project.buildNames
        }else if(vm.customStepEnvDefForm.customStepDef.enableMode === 'package'){
          vm.relatedStepModules = vm.project.packageNames
        }else if(vm.customStepEnvDefForm.customStepDef.enableMode === 'artifact'){
          vm.relatedStepModules = vm.project.artifactNames
        }else if(vm.customStepEnvDefForm.customStepDef.enableMode === 'deploy'){
          vm.relatedStepModules = vm.targetEnvDef.deployContainerNames
        }else if(vm.customStepEnvDefForm.customStepDef.enableMode === 'deployArtifact'){
          vm.relatedStepModules = vm.targetEnvDef.deployArtifactNames
        }
      }
      console.log(vm.customStepEnvDefForm)
    },
    addCustomStepModuleDefsEnv() {
      const vm = this
      var defaultYaml = ''
      vm.project.customStepConfs.map(row => {
        if(row.customStepName === vm.customStepEnvDefForm.customStepName){
          defaultYaml = row.paramInputYamlDef
        }
      })
      if(vm.customStepEnvDefForm.customStepDef.enableMode === ''){
        var addItem = {
          moduleName: '',
          manualEnable: false,
          paramInputYaml: defaultYaml
        }
        vm.customStepEnvDefForm.customStepDef.customStepModuleDefs.push(addItem)
      }else{
        var addItem = {
          moduleName: '',
          relatedStepModules: [],
          paramInputYaml: defaultYaml
        }
        vm.customStepEnvDefForm.customStepDef.customStepModuleDefs.push(addItem)
      }
    },
    copyCustomStepModuleDefsEnv(i) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.customStepEnvDefForm.customStepDef.customStepModuleDefs[i])
      );
      vm.customStepEnvDefForm.customStepDef.customStepModuleDefs.push(copyItem);
    },
    deleteCustomStepModuleDefsEnv(i) {
      const vm = this;
      vm.customStepEnvDefForm.customStepDef.customStepModuleDefs.splice(i, 1);
    },
    previewCustomStepDefEnv() {
      const vm = this
      if(vm.$refs.customStepEnvDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.customStepEnvDefForm.customStepDef))
        if(!vm.manualEnableFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.manualEnable
          })
        }
        if(!vm.relatedStepModulesFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.relatedStepModules
          })
        }
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    updateCustomStepDefEnv() {
      const vm = this
      if(vm.$refs.customStepEnvDefRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.customStepEnvDefForm.customStepDef))
        if(!vm.manualEnableFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.manualEnable
          })
        }
        if(!vm.relatedStepModulesFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.relatedStepModules
          })
        }
        var customStepDefYaml = YAML.stringify(copyData, 4)
        request.post(`/cicd/projectDef/${vm.targetProjectName}/customStepDef/env`, {
          customStepName: vm.customStepEnvDefForm.customStepName,
          envName: vm.targetEnvName,
          customStepDefYaml: customStepDefYaml
        }).then(response => {
          vm.customStepEnvDefDialog = false
          vm.successTip(true, response.msg);
          vm.refresh();
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    checkcustomStepModuleDef(e, i) {
      const vm = this;
      if (e) {
        vm.indexList.push(i);
        vm.indexList = Array.from(
          new Set(vm.indexList)
        );
      } else {
        vm.indexList = Array.from(
          new Set(vm.indexList)
        );
        vm.indexList.forEach((item, index) => {
          if (item === i) {
            vm.indexList.splice(index, 1);
          }
        });
      }
    },
    openCustomStepDefToEnv() {
      const vm = this
      if(vm.$refs.customStepEnvDefRef.validate()){
        if(vm.indexList.length > 0 ){
          vm.envNames = []
          vm.copyToEnv4Dialog = true
          vm.project.projectAvailableEnvs.map((item, index) => {
            vm.copyEnvList.push(item.envName);
          });
          vm.copyEnvList.forEach((row, i) => {
            if (row === vm.targetEnvName) {
              vm.copyEnvList.splice(i, 1);
            }
          });
          vm.indexList.map((item) => {
            vm.copyCustomStepModuleDefsForm.push(vm.customStepEnvDefForm.customStepDef.customStepModuleDefs[item]);
          });
        }else{
          vm.warnTip(true, "请选择需要复制的项");
        }
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    customStepDefToEnv() {
      const vm = this
      if(vm.$refs.copyToEnv4Ref.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.customStepEnvDefForm.customStepDef))
        if(!vm.manualEnableFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.manualEnable
          })
        }
        if(!vm.relatedStepModulesFlag){
          copyData.customStepModuleDefs.forEach(item => {
            delete item.relatedStepModules
          })
        }
        copyData.customStepModuleDefs = vm.copyCustomStepModuleDefsForm
        console.log(copyData)
        var customStepDefYaml = YAML.stringify(copyData, 4)
        request.put(`/cicd/projectDef/${vm.targetProjectName}/customStepDef/env`, {
          customStepName: vm.customStepEnvDefForm.customStepName,
          customStepDefYaml: customStepDefYaml,
          envNames: vm.envNames
        }).then(response => {
          vm.copyToEnv4Dialog = false
          vm.successTip(true, response.msg);
          vm.refresh();
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg);
        })
      }
    },
    formateText(value) {
      if (typeof value === "object" && value !== null) {
        return value.join(";").replaceAll(";", "\n");
      } else if (typeof value === "string") {
        var newValue = value.replaceAll("\n", ";").split(";");
        newValue.forEach((item, index) => {
          if (!item) {
            newValue.splice(index, 1);
          }
        });
        return newValue;
      } else {
        return value;
      }
    },
    refresh() {
      const vm = this;
      request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
        vm.project = response.data.project;
        vm.cardLoading = false;
      }).catch((error) => {
        vm.cardLoading = false;
        vm.errorTip(true, error.response.data.msg);
      });
    },
    openBuildDef() {
      const vm = this;
      vm.buildDefDialog = true;
      vm.dialogLoading = true;
      request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
        vm.buildDefForm = response.data.project.projectDef.buildDefs;
        vm.buildDefForm.map((item) => {
          item.buildCmds = vm.formateText(item.buildCmds);
          item.buildChecks = vm.formateText(item.buildChecks);
        });
        vm.dialogLoading = false;
        console.log(vm.buildDefForm);
      });
    },
    copyDef(i) {
      const vm = this;
      var copyItem = JSON.parse(JSON.stringify(vm.buildDefForm[i]));
      copyItem.buildName = vm.buildDefForm[i].buildName + "-copy";
      vm.buildDefForm.push(copyItem);
    },
    deleteDef(i) {
      const vm = this;
      vm.buildDefForm.splice(i, 1);
    },
    addDef() {
      const vm = this;
      var addItem = {
        buildChecks: "",
        buildCmds: "",
        // buildDesc: "",
        buildEnv: "",
        buildName: "",
        buildPath: "",
        buildPhaseID: 1,
      };
      vm.buildDefForm.unshift(addItem);
    },
    previewBuildDef() {
      const vm = this;
      if (vm.$refs.buildDefRef.validate()) {
        let copyData = JSON.parse(JSON.stringify(vm.buildDefForm))
        copyData.map((item) => {
          item.buildCmds = vm.formateText(item.buildCmds);
          item.buildChecks = vm.formateText(item.buildChecks);
        });
        vm.yamlText = YAML.stringify(copyData, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    updateBuildDef() {
      const vm = this;
      vm.buildDefForm.map((item) => {
        item.buildCmds = vm.formateText(item.buildCmds);
        item.buildChecks = vm.formateText(item.buildChecks);
      });
      var buildDefsYaml = YAML.stringify(vm.buildDefForm, 4);
      if (vm.$refs.buildDefRef.validate()) {
        request
          .post(`/cicd/projectDef/${vm.targetProjectName}/buildDefs`, {
            buildDefsYaml: buildDefsYaml,
          })
          .then((response) => {
            vm.buildDefDialog = false;
            vm.successTip(true, response.msg);
            vm.refresh();
          })
          .catch((error) => {
            vm.errorTip(true, error.response.data.msg);
            vm.buildDefForm.map((item) => {
              item.buildCmds = vm.formateText(item.buildCmds);
              item.buildChecks = vm.formateText(item.buildChecks);
            });
          });
      }
    },
    openPackageDef() {
      const vm = this;
      vm.packageDefDialog = true;
      vm.dialogLoading = true;
      request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
        vm.errMsgPackageDefs = response.data.project.projectDef.errMsgPackageDefs;
        vm.packageDefForm = response.data.project.projectDef.packageDefs;
        vm.packageDefForm.map((item) => {
          let newRelatedBuilds = [];
          newRelatedBuilds = item.relatedBuilds.filter((e) => {
            return vm.project.buildNames.indexOf(e) !== -1;
          });
          item.relatedBuilds = newRelatedBuilds;
          item.packages = vm.formateText(item.packages);
        });
        console.log(vm.packageDefForm);
        vm.dialogLoading = false;
      }).catch((error) => {
        vm.dialogLoading = false;
        vm.errorTip(true, error.response.data.msg);
      });
      vm.timer2 = setTimeout(() => {
        vm.$refs.packageDefRef.validate();
      }, 500);
    },
    addPackageDef() {
      const vm = this;
      var addItem = {
        packageFrom: "",
        packageName: "",
        packages: "",
        relatedBuilds: [],
      };
      vm.packageDefForm.unshift(addItem);
    },
    previewPackageDef() {
      const vm = this;
      if (vm.$refs.packageDefRef.validate()) {
        let copyData = JSON.parse(JSON.stringify(vm.packageDefForm))
        copyData.map((item) => {
          item.packages = vm.formateText(item.packages);
        });
        vm.yamlText = YAML.stringify(copyData, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    copyPackageDef(i) {
      const vm = this;
      var copyItem = JSON.parse(JSON.stringify(vm.packageDefForm[i]));
      copyItem.packageName = vm.packageDefForm[i].packageName + "-copy";
      vm.packageDefForm.push(copyItem);
    },
    deletePackageDef(i) {
      const vm = this;
      vm.packageDefForm.splice(i, 1);
    },
    updatePackageDef() {
      const vm = this;
      if (vm.$refs.packageDefRef.validate()) {
        vm.packageDefForm.map((item) => {
          item.packages = vm.formateText(item.packages);
        });
        var packageDefsYaml = YAML.stringify(vm.packageDefForm, 4);
        request
          .post(`/cicd/projectDef/${vm.targetProjectName}/packageDefs`, {
            packageDefsYaml: packageDefsYaml,
          })
          .then((response) => {
            vm.packageDefDialog = false;
            vm.successTip(true, response.msg);
            vm.refresh();
          })
          .catch((error) => {
            vm.packageDefForm.map((item) => {
              item.packages = vm.formateText(item.packages);
            });
            vm.errorTip(true, error.response.data.msg);
          });
      }
    },
    openDockerIgnoreDef() {
      const vm = this;
      vm.dockerIgnoreDefDialog = true;
      vm.dialogLoading = true;
      request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
        vm.dockerIgnoreDefForm =  response.data.project.projectDef.dockerIgnoreDefs;
        vm.dockerIgnoreDefForm = vm.formateText(vm.dockerIgnoreDefForm);
        vm.dialogLoading = false;
      }).catch((error) => {
        vm.dialogLoading = false;
        vm.errorTip(true, error.response.data.msg);
      });
    },
    previewDockerIgnoreDef() {
      const vm = this;
      let copyData = vm.dockerIgnoreDefForm
      copyData = vm.formateText(copyData);
      vm.yamlText = YAML.stringify(copyData, 4);
      vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
      vm.YAMLDialog = true;
    },
    updateDockerIgnoreDef() {
      const vm = this;
      let copyData = vm.dockerIgnoreDefForm
      copyData = vm.formateText(copyData);
      var dockerIgnoreDefsYaml = YAML.stringify(copyData, 4);
      request
        .post(`/cicd/projectDef/${vm.targetProjectName}/dockerIgnoreDefs`, {
          dockerIgnoreDefsYaml: dockerIgnoreDefsYaml,
        })
        .then((response) => {
          vm.dockerIgnoreDefDialog = false;
          vm.successTip(true, response.msg);
          vm.refresh();
        })
        .catch((error) => {
          vm.errorTip(true, error.response.data.msg);
        });
    },
    getPipelineDef(projectName, branchName) {
      const vm = this;
      if (projectName === "") {
        projectName = vm.targetProjectName;
      }
      vm.targetBranchName = branchName;
      vm.copyInsertDefNames = JSON.parse(JSON.stringify(vm.InsertDefNames))
      request.get(`/cicd/projectDef/${projectName}/${branchName}/pipelineDef`).then((response) => {
        vm.pipelineDefForm = response.data.pipelineDef;
        vm.errMsgPipelineDef = response.data.errMsgPipelineDef
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
        vm.customList = vm.project.cicdCustomStepInserts[vm.targetName]
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
    // InsertDefChange() {
    //   const vm = this
    //   vm.pipelineDefForm.customStepInsertDefs.map(i => {
    //     vm.InsertDefNames.map((row, index) => {
    //       if(i[0] === row.text){
    //         row.disabled = true
    //       }else{
    //         row.disabled = false
    //       }
    //     })
    //   })
    // },
    openYaml() {
      const vm = this;
      let copyData = JSON.parse(JSON.stringify(vm.pipelineDefForm))
      vm.yamlText = YAML.stringify(copyData, 4);
      vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
      vm.YAMLDialog = true;
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
        vm.refresh();
      }).catch((error) => {
        vm.errorTip(true, error.response.data.msg);
      });
    },
    openDeployContainerDef(envName) {
      const vm = this;
      vm.deployContainerDefDialog = true;
      vm.dialogLoading = true;
      vm.targetEnvName = envName;
      vm.copyDeployContainerDefForm = [];
      request.get(`/cicd/projectDef/${vm.targetProjectName}`).then((response) => {
        response.data.project.projectAvailableEnvs.map((item) => {
          if (item.envName === envName) {
            vm.deployContainerDefForm = item.deployContainerDefs;
            vm.errMsgDeployContainerDefs = item.errMsgDeployContainerDefs;
            vm.pvs = item.pvcNames;
            vm.deployContainerDefForm.map((e, i) => {
              Object.keys(e).forEach(item => {
                if(e[item] !== null){
                  if(e[item] instanceof Array && e[item].length <= 0){
                    e[item] = null
                  }else if(e[item] instanceof Object && JSON.stringify(e[item]) == "{}"){
                    e[item] = null
                  }
                }
              })
              let newRelatedPackage = "";
              newRelatedPackage = vm.project.packageNames.indexOf(e.relatedPackage);
              if (newRelatedPackage === -1) {
                e.relatedPackage = "";
              }
              if (e.deployEnvs !== null) {
                e.deployEnvs.forEach((row, rowIndex) => {
                  row = row.split("=");
                  e.deployEnvs[rowIndex] = row;
                });
              }
              if (e.deployConfigSettings !== null) {
                e.deployConfigSettings.forEach((j, jIndex) => {
                  j = j.split(":");
                  e.deployConfigSettings[jIndex] = j;
                });
              }
            });
          }
        });
        vm.dialogLoading = false;
        console.log(vm.deployContainerDefForm);
      }).catch((error) => {
        vm.dialogLoading = false;
        vm.errorTip(true, error.response.data.msg);
      });
      vm.timer2 = setTimeout(() => {
        vm.$refs.deployContainerDefRef.validate();
      }, 500);
    },
    addDeployContainerDef() {
      const vm = this;
      var addItem = {
        deployName: "",
        relatedPackage: "",
        deployReplicas: 1,
        deployResources: {
          cpuLimit: '',
          cpuRequest: '',
          memoryLimit: '',
          memoryRequest: ''
        },
        deployVolumes: null,
        deployHealthCheck: {
          checkPort: 0,
          httpGet: {
            httpHeaders: null,
            path: "",
            port: 0,
          },
          livenessDelaySeconds: 0,
          livenessPeriodSeconds: 0,
          readinessDelaySeconds: 0,
          readinessPeriodSeconds: 0,
        },
        deployLocalPorts: null,
        deployNodePorts: null,
        hpaConfig: {
          cpuAverageRequestPercent: 0,
          maxReplicas: 0,
          memoryAverageRequestPercent: 0,
          cpuAverageValue: "",
          memoryAverageValue: "",
        },
        dependServices: null,
        hostAliases: null,
        securityContext: {
          runAsUser: 0,
          runAsGroup: 0,
        },
        deployConfigSettings: null,
        deployEnvs: null,
        deployCommand: "",
        deploySessionAffinityTimeoutSeconds: 0,
      };
      vm.deployContainerDefForm.unshift(addItem);
    },
    previewDeployContainerDef() {
      const vm = this;
      if (vm.$refs.deployContainerDefRef.validate()) {
        var copyData = JSON.parse(JSON.stringify(vm.deployContainerDefForm))
        copyData.map((e, i) => {
          if (e.deploySessionAffinityTimeoutSeconds !== null && e.deploySessionAffinityTimeoutSeconds !== 0) {
            e.deploySessionAffinityTimeoutSeconds = Number(e.deploySessionAffinityTimeoutSeconds);
          }else{
            delete e.deploySessionAffinityTimeoutSeconds
          }
          if (e.deployLocalPorts !== null) {
            e.deployLocalPorts.map((item) => {
              item.port = Number(item.port);
            });
          }
          if (e.deployNodePorts !== null) {
            e.deployNodePorts.map((item) => {
              item.port = Number(item.port);
            });
          }
          if (e.dependServices !== null) {
            e.dependServices.map((item) => {
              item.dependPort = Number(item.dependPort);
            });
          }
          e.deployHealthCheck.checkPort = Number(e.deployHealthCheck.checkPort);
          e.deployHealthCheck.livenessDelaySeconds = Number(e.deployHealthCheck.livenessDelaySeconds);
          e.deployHealthCheck.livenessPeriodSeconds = Number(e.deployHealthCheck.livenessPeriodSeconds);
          e.deployHealthCheck.readinessDelaySeconds = Number(e.deployHealthCheck.readinessDelaySeconds);
          e.deployHealthCheck.readinessPeriodSeconds = Number(e.deployHealthCheck.readinessPeriodSeconds);
          e.deployHealthCheck.httpGet.port = Number(e.deployHealthCheck.httpGet.port);
          e.hpaConfig.cpuAverageRequestPercent = Number(e.hpaConfig.cpuAverageRequestPercent);
          e.hpaConfig.maxReplicas = Number(e.hpaConfig.maxReplicas);
          e.hpaConfig.memoryAverageRequestPercent = Number(e.hpaConfig.memoryAverageRequestPercent);
          e.securityContext.runAsUser = Number(e.securityContext.runAsUser);
          e.securityContext.runAsGroup = Number(e.securityContext.runAsGroup);
          e.deployReplicas = Number(e.deployReplicas);
          if (e.deployEnvs !== null && e.deployEnvs.length > 0) {
            e.deployEnvs.map((row, rowIndex) => {
              row = row.join("=");
              e.deployEnvs[rowIndex] = row;
            });
          }
          if (e.deployConfigSettings !== null) {
            e.deployConfigSettings.map((j, jIndex) => {
              j = j.join(":");
              e.deployConfigSettings[jIndex] = j;
            });
          }
          Object.keys(e).forEach(item => {
            if(e[item] !== null){
              if(e[item] instanceof Array && e[item].length <= 0){
                delete e[item]
              }else if(e[item] instanceof Object && JSON.stringify(e[item]) == "{}"){
                delete e[item]
              }else if(e[item] === ''){
                delete e[item]
              }else if(e[item] instanceof Object){
                if(item === 'hpaConfig'){
                  if(e.hpaConfig.cpuAverageRequestPercent === 0 && e.hpaConfig.maxReplicas === 0 && e.hpaConfig.memoryAverageRequestPercent === 0 && e.hpaConfig.cpuAverageValue === '' && e.hpaConfig.memoryAverageValue === '' ){
                    delete e.hpaConfig
                  }else{
                    vm.sortData(e.hpaConfig)
                  }
                }else if(item === 'deployResources'){
                  if(e.deployResources.cpuLimit === '' && e.deployResources.cpuRequest === '' && e.deployResources.memoryLimit === '' && e.deployResources.memoryRequest === ''){
                    delete e.deployResources
                  }else{
                    vm.sortData(e.deployResources)
                  }
                }else if(item === 'deployHealthCheck'){
                  if(e.deployHealthCheck.checkPort === 0 && e.deployHealthCheck.livenessDelaySeconds === 0 && e.deployHealthCheck.livenessPeriodSeconds === 0 && e.deployHealthCheck.readinessDelaySeconds === 0 && e.deployHealthCheck.readinessPeriodSeconds === 0 && e.deployHealthCheck.httpGet.port === 0 && e.deployHealthCheck.httpGet.httpHeaders === null && e.deployHealthCheck.httpGet.path === ''){
                    delete e.deployHealthCheck
                  }else{
                    vm.sortData(e.deployHealthCheck.httpGet)
                    vm.sortData(e.deployHealthCheck)
                  }
                }else if(item === 'securityContext'){
                  if(e.securityContext.runAsGroup === 0 && e.securityContext.runAsUser === 0){
                    delete e.securityContext
                  }else{
                    vm.sortData(e.securityContext)
                  }
                }else if(item === 'deployVolumes'){
                  if(e.deployVolumes && e.deployVolumes !== null && e.deployVolumes.length > 0){
                    e.deployVolumes.forEach(row => {
                      vm.sortData(row)
                    })
                  }
                }else if(item === 'deployLocalPorts'){
                  if(e.deployLocalPorts && e.deployLocalPorts !== null && e.deployLocalPorts.length > 0){
                    e.deployLocalPorts.forEach(row => {
                      vm.sortData(row.ingress)
                      vm.sortData(row)
                    })
                  }
                }
              }
            }else{
              delete e[item]
            }
          })
        });
        vm.yamlText = YAML.stringify(copyData, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    copyDeployContainerDef(i) {
      const vm = this;
      var copyItem = JSON.parse(JSON.stringify(vm.deployContainerDefForm[i]));
      copyItem.deployName = vm.deployContainerDefForm[i].deployName + "-copy";
      vm.deployContainerDefForm.push(copyItem);
    },
    deleteDeployContainerDef(i) {
      const vm = this;
      vm.deployContainerDefForm.splice(i, 1);
    },
    clearParams(i, name) {
      const vm = this;
      if(name === "other") {
        vm.deployContainerDefForm[i].deployCommand = "";
        vm.deployContainerDefForm[i].deployEnvs = null;
        vm.deployContainerDefForm[i].deploySessionAffinityTimeoutSeconds = 0;
      } else if (name === "securityContext") {
        vm.deployContainerDefForm[i].securityContext = {
          runAsUser: 0,
          runAsGroup: 0,
        };
      }else if(name === "deployHealthCheck") {
        vm.deployContainerDefForm[i].deployHealthCheck = {
          checkPort: 0,
          httpGet: {
            httpHeaders: null,
            path: "",
            port: 0,
          },
          livenessDelaySeconds: 0,
          livenessPeriodSeconds: 0,
          readinessDelaySeconds: 0,
          readinessPeriodSeconds: 0,
        };
      }else if(name === "hpaConfig") {
        vm.deployContainerDefForm[i].hpaConfig = {
          cpuAverageRequestPercent: 0,
          maxReplicas: 0,
          memoryAverageRequestPercent: 0,
          cpuAverageValue: "",
          memoryAverageValue: "",
        };
      }else if(name === 'deployResources'){
        vm.deployContainerDefForm[i].deployResources = {
          cpuLimit: '',
          cpuRequest: '',
          memoryLimit: '',
          memoryRequest: ''
        };
      }else if(name === 'portSetting'){
        vm.deployContainerDefForm[i].deployNodePorts = null
        vm.deployContainerDefForm[i].deployLocalPorts = null
      }else{
        vm.deployContainerDefForm[i][name] = null;
      }
      console.log(vm.deployContainerDefForm[i][name])
    },
    addDeployEnvs(i) {
      const vm = this;
      let addItem = ["", ""];
      if (vm.deployContainerDefForm[i].deployEnvs === null) {
        vm.deployContainerDefForm[i].deployEnvs = [];
        vm.deployContainerDefForm[i].deployEnvs.push(addItem);
      } else {
        vm.deployContainerDefForm[i].deployEnvs.push(addItem);
      }
    },
    addDeployLocalPort(i) {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "http",
        ingress: {
          domainName: "",
          pathPrefix: "",
        },
      };
      if (vm.deployContainerDefForm[i].deployLocalPorts === null) {
        vm.deployContainerDefForm[i].deployLocalPorts = [];
        vm.deployContainerDefForm[i].deployLocalPorts.push(addItem);
      } else {
        vm.deployContainerDefForm[i].deployLocalPorts.push(addItem);
      }
    },
    copyDeployLocalPort(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].deployLocalPorts[j])
      );
      vm.deployContainerDefForm[i].deployLocalPorts.push(copyItem);
    },
    deleteDeployLocalPort(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployLocalPorts.splice(j, 1);
    },
    deleteDeployEnvs(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployEnvs.splice(j, 1);
    },
    addDeployNodePort(i) {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "http",
        nodePort: null,
      };
      if (vm.deployContainerDefForm[i].deployNodePorts === null) {
        vm.deployContainerDefForm[i].deployNodePorts = [];
        vm.deployContainerDefForm[i].deployNodePorts.push(addItem);
      } else {
        vm.deployContainerDefForm[i].deployNodePorts.push(addItem);
      }
    },
    copyDeployNodePort(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].deployNodePorts[j])
      );
      vm.deployContainerDefForm[i].deployNodePorts.push(copyItem);
    },
    deleteDeployNodePort(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployNodePorts.splice(j, 1);
    },
    addDeployVolumes(i) {
      const vm = this;
      let addItem = {
        pathInPod: "",
        pathInPv: "",
        pvc: "",
      };
      if (vm.deployContainerDefForm[i].deployVolumes === null) {
        vm.deployContainerDefForm[i].deployVolumes = [];
        vm.deployContainerDefForm[i].deployVolumes.push(addItem);
      } else {
        vm.deployContainerDefForm[i].deployVolumes.push(addItem);
      }
    },
    copyDeployVolumes(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].deployVolumes[j])
      );
      vm.deployContainerDefForm[i].deployVolumes.push(copyItem);
    },
    deleteDeployVolumes(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployVolumes.splice(j, 1);
    },
    addHttpHeaders(i) {
      const vm = this;
      let addItem = {
        name: "",
        value: "",
      };
      if (
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders ===
        null
      ) {
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders = [];
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      } else {
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      }
    },
    copyHttpHeaders(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(
          vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders[j]
        )
      );
      vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders.push(
        copyItem
      );
    },
    deleteHttpHeaders(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders.splice(
        j,
        1
      );
    },
    addDependServices(i) {
      const vm = this;
      let addItem = {
        dependName: "",
        dependPort: null,
        dependType: "TCP",
      };
      if (vm.deployContainerDefForm[i].dependServices === null) {
        vm.deployContainerDefForm[i].dependServices = [];
        vm.deployContainerDefForm[i].dependServices.push(addItem);
      } else {
        vm.deployContainerDefForm[i].dependServices.push(addItem);
      }
    },
    copyDependServices(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].dependServices[j])
      );
      vm.deployContainerDefForm[i].dependServices.push(copyItem);
    },
    deleteDependServices(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].dependServices.splice(j, 1);
    },
    addHostAliases(i) {
      const vm = this;
      let addItem = {
        ip: "",
        hostnames: [],
      };
      if (vm.deployContainerDefForm[i].hostAliases === null) {
        vm.deployContainerDefForm[i].hostAliases = [];
        vm.deployContainerDefForm[i].hostAliases.push(addItem);
      } else {
        vm.deployContainerDefForm[i].hostAliases.push(addItem);
      }
    },
    copyHostAliases(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].hostAliases[j])
      );
      vm.deployContainerDefForm[i].hostAliases.push(copyItem);
    },
    deleteHostAliases(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].hostAliases.splice(j, 1);
    },
    addDeployConfigSettings(i) {
      const vm = this;
      let addItem = ["", ""];
      if (vm.deployContainerDefForm[i].deployConfigSettings === null) {
        vm.deployContainerDefForm[i].deployConfigSettings = [];
        vm.deployContainerDefForm[i].deployConfigSettings.push(addItem);
      } else {
        vm.deployContainerDefForm[i].deployConfigSettings.push(addItem);
      }
    },
    copyDeployConfigSettings(i, j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.deployContainerDefForm[i].deployConfigSettings[j])
      );
      vm.deployContainerDefForm[i].deployConfigSettings.push(copyItem);
    },
    deleteDeployConfigSettings(i, j) {
      const vm = this;
      vm.deployContainerDefForm[i].deployConfigSettings.splice(j, 1);
    },
    updateDeployContainerDef() {
      const vm = this;
      if (vm.$refs.deployContainerDefRef.validate()) {
        let copyData = JSON.parse(JSON.stringify(vm.deployContainerDefForm))
        copyData.map((e, i) => {
          if (e.deploySessionAffinityTimeoutSeconds !== null && e.deploySessionAffinityTimeoutSeconds !== 0) {
            e.deploySessionAffinityTimeoutSeconds = Number(e.deploySessionAffinityTimeoutSeconds);
          }else{
            delete e.deploySessionAffinityTimeoutSeconds
          }
          if (e.deployLocalPorts !== null) {
            e.deployLocalPorts.map((item) => {
              item.port = Number(item.port);
            });
          }
          if (e.deployNodePorts !== null) {
            e.deployNodePorts.map((item) => {
              item.port = Number(item.port);
            });
          }
          if (e.dependServices !== null) {
            e.dependServices.map((item) => {
              item.dependPort = Number(item.dependPort);
            });
          }
          e.deployHealthCheck.checkPort = Number(e.deployHealthCheck.checkPort);
          e.deployHealthCheck.livenessDelaySeconds = Number(e.deployHealthCheck.livenessDelaySeconds);
          e.deployHealthCheck.livenessPeriodSeconds = Number(e.deployHealthCheck.livenessPeriodSeconds);
          e.deployHealthCheck.readinessDelaySeconds = Number(e.deployHealthCheck.readinessDelaySeconds);
          e.deployHealthCheck.readinessPeriodSeconds = Number(e.deployHealthCheck.readinessPeriodSeconds);
          e.deployHealthCheck.httpGet.port = Number(e.deployHealthCheck.httpGet.port);
          e.hpaConfig.cpuAverageRequestPercent = Number(e.hpaConfig.cpuAverageRequestPercent);
          e.hpaConfig.maxReplicas = Number(e.hpaConfig.maxReplicas);
          e.hpaConfig.memoryAverageRequestPercent = Number(e.hpaConfig.memoryAverageRequestPercent);
          e.securityContext.runAsUser = Number(e.securityContext.runAsUser);
          e.securityContext.runAsGroup = Number(e.securityContext.runAsGroup);
          e.deployReplicas = Number(e.deployReplicas);
          if (e.deployEnvs !== null && e.deployEnvs.length > 0) {
            e.deployEnvs.map((row, rowIndex) => {
              row = row.join("=");
              e.deployEnvs[rowIndex] = row;
            });
          }
          if (e.deployConfigSettings !== null) {
            e.deployConfigSettings.map((j, jIndex) => {
              j = j.join(":");
              e.deployConfigSettings[jIndex] = j;
            });
          }
          Object.keys(e).forEach(item => {
            if(e[item] !== null){
              if(e[item] instanceof Array && e[item].length <= 0){
                delete e[item]
              }else if(e[item] instanceof Object && JSON.stringify(e[item]) == "{}"){
                delete e[item]
              }else if(e[item] === ''){
                delete e[item]
              }else if(e[item] instanceof Object){
                if(item === 'hpaConfig'){
                  if(e.hpaConfig.cpuAverageRequestPercent === 0 && e.hpaConfig.maxReplicas === 0 && e.hpaConfig.memoryAverageRequestPercent === 0 && e.hpaConfig.cpuAverageValue === '' && e.hpaConfig.memoryAverageValue === '' ){
                    delete e.hpaConfig
                  }else{
                    vm.sortData(e.hpaConfig)
                  }
                }else if(item === 'deployResources'){
                  if(e.deployResources.cpuLimit === '' && e.deployResources.cpuRequest === '' && e.deployResources.memoryLimit === '' && e.deployResources.memoryRequest === ''){
                    delete e.deployResources
                  }else{
                    vm.sortData(e.deployResources)
                  }
                }else if(item === 'deployHealthCheck'){
                  if(e.deployHealthCheck.checkPort === 0 && e.deployHealthCheck.livenessDelaySeconds === 0 && e.deployHealthCheck.livenessPeriodSeconds === 0 && e.deployHealthCheck.readinessDelaySeconds === 0 && e.deployHealthCheck.readinessPeriodSeconds === 0 && e.deployHealthCheck.httpGet.port === 0 && e.deployHealthCheck.httpGet.httpHeaders === null && e.deployHealthCheck.httpGet.path === ''){
                    delete e.deployHealthCheck
                  }else{
                    vm.sortData(e.deployHealthCheck.httpGet)
                    vm.sortData(e.deployHealthCheck)
                  }
                }else if(item === 'securityContext'){
                  if(e.securityContext.runAsGroup === 0 && e.securityContext.runAsUser === 0){
                    delete e.securityContext
                  }else{
                    vm.sortData(e.securityContext)
                  }
                }else if(item === 'deployVolumes'){
                  if(e.deployVolumes && e.deployVolumes !== null && e.deployVolumes.length > 0){
                    e.deployVolumes.forEach(row => {
                      vm.sortData(row)
                    })
                  }
                }else if(item === 'deployLocalPorts'){
                  if(e.deployLocalPorts && e.deployLocalPorts !== null && e.deployLocalPorts.length > 0){
                    e.deployLocalPorts.forEach(row => {
                      vm.sortData(row.ingress)
                      vm.sortData(row)
                    })
                  }
                }
              }
            }else{
              delete e[item]
            }
          })
        });
        var deployContainerDefsYaml = YAML.stringify(copyData, 4);
        request.post(`/cicd/projectDef/${vm.targetProjectName}/deployContainerDefs`,
          {
            deployContainerDefsYaml: deployContainerDefsYaml,
            envName: vm.targetEnvName,
          }
        ).then((response) => {
          vm.deployContainerDefDialog = false;
          vm.successTip(true, response.msg);
          vm.refresh();
        }).catch((error) => {
          vm.errorTip(true, error.response.data.msg);
        });
      }
    },
    checkdeployContainerDef(e, i) {
      const vm = this;
      if (e) {
        vm.copyDeployContainerDefIndex.push(i);
        vm.copyDeployContainerDefIndex = Array.from(
          new Set(vm.copyDeployContainerDefIndex)
        );
      } else {
        vm.copyDeployContainerDefIndex = Array.from(
          new Set(vm.copyDeployContainerDefIndex)
        );
        vm.copyDeployContainerDefIndex.forEach((item, index) => {
          if (item === i) {
            vm.copyDeployContainerDefIndex.splice(index, 1);
          }
        });
      }
      console.log(vm.copyDeployContainerDefIndex);
    },
    openDeployContainerDefToEnv() {
      const vm = this;
      if (vm.$refs.deployContainerDefRef.validate()) {
        if (vm.copyDeployContainerDefIndex.length !== 0) {
          vm.copyToEnvDialog = true;
          vm.project.projectAvailableEnvs.map((item, index) => {
            vm.copyEnvList.push(item.envName);
          });
          vm.copyEnvList.forEach((row, i) => {
            if (row === vm.targetEnvName) {
              vm.copyEnvList.splice(i, 1);
            }
          });
          vm.copyDeployContainerDefIndex.map((item) => {
            vm.copyDeployContainerDefForm.push(vm.deployContainerDefForm[item]);
          });
        } else {
          vm.warnTip(true, "请选择复制的定义");
        }
      }
    },
    deployContainerDefToEnv() {
      const vm = this;
      if (vm.$refs.copyToEnvRef.validate()) {
        vm.copyDeployContainerDefForm.map((e, i) => {
          if (e.deployEnvs !== null) {
            e.deployEnvs.forEach((row, rowIndex) => {
              row = row.join("=");
              e.deployEnvs[rowIndex] = row;
            });
          }
          if (e.deployConfigSettings !== null) {
            e.deployConfigSettings.forEach((j, jIndex) => {
              j = j.join(":");
              e.deployConfigSettings[jIndex] = j;
            });
          }
        });
        var deployContainerDefsYaml = YAML.stringify(
          vm.copyDeployContainerDefForm,
          4
        );
        request
          .put(`/cicd/projectDef/${vm.targetProjectName}/deployContainerDefs`, {
            deployContainerDefsYaml: deployContainerDefsYaml,
            envNames: vm.envNames,
          })
          .then((response) => {
            vm.copyToEnvDialog = false;
            vm.successTip(true, response.msg);
            vm.refresh();
          })
          .catch((error) => {
            vm.errorTip(true, error.response.data.msg);
            vm.copyDeployContainerDefForm.map((e, i) => {
              if (e.deployEnvs !== null) {
                e.deployEnvs.forEach((row, rowIndex) => {
                  row = row.split("=");
                  e.deployEnvs[rowIndex] = row;
                });
              }
              if (e.deployConfigSettings !== null) {
                e.deployConfigSettings.forEach((j, jIndex) => {
                  j = j.split(":");
                  e.deployConfigSettings[jIndex] = j;
                });
              }
            });
          });
      }
    },
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
    },
    onCopy() {
      this.successTip(true, "复制成功");
    },
    onError() {
      this.errorTip(true, "复制失败");
    },
    goRun(runName) {
      this.$router.push({
        name: "CicdRun",
        params: {
          runName: runName,
        },
      });
    },
    chooseParams(e, i) {
      const vm = this;
      if (e === "杂项") {
        if (
          vm.deployContainerDefForm[i].deployEnvs === null &&
          vm.deployContainerDefForm[i].deploySessionAffinityTimeoutSeconds ===
            0 &&
          vm.deployContainerDefForm[i].deployCommand === ""
        ) {
          vm.deployContainerDefForm[i].deployEnvs = [["", ""]];
        }
      } else if (e === "deployLocalPorts" || e === "deployNodePorts") {
        if (
          vm.deployContainerDefForm[i].deployNodePorts === null &&
          vm.deployContainerDefForm[i].deployLocalPorts === null
        ) {
          vm.deployContainerDefForm[i][e] = [];
        } else {
          vm.warnTip(true, "已存在可用配置项或存在互斥配置项，请勿重复添加");
        }
      } else if (e === "securityContext") {
        if (
          vm.deployContainerDefForm[i].securityContext.runAsUser == 0 &&
          vm.deployContainerDefForm[i].securityContext.runAsGroup == 0
        ) {
          console.log(vm.deployContainerDefForm[i].securityContext);
          vm.deployContainerDefForm[i].securityContext = {
            runAsUser: 1000,
            runAsGroup: 0,
          };
        }
      } else if (e === "deployHealthCheck") {
        if (
          vm.deployContainerDefForm[i].deployHealthCheck
            .livenessDelaySeconds === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck
            .livenessPeriodSeconds === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck
            .readinessDelaySeconds === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck
            .readinessPeriodSeconds === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck.checkPort === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck.httpGet.port === 0 &&
          vm.deployContainerDefForm[i].deployHealthCheck.httpGet.path === "" &&
          vm.deployContainerDefForm[i].deployHealthCheck.httpGet.httpHeaders ===
            null
        ) {
          vm.deployContainerDefForm[
            i
          ].deployHealthCheck.readinessDelaySeconds = 15;
          vm.deployContainerDefForm[
            i
          ].deployHealthCheck.readinessPeriodSeconds = 5;
          vm.deployContainerDefForm[
            i
          ].deployHealthCheck.livenessDelaySeconds = 60;
          vm.deployContainerDefForm[
            i
          ].deployHealthCheck.livenessPeriodSeconds = 30;
        }
      } else if (e === "hpaConfig") {
        if (
          vm.deployContainerDefForm[i].hpaConfig.cpuAverageRequestPercent ===
            0 ||
          vm.deployContainerDefForm[i].hpaConfig.maxReplicas === 0 ||
          vm.deployContainerDefForm[i].hpaConfig.memoryAverageRequestPercent ===
            0 ||
          vm.deployContainerDefForm[i].hpaConfig.cpuAverageValue === "" ||
          vm.deployContainerDefForm[i].hpaConfig.memoryAverageValue === ""
        ) {
          vm.deployContainerDefForm[i].hpaConfig.maxReplicas = 1;
        }
      } else if (e === "deployResources") {
        if (vm.deployContainerDefForm[i].deployResources.cpuLimit === '' && vm.deployContainerDefForm[i].deployResources.cpuRequest === '' && vm.deployContainerDefForm[i].deployResources.memoryLimit === '' && vm.deployContainerDefForm[i].deployResources.memoryRequest === '') {
          vm.deployContainerDefForm[i].deployResources = {
            memoryRequest: "10Mi",
            memoryLimit: "100Mi",
            cpuRequest: "10m",
            cpuLimit: "100m",
          };
        }
      }else if(e === '服务端口设置'){
        if(vm.deployContainerDefForm[i].deployNodePorts === null && vm.deployContainerDefForm[i].deployLocalPorts === null){
          vm.deployContainerDefForm[i].deployNodePorts = []
        }
      } else {
        if (vm.deployContainerDefForm[i][e] === null) {
          if (
            e === "deployVolumes" ||
            e === "dependServices" ||
            e === "hostAliases" ||
            e === "deployConfigSettings"
          ) {
            vm.deployContainerDefForm[i][e] = [];
          } else {
            vm.deployContainerDefForm[i][e] = {};
          }
        }
      }
      vm.timer = setTimeout(() => {
        document.querySelector("#" + e + "-" + i).scrollIntoView(true);
      }, 500);
    },
    checkChange(e, i) {
      const vm = this;
      console.log(vm.deployContainerDefForm)
      if (e === "checkPort") {
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet = {
          port: 0,
          path: "",
          httpHeaders: null
        }
        vm.deployContainerDefForm[i].deployHealthCheck.checkPort = 8080
      }else{
        vm.deployContainerDefForm[i].deployHealthCheck.httpGet = {
          path: "",
          port: 8080,
          httpHeaders: null,
        }
        vm.deployContainerDefForm[i].deployHealthCheck.checkPort = 0
      }
    },
    changePortSet(e, i) {
      const vm = this;
      if(e === 'deployNodePorts'){
        vm.deployContainerDefForm[i].deployNodePorts = []
        vm.deployContainerDefForm[i].deployLocalPorts = null
      }else{
        vm.deployContainerDefForm[i].deployNodePorts = null
        vm.deployContainerDefForm[i].deployLocalPorts = []
      }
    },
    sortData(data) {
      Object.keys(data).forEach(item => {
        if(data[item] !== null){
          if(data[item] instanceof Array && data[item].length <= 0){
            delete data[item]
          }else if(data[item] instanceof Object && JSON.stringify(data[item]) == "{}"){
            delete data[item]
          }else if( typeof data[item] === 'number' && data[item] === 0){
            delete data[item]
          }else if(data[item] === ''){
            delete data[item]
          }else if(data[item] === false){
            delete data[item]
          }
        }else{
          delete data[item]
        }
      })
    },
    customOpsDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
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
      // vm.original = YAML.stringify(JSON.parse(JSON.stringify(vm.project.projectDef.customOpsDefs)), 4)
      // vm.modified = YAML.stringify(JSON.parse(JSON.stringify(vm.project.projectDef.customOpsDefs)), 4)
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    buildDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
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
      // let copyData = JSON.parse(JSON.stringify(vm.buildDefForm))
      // copyData.map((item) => {
      //   item.buildCmds = vm.formateText(item.buildCmds);
      //   item.buildChecks = vm.formateText(item.buildChecks);
      // });
      // vm.original = YAML.stringify(copyData, 4);
      // vm.modified = YAML.stringify(copyData, 4);
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    packageDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
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
      // let copyData = JSON.parse(JSON.stringify(vm.packageDefForm))
      // copyData.map((item) => {
      //   item.packages = vm.formateText(item.packages);
      // });
      // vm.original = YAML.stringify(copyData, 4)
      // vm.modified = YAML.stringify(copyData, 4)
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    artifactDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
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
      // let copyData = JSON.parse(JSON.stringify(vm.artifactDefForm))
      // copyData.map((item) => {
      //   item.artifacts.map((row, index) => {
      //     row = row.join(":");
      //     item.artifacts[index] = row;
      //   });
      // });
      // vm.original = YAML.stringify(copyData, 4)
      // vm.modified = YAML.stringify(copyData, 4)
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    dockerIgnoreDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
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
      // let copyData = JSON.parse(JSON.stringify(vm.dockerIgnoreDefForm))
      // copyData = vm.formateText(copyData);
      // vm.original = YAML.stringify(copyData, 4)
      // vm.modified = YAML.stringify(copyData, 4)
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    customStepDefsHistory(defName, customStepName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
        envName: '',
        customStepName: customStepName,
        createTimeRage: {
          startDate: '',
          endDate: ''
        }
      }
      vm.dates = []
      vm.getHistory()
      vm.historyDialog = true
      // let copyData = JSON.parse(JSON.stringify(vm.customStepDefForm.customStepDef))
      // if(!vm.manualEnableFlag){
      //   copyData.customStepModuleDefs.forEach(item => {
      //     delete item.manualEnable
      //   })
      // }
      // if(!vm.relatedStepModulesFlag){
      //   copyData.customStepModuleDefs.forEach(item => {
      //     delete item.relatedStepModules
      //   })
      // }
      // vm.original = YAML.stringify(copyData, 4)
      // vm.modified = YAML.stringify(copyData, 4)
      // if(vm.$refs.monacoDiff){
      //   vm.$refs.monacoDiff.originalModel.setValue(vm.original)
      //   vm.$refs.monacoDiff.modifiedModel.setValue(vm.modified)
      // }
    },
    deployContainerDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
        envName: vm.targetEnvName,
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
    deployArtifactDefsHistory(defName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
        envName: vm.targetEnvName,
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
    customStepDefsEnvHistory(defName, customStepName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
        branchName: '',
        envName: vm.targetEnvName,
        customStepName: customStepName,
        createTimeRage: {
          startDate: '',
          endDate: ''
        }
      }
      vm.dates = []
      vm.getHistory()
      vm.historyDialog = true
    },
    pipelineDefHistory(defName, branchName) {
      const vm = this
      vm.targetDefName = defName
      vm.historyForm = {
        defName: defName,
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
        if(vm.targetDefName === 'customOpsDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/customOpsDefs`,{
            customOpsDefsYaml: vm.modified
          }).then(response => {
            vm.historyDialog = false
            vm.opsDefDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'buildDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/buildDefs`,{
            buildDefsYaml: vm.modified
          }).then(response => {
            vm.historyDialog = false
            vm.buildDefDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'packageDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/packageDefs`,{
            packageDefsYaml: vm.modified
          }).then(response => {
            vm.historyDialog = false
            vm.packageDefDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'artifactDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/artifactDefs`,{
            artifactDefsYaml: vm.modified
          }).then(response => {
            vm.historyDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'dockerIgnoreDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/dockerIgnoreDefs`,{
            dockerIgnoreDefsYaml: vm.modified
          }).then(response => {
            vm.historyDialog = false
            vm.dockerIgnoreDefDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'customStepDefs'){
          if(vm.historyForm.envName === ''){
            request.post(`/cicd/projectDef/${vm.targetProjectName}/customStepDef`,{
              customStepName: vm.targetCustomStepName,
              customStepDefYaml: vm.modified
            }).then(response => {
              vm.historyDialog = false
              vm.customStepDefDialog = false
              vm.successTip(true, response.msg);
              vm.refresh();
            }).catch(error => {
              vm.errorTip(true, error.response.data.msg);
            })
          }else{
            request.post(`/cicd/projectDef/${vm.targetProjectName}/customStepDef/env`,{
              customStepName: vm.targetCustomStepName,
              envName: vm.targetEnvName,
              customStepDefYaml: vm.modified
            }).then(response => {
              vm.historyDialog = false
              vm.customStepEnvDefDialog = false
              vm.successTip(true, response.msg);
              vm.refresh();
            }).catch(error => {
              vm.errorTip(true, error.response.data.msg);
            })
          }
        }
        if(vm.targetDefName === 'deployContainerDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/deployContainerDefs`,{
            deployContainerDefsYaml: vm.modified,
            envName: vm.targetEnvName
          }).then(response => {
            vm.historyDialog = false
            vm.deployContainerDefDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'deployArtifactDefs'){
          request.post(`/cicd/projectDef/${vm.targetProjectName}/deployArtifactDefs`,{
            deployArtifactDefsYaml: vm.modified,
            envName: vm.targetEnvName
          }).then(response => {
            vm.historyDialog = false
            vm.successTip(true, response.msg);
            vm.refresh();
          }).catch(error => {
            vm.errorTip(true, error.response.data.msg);
          })
        }
        if(vm.targetDefName === 'pipelineDef'){
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
        }
      }else{
        vm.warnTip(true, '无历史版本！')
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
    clearDates() {
      this.dates = []
      this.menu2 = false
      this.getHistory()
    },
  },
  beforeDestroy() {
    clearTimeout(this.timer);
    clearTimeout(this.timer2);
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  }
};
</script>

<style>
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
.buildDef-panel .v-expansion-panel-header {
  padding-left: 0;
  padding-right: 0;
}
.buildDef-panel .v-expansion-panel::before {
  box-shadow: none;
}
.buildDef-panel .v-expansion-panel-content__wrap {
  padding-left: 0;
  padding-right: 0;
}
.v-expansion-panel--active
  > .v-expansion-panel-header--active
  .v-expansion-panel-header__icon:not(.v-expansion-panel-header__icon--disable-rotate)
  .v-icon.diy-icon {
  transform: none;
}
.v-expansion-panel--active
  > .v-expansion-panel-header--active
  .v-expansion-panel-header__icon:not(.v-expansion-panel-header__icon--disable-rotate)
  .diy-icon
  .v-icon {
  transform: none;
}
.buildDef-panel :nth-child(2n + 1).v-expansion-panel {
  background-color: #eee;
}
.hidden-input .v-text-field > .v-input__control > .v-input__slot:before{
  border: none;
}
</style>
<style scoped lang="scss">
.v-card__title {
  padding: 4px 16px;
  font-size: 1rem;
}
.modules-item {
  cursor: pointer;
}
.v-text-field {
  font-size: 14px;
}
.v-select {
  font-size: 14px;
}
.steps-switch {
  width: 50%;
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
