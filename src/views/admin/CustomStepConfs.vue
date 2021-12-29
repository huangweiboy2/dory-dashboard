<template>
  <PageCard name="自定义步骤配置">
    <v-card>
      <v-card-title>
        <v-form style="width: 100%">
          <v-container class="d-flex flex-wrap" fluid>
            <v-select
              :items="customStepNames"
              label="自定义步骤名称"
              dense
              small-chips
              multiple
              class="mr-8"
              v-model="pageRequest.customStepNames"
              @change="getList(true)"
            ></v-select>
            <template>
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
                class="mr-8"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="dateRangeText"
                    label="时间"
                    prepend-icon="mdi-calendar"
                    disabled
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
                  @change="() => {
                    menu2 = false
                    this.getList(true)
                  }"
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
            <v-btn color="primary" @click="openAddCustomSteps()">新增</v-btn>
          </v-container>
        </v-form>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="pageHeaders"
          :items="pageData.customStepConfs"
          :page="pageRequest.page"
          :items-per-page="pageRequest.perPage"
          :server-items-length="pageData.totalCount"
          item-key="customStepName"
          show-expand
          :footer-props="{
            showCurrentPage: true,
            itemsPerPageOptions: [ 5, 10, 15, 20 ]
          }"
          :loading="tableLoading"
          @update:options="changeOptions($event)"
          >
          <template v-slot:item.handle="{item}">
            <Operations
                :operations="[
                  {
                    key: 'update',
                    text: '修改',
                    onClick: () => {
                      openUpdateCustomSteps(item)
                    }
                  },
                  {
                    key: 'delete',
                    text: '删除',
                    onClick: () => {
                      openDeleteCustomSteps(item.customStepName)
                    }
                  },
                ]"
              ></Operations>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-1 commits-table">
              <strong>自定义步骤执行容器设置</strong>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        自定义步骤执行容器镜像
                      </th>
                      <th class="text-left">
                        容器是否使用root作为执行用户
                      </th>
                      <th class="text-left">
                        自定义步骤执行容器的执行命令
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ item.customStepDockerConf.dockerImage }}</td>
                      <td>{{ item.customStepDockerConf.dockerRunAsRoot }}</td>
                      <td width="50%">
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.customStepDockerConf.dockerCommands"
                          />
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        容器挂装卷设置
                      </th>
                      <th class="text-left">
                        容器环境变量设置
                      </th>
                      <th class="text-left">
                        容器的工作目录
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td width="50%">
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.customStepDockerConf.dockerVolumes"
                          />
                        </template>
                      </td>
                      <td>
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.customStepDockerConf.dockerEnvs"
                          />
                        </template>
                      </td>
                      <td>{{ item.customStepDockerConf.dockerWorkDir }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        自定义步骤的使用说明
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.customStepUsage"
                          />
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        自定义步骤输入参数格式定义
                      </th>
                      <th class="text-left">
                        步骤输入参数的文件格式
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.paramInputYamlDef"
                          />
                        </template>
                      </td>
                      <td>{{ item.customStepDockerConf.paramInputFormat }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        自定义步骤输出参数格式定义
                      </th>
                      <th class="text-left">
                        步骤输出参数的文件格式
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <template>
                          <v-textarea
                            dense
                            auto-grow
                            rows="1"
                            style="white-space:nowrap;"
                            wrap="off"
                            row-height="12"
                            disabled
                            v-model="item.paramOutputYamlDef"
                          />
                        </template>
                      </td>
                      <td>{{ item.customStepDockerConf.paramOutputFormat }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
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
      v-model="addCustomStepsDialog"
      max-width="1200px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">新增自定义步骤配置</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="yaml-btn" small v-bind="attrs" v-on="on" @click="() => {varsDialog = true}">
                <v-icon color="primary">mdi-progress-question</v-icon>
              </v-btn>
            </template>
            <div>变量说明</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="yaml-btn" small v-bind="attrs" v-on="on" @click="previewAddCustomSteps()">
                <v-icon color="primary">mdi-cube-scan</v-icon>
              </v-btn>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="ml-2" v-bind="attrs" v-on="on" @click="addCustomSteps()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.addCustomStepsDialog = false
            this.$refs.addCustomStepsRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="addCustomStepsRef">
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤名称(customStepName)*"
                  dense
                  v-model="addCustomStepsForm.customStepName"
                  :rules="[v => !!v || '自定义步骤名称必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤的英文标识名称</div>
                    <div>例如: buildIosApp</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤英文描述(customStepActionDesc)*"
                  dense
                  v-model="addCustomStepsForm.customStepActionDesc"
                  :rules="[v => !!v || '自定义步骤英文描述必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于自动生成自定义步骤的阶段、环节、步骤的英文描述</div>
                    <div>例如: build ios app</div>
                    <div>生成的阶段说明效果为: build ios app in test-env</div>
                    <div>生成的环节、步骤说明效果为: build ios app dory-engine in test-env</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item d-flex align-center">
                <v-select
                  :items="[ true, false ]"
                  label="是否不同环境需要不同自定义步骤配置(isEnvDiff)*"
                  dense
                  v-model="addCustomStepsForm.isEnvDiff"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>假如项目需要针对不同环境需要设置不同的自定义步骤配置，那么请设置为是</div>
                    <div>设置为是之后，必须每个环境独立设置自定义步骤配置</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤说明(customStepDesc)*"
                  dense
                  v-model="addCustomStepsForm.customStepDesc"
                  :rules="[v => !!v || '自定义步骤说明必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>ops流水线操作类型选择的时候显示的步骤操作类型信息</div>
                    <div>以使用中文，例如: 在远程macOS主机编译ios应用</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-60 d-flex align-center">
                <v-textarea
                  label="自定义步骤的使用说明(customStepUsage)*"
                  dense
                  auto-grow
                  rows="1"
                  dense
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="addCustomStepsForm.customStepUsage"
                  :rules="[v => !!v || '自定义步骤的使用说明必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>告诉自定义步骤的使用者如何设置才能使用本步骤的简要说明</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item-70 d-flex align-center">
                <v-textarea
                  label="自定义步骤输入参数格式定义(paramInputYamlDef)"
                  dense
                  auto-grow
                  rows="1"
                  dense
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="addCustomStepsForm.paramInputYamlDef"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤的输入参数设置以及参数说明信息，使用yaml格式</div>
                    <div>项目在设置自定义步骤模块的时候，可以设置该模块特定的步骤执行参数</div>
                    <div>该输入参数将会以文件的形式挂装到步骤执行容器的/tmp/dory-param-input.json或者.yaml文件，步骤执行容器可以读取该输入参数，进行相应的步骤处理</div>
                    <div>必须输入完整的输入参数例子</div>
                    <div>例如：</div>
                    <div># 构建路径，代码所在的相对路径（必填）</div>
                    <div>buildPath: Codes/test-ios-app/src</div>
                    <div># 构架资产数设置（选填）</div>
                    <div>buildArgs: - -ignore-test</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-20 d-flex align-center">
                <v-select
                  :items="[ 'yaml', 'json' ]"
                  label="步骤输入参数的文件格式(paramInputFormat)*"
                  dense
                  v-model="addCustomStepsForm.customStepDockerConf.paramInputFormat"
                  :rules="[v => !!v || '步骤输入参数的文件格式必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>所有paramInputYamlDef设置的输入参数以及流水线运行时的所有状态参数都会以参数文件的方式挂装到步骤执行容器</div>
                    <div>输入参数文件自动挂装在步骤执行容器的/tmp/dory-param-input.json或者.yaml文件中</div>
                    <div>步骤执行容器读取输入参数文件，作为步骤执行的输入参数</div>
                    <div>输入参数文件的格式支持两种，yaml或者json</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item-70 d-flex align-center">
                <v-textarea
                  label="自定义步骤输出参数格式定义(paramOutputYamlDef)"
                  dense
                  auto-grow
                  rows="1"
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="addCustomStepsForm.paramOutputYamlDef"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤在docker容器中执行完成之后，如果需要把执行结果写入到步骤执行记录中，那么请设置本参数</div>
                    <div>该输出参数应该写到步骤执行容器的/tmp/dory-param-output.json或者.yaml文件中，流水线会读取该输出参数文件，并写入到步骤执行记录中</div>
                    <div>必须输入完整的输出参数例子</div>
                    <div>例如：</div>
                    <div># 构建结果文件名</div>
                    <div>buildResult: test-ios-app.ipa</div>
                    <div># 构建结果大小</div>
                    <div>buildFileSize: 10M</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-20 d-flex align-center">
                <v-select
                  :items="[ 'yaml', 'json' ]"
                  label="步骤输出参数的文件格式(paramOutputFormat)*"
                  dense
                  v-model="addCustomStepsForm.customStepDockerConf.paramOutputFormat"
                  :rules="[v => !!v || '步骤输出参数的文件格式必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>如果步骤执行结果的内容需要保存到步骤详细记录中，那么请在步骤执行完后，把执行结果文件保存在步骤执行容器的/tmp/dory-param-output.json或者.yaml文件中</div>
                    <div>所有paramOutputYamlDef设置的输出参数请保存在该输出参数文件中</div>
                    <div>步骤执行结束后，流水线会从本目录读取步骤输出参数文件，并写入到步骤详细记录中</div>
                    <div>输出参数文件的格式支持两种，yaml或者json</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="params-item">
              <small>自定义步骤执行容器设置(customStepDockerConf)*</small>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item d-flex align-center">
                  <v-text-field
                    label="自定义步骤执行容器镜像(dockerImage)*"
                    dense
                    v-model="addCustomStepsForm.customStepDockerConf.dockerImage"
                    :rules="[v => !!v || '自定义步骤执行容器镜像必填项']"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>请把步骤执行容器的镜像上传到harbor，并设置镜像</div>
                      <div>在harbor中的镜像相对路径，请不要包含harbor的域名</div>
                      <div>例如：public/busybox:latest</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item-60 d-flex align-center">
                  <v-textarea
                    label="自定义步骤执行容器的执行命令(dockerCommands)*"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="addCustomStepsForm.customStepDockerConf.dockerCommands"
                    :rules="[v => !!v || '自定义步骤执行容器的执行命令必填项']"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>进入执行容器的时候，使用什么命令来执行该自定义步骤</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                      <div>如果不设置，默认把代码仓库的根目录挂装到容器中的/{ { $.projectName } }目录</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item d-flex align-center">
                  <v-select
                    :items="[ true, false ]"
                    label="容器是否使用root作为执行用户(dockerRunAsRoot)*"
                    dense
                    v-model="addCustomStepsForm.customStepDockerConf.dockerRunAsRoot"
                  />
                </div>
                <div class="form-item-60 d-flex align-center">
                  <v-text-field
                    label="容器的工作目录(dockerWorkDir)*"
                    dense
                    v-model="addCustomStepsForm.customStepDockerConf.dockerWorkDir"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>请填写容器中的绝对路径，必须以/开头</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item-45 d-flex align-center">
                  <v-textarea
                    label="容器挂装卷设置(dockerVolumes)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="addCustomStepsForm.customStepDockerConf.dockerVolumes"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>代码仓库的相对路径挂装到容器中的哪个目录</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                      <div>如果不设置，默认把代码仓库的根目录挂装到容器中的/{ { $.projectName } }目录</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item-45 d-flex align-center">
                  <v-textarea
                    label="容器环境变量设置(dockerEnvs)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="addCustomStepsForm.customStepDockerConf.dockerEnvs"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>代码仓库的相对路径挂装到容器中的哪个目录</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="updateCustomStepsDialog"
      max-width="1200px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改自定义步骤配置</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="yaml-btn" small v-bind="attrs" v-on="on" @click="() => {varsDialog = true}">
                <v-icon color="primary">mdi-progress-question</v-icon>
              </v-btn>
            </template>
            <div>变量说明</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="yaml-btn" small v-bind="attrs" v-on="on" @click="previewUpdateCustomSteps()">
                <v-icon color="primary">mdi-cube-scan</v-icon>
              </v-btn>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" class="ml-2" v-bind="attrs" v-on="on" @click="updateCustomSteps()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.updateCustomStepsDialog = false
            this.$refs.updateCustomStepsRef.reset()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="updateCustomStepsRef">
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤名称(customStepName)*"
                  dense
                  disabled
                  v-model="updateCustomStepsForm.customStepName"
                  :rules="[v => !!v || '自定义步骤名称必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤的英文标识名称</div>
                    <div>例如: buildIosApp</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤英文描述(customStepActionDesc)*"
                  dense
                  v-model="updateCustomStepsForm.customStepActionDesc"
                  :rules="[v => !!v || '自定义步骤英文描述必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于自动生成自定义步骤的阶段、环节、步骤的英文描述</div>
                    <div>例如: build ios app</div>
                    <div>生成的阶段说明效果为: build ios app in test-env</div>
                    <div>生成的环节、步骤说明效果为: build ios app dory-engine in test-env</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item d-flex align-center">
                <v-select
                  :items="[ true, false ]"
                  label="是否不同环境需要不同自定义步骤配置(isEnvDiff)*"
                  dense
                  v-model="updateCustomStepsForm.isEnvDiff"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>假如项目需要针对不同环境需要设置不同的自定义步骤配置，那么请设置为是</div>
                    <div>设置为是之后，必须每个环境独立设置自定义步骤配置</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item d-flex align-center">
                <v-text-field
                  label="自定义步骤说明(customStepDesc)*"
                  dense
                  v-model="updateCustomStepsForm.customStepDesc"
                  :rules="[v => !!v || '自定义步骤说明必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>ops流水线操作类型选择的时候显示的步骤操作类型信息</div>
                    <div>以使用中文，例如: 在远程macOS主机编译ios应用</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-60 d-flex align-center">
                <v-textarea
                  label="自定义步骤的使用说明(customStepUsage)*"
                  dense
                  auto-grow
                  rows="1"
                  dense
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="updateCustomStepsForm.customStepUsage"
                  :rules="[v => !!v || '自定义步骤的使用说明必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>告诉自定义步骤的使用者如何设置才能使用本步骤的简要说明</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item-70 d-flex align-center">
                <v-textarea
                  label="自定义步骤输入参数格式定义(paramInputYamlDef)"
                  dense
                  auto-grow
                  rows="1"
                  dense
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="updateCustomStepsForm.paramInputYamlDef"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤的输入参数设置以及参数说明信息，使用yaml格式</div>
                    <div>项目在设置自定义步骤模块的时候，可以设置该模块特定的步骤执行参数</div>
                    <div>该输入参数将会以文件的形式挂装到步骤执行容器的/tmp/dory-param-input.json或者.yaml文件，步骤执行容器可以读取该输入参数，进行相应的步骤处理</div>
                    <div>必须输入完整的输入参数例子</div>
                    <div>例如：</div>
                    <div># 构建路径，代码所在的相对路径（必填）</div>
                    <div>buildPath: Codes/test-ios-app/src</div>
                    <div># 构架资产数设置（选填）</div>
                    <div>buildArgs: - -ignore-test</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-20 d-flex align-center">
                <v-select
                  :items="[ 'yaml', 'json' ]"
                  label="步骤输入参数的文件格式(paramInputFormat)*"
                  dense
                  v-model="updateCustomStepsForm.customStepDockerConf.paramInputFormat"
                  :rules="[v => !!v || '步骤输入参数的文件格式必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>所有paramInputYamlDef设置的输入参数以及流水线运行时的所有状态参数都会以参数文件的方式挂装到步骤执行容器</div>
                    <div>输入参数文件自动挂装在步骤执行容器的/tmp/dory-param-input.json或者.yaml文件中</div>
                    <div>步骤执行容器读取输入参数文件，作为步骤执行的输入参数</div>
                    <div>输入参数文件的格式支持两种，yaml或者json</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="d-flex mt-4 justify-space-between">
              <div class="form-item-70 d-flex align-center">
                <v-textarea
                  label="自定义步骤输出参数格式定义(paramOutputYamlDef)"
                  dense
                  auto-grow
                  rows="1"
                  style="white-space:nowrap;"
                  wrap="off"
                  row-height="12"
                  v-model="updateCustomStepsForm.paramOutputYamlDef"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>自定义步骤在docker容器中执行完成之后，如果需要把执行结果写入到步骤执行记录中，那么请设置本参数</div>
                    <div>该输出参数应该写到步骤执行容器的/tmp/dory-param-output.json或者.yaml文件中，流水线会读取该输出参数文件，并写入到步骤执行记录中</div>
                    <div>必须输入完整的输出参数例子</div>
                    <div>例如：</div>
                    <div># 构建结果文件名</div>
                    <div>buildResult: test-ios-app.ipa</div>
                    <div># 构建结果大小</div>
                    <div>buildFileSize: 10M</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-20 d-flex align-center">
                <v-select
                  :items="[ 'yaml', 'json' ]"
                  label="步骤输出参数的文件格式(paramOutputFormat)*"
                  dense
                  v-model="updateCustomStepsForm.customStepDockerConf.paramOutputFormat"
                  :rules="[v => !!v || '步骤输出参数的文件格式必填项']"
                />
                <v-tooltip right max-width="350px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>如果步骤执行结果的内容需要保存到步骤详细记录中，那么请在步骤执行完后，把执行结果文件保存在步骤执行容器的/tmp/dory-param-output.json或者.yaml文件中</div>
                    <div>所有paramOutputYamlDef设置的输出参数请保存在该输出参数文件中</div>
                    <div>步骤执行结束后，流水线会从本目录读取步骤输出参数文件，并写入到步骤详细记录中</div>
                    <div>输出参数文件的格式支持两种，yaml或者json</div>
                  </div>
                </v-tooltip>
              </div>
            </div>
            <div class="params-item">
              <small>自定义步骤执行容器设置(customStepDockerConf)*</small>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item d-flex align-center">
                  <v-text-field
                    label="自定义步骤执行容器镜像(dockerImage)*"
                    dense
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerImage"
                    :rules="[v => !!v || '自定义步骤执行容器镜像必填项']"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>请把步骤执行容器的镜像上传到harbor，并设置镜像</div>
                      <div>在harbor中的镜像相对路径，请不要包含harbor的域名</div>
                      <div>例如：public/busybox:latest</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item-60 d-flex align-center">
                  <v-textarea
                    label="自定义步骤执行容器的执行命令(dockerCommands)*"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerCommands"
                    :rules="[v => !!v || '自定义步骤执行容器的执行命令必填项']"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>进入执行容器的时候，使用什么命令来执行该自定义步骤</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                      <div>如果不设置，默认把代码仓库的根目录挂装到容器中的/{ { $.projectName } }目录</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item d-flex align-center">
                  <v-select
                    :items="[ true, false ]"
                    label="容器是否使用root作为执行用户(dockerRunAsRoot)*"
                    dense
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerRunAsRoot"
                  />
                </div>
                <div class="form-item-60 d-flex align-center">
                  <v-text-field
                    label="容器的工作目录(dockerWorkDir)*"
                    dense
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerWorkDir"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>请填写容器中的绝对路径，必须以/开头</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
              <div class="d-flex mt-4 justify-space-between">
                <div class="form-item-45 d-flex align-center">
                  <v-textarea
                    label="容器挂装卷设置(dockerVolumes)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerVolumes"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>代码仓库的相对路径挂装到容器中的哪个目录</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                      <div>如果不设置，默认把代码仓库的根目录挂装到容器中的/{ { $.projectName } }目录</div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="form-item-45 d-flex align-center">
                  <v-textarea
                    label="容器环境变量设置(dockerEnvs)"
                    dense
                    auto-grow
                    rows="1"
                    style="white-space:nowrap;"
                    wrap="off"
                    row-height="12"
                    v-model="updateCustomStepsForm.customStepDockerConf.dockerEnvs"
                  />
                  <v-tooltip right max-width="350px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>代码仓库的相对路径挂装到容器中的哪个目录</div>
                      <div>支持使用变量，变量对应paramInputYamlDef的输入参数设置，例如paramInputYamlDef中设置了buildPath参数</div>
                      <div>那么可以使用  { { $.buildPath } } 作为路径的参数替换值。例如用户设置了buildPath=xxx 那么 { { $.buildPath } }将会替换为xxx</div>
                      <div>内置变量包括 { { $.projectName } }（项目名称）、{ { $.pipelineName } }（流水线名称）、{ { $.runName } }（运行名称）、{ { $.runNumber } }（运行编号）</div>
                      <div>内置变量包括 { { $.moduleName } }（模块名称） 、 { { $.envName } }（当前执行环境名称）、{ { $.branchName } }（分支名称）</div>
                    </div>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-form>
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
      v-model="deleteCustomStepsDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">删除自定义步骤配置</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="deleteCustomStepsRef">
            <!-- <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small><v-chip small color="red">危险操作</v-chip></small>
            </v-alert> -->
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="自定义步骤名称(customStepName)*"
                    required
                    dense
                    v-model="deleteCustomStepName"
                    :rules="[v => !!v || '自定义步骤名称为必填项']"
                    :hint="`是否确认删除${targetCustomStep}自定义步骤`"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.deleteCustomStepsDialog = false
              this.$refs.deleteCustomStepsRef.reset()
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteCustomSteps()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageCard>
</template>

<script>
import PageCard from '@/lib/ui-lib/page-templates/PageCard';
import Operations from '@/lib/ui-lib/components/Operations';
import request from '@/utils/request';
import YAML from "yamljs";
import { flatMap } from 'rxjs/operators';
import Monaco from "@/lib/monaco/Monaco";
export default {
  name: 'CustomStepConfs',
  components: {
    PageCard,
    Operations,
    Monaco
  },
  inject: ['successTip', 'errorTip', 'warnTip'],
  data () {
    return {
      dates: [],
      menu2: false,
      pageRequest: {
        customStepNames: [],
        createTimeRage: {
          startDate: '',
          endDate: '',
        },
        page: 1,
        perPage: 10
      },
      customStepNames: [],
      addCustomStepsDialog: false,
      addCustomStepsForm: {
        customStepName: '',
        customStepActionDesc: '',
        customStepDesc: '',
        customStepUsage: '',
        isEnvDiff: false,
        customStepDockerConf: {
          dockerImage: '',
          dockerCommands: '',
          dockerRunAsRoot: false,
          dockerVolumes: '',
          dockerEnvs: '',
          dockerWorkDir: '',
          paramInputFormat: '',
          paramOutputFormat: ''
        },
        paramInputYamlDef: '',
        paramOutputYamlDef: '',
      },
      updateCustomStepsForm: {
        customStepName: '',
        customStepActionDesc: '',
        customStepDesc: '',
        customStepUsage: '',
        isEnvDiff: false,
        customStepDockerConf: {
          dockerImage: '',
          dockerCommands: '',
          dockerRunAsRoot: false,
          dockerVolumes: '',
          dockerEnvs: '',
          dockerWorkDir: '',
          paramInputFormat: '',
          paramOutputFormat: ''
        },
        paramInputYamlDef: '',
        paramOutputYamlDef: '',
      },
      updateCustomStepsDialog: false,
      YAMLDialog: false,
      yamlText: "",
      pageData: {
        customStepConfs: [],
        totalCount: 0
      },
      tableLoading: false,
      pageHeaders: [
        { text: '自定义步骤名称', value: 'customStepName', sortable: false },
        { text: '自定义步骤英文描述', value: 'customStepActionDesc', sortable: false },
        { text: '自定义步骤说明', value: 'customStepDesc', sortable: false },
        { text: '是否不同环境需要不同自定义步骤配置', value: 'isEnvDiff', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      targetCustomStep: '',
      deleteCustomStepsDialog: false,
      deleteCustomStepName: '',
      vars: '',
      varsDialog: false,
      singleMonacoOptions: {
        value: '',
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
        language: "yaml"
      },
    }
  },
  created () {
    const vm = this
    vm.getList(false)
    request.get('/cicd/customStepConf/vars').then(response => {
      vm.vars = response.data.content
    }).catch(error => {
      vm.errorTip(true, error.response.data.msg);
    })
  },
  methods: {
    getList(tipFlag) {
      const vm = this
      vm.tableLoading = true
      let dates = vm.dates.sort()
      vm.pageRequest.createTimeRage.startDate = dates[0]
      vm.pageRequest.createTimeRage.endDate = dates[1]
      request.post('/admin/customStepConfs', vm.pageRequest).then(response => {
        vm.pageData.customStepConfs = response.data.customStepConfs
        vm.pageData.customStepConfs.forEach(item => {
          item.customStepDockerConf.dockerCommands = vm.formateText(item.customStepDockerConf.dockerCommands)
          item.customStepDockerConf.dockerVolumes = vm.formateText(item.customStepDockerConf.dockerVolumes)
          item.customStepDockerConf.dockerEnvs = vm.formateText(item.customStepDockerConf.dockerEnvs)
        })
        vm.pageData.totalCount = response.data.totalCount
        vm.customStepNames = response.data.customStepNames
        vm.tableLoading = false
        console.log(response)
        if(tipFlag){
          vm.successTip(true,response.msg)
        }
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
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
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
    },
    changeOptions(data) {
      const vm = this
       vm.pageRequest.page = data.page
      vm.pageRequest.perPage = data.itemsPerPage
      vm.getList(false)
    },
    clearDates () {
      this.dates = []
      this.menu2 = false
      this.getList(true)
    },
    openAddCustomSteps() {
      const vm = this
      vm.addCustomStepsDialog = true
    },
    previewAddCustomSteps() {
      const vm = this
      if(vm.$refs.addCustomStepsRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.addCustomStepsForm))
        copyData.customStepDockerConf.dockerCommands = vm.formateText(copyData.customStepDockerConf.dockerCommands)
        copyData.customStepDockerConf.dockerVolumes = vm.formateText(copyData.customStepDockerConf.dockerVolumes)
        copyData.customStepDockerConf.dockerEnvs = vm.formateText(copyData.customStepDockerConf.dockerEnvs)
        vm.sortData(copyData)
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog =true
      }else{
        vm.warnTip(true, '请输入完整内容')
      }
    },
    addCustomSteps() {
      const vm = this
      if(vm.$refs.addCustomStepsRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.addCustomStepsForm))
        copyData.customStepDockerConf.dockerCommands = vm.formateText(copyData.customStepDockerConf.dockerCommands)
        copyData.customStepDockerConf.dockerVolumes = vm.formateText(copyData.customStepDockerConf.dockerVolumes)
        copyData.customStepDockerConf.dockerEnvs = vm.formateText(copyData.customStepDockerConf.dockerEnvs)
        vm.sortData(copyData)
        let customStepConfYaml = YAML.stringify(copyData, 4)
        request.post('/admin/customStepConf', {
          customStepConfYaml: customStepConfYaml
        }).then(response => {
          console.log(response)
          vm.successTip(true,response.msg)
          vm.addCustomStepsDialog = false
          vm.getList(false)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入完整内容')
      }
    },
    openUpdateCustomSteps(customStepConf) {
      const vm = this
      vm.updateCustomStepsForm = JSON.parse(JSON.stringify(customStepConf))
      vm.updateCustomStepsDialog = true
    },
    previewUpdateCustomSteps() {
      const vm = this
      if(vm.$refs.updateCustomStepsRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.updateCustomStepsForm))
        copyData.customStepDockerConf.dockerCommands = vm.formateText(copyData.customStepDockerConf.dockerCommands)
        copyData.customStepDockerConf.dockerVolumes = vm.formateText(copyData.customStepDockerConf.dockerVolumes)
        copyData.customStepDockerConf.dockerEnvs = vm.formateText(copyData.customStepDockerConf.dockerEnvs)
        vm.sortData(copyData)
        delete copyData.customStepID
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog =true
      }else{
        vm.warnTip(true, '请输入完整内容')
      }
    },
    updateCustomSteps() {
      const vm = this
      if(vm.$refs.updateCustomStepsRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.updateCustomStepsForm))
        copyData.customStepDockerConf.dockerCommands = vm.formateText(copyData.customStepDockerConf.dockerCommands)
        copyData.customStepDockerConf.dockerVolumes = vm.formateText(copyData.customStepDockerConf.dockerVolumes)
        copyData.customStepDockerConf.dockerEnvs = vm.formateText(copyData.customStepDockerConf.dockerEnvs)
        delete copyData.customStepID
        vm.sortData(copyData)
        let customStepConfYaml = YAML.stringify(copyData, 4)
        request.post(`/admin/customStepConf/${copyData.customStepName}`, {
          customStepConfYaml: customStepConfYaml
        }).then(response => {
          vm.successTip(true,response.msg)
          vm.updateCustomStepsDialog = false
          vm.getList(false)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入完整内容')
      }
    },
    openDeleteCustomSteps(customStepName) {
      const vm = this
      vm.targetCustomStep = customStepName
      vm.deleteCustomStepsDialog = true
    },
    deleteCustomSteps() {
      const vm = this
      if(vm.$refs.deleteCustomStepsRef.validate && vm.targetCustomStep === vm.deleteCustomStepName){
        request.delete(`/admin/customStepConf/${vm.targetCustomStep}`).then(response => {
          vm.successTip(true,response.msg)
          vm.deleteCustomStepsDialog = false
          vm.getList(false)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入正确的自定义步骤名称')
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
    }
  },
  computed: {
    dateRangeText () {
      return this.dates.join(' ~ ')
    }
  }
}
</script>

<style lang="scss" scoped>
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
