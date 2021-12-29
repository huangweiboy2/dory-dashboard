<template>
  <PageCard name="组件模板">
    <v-card>
      <v-card-title>
        <v-btn color="primary" style="margin-left: auto" @click="openAddComponent('add')">新增组件模板</v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="componentsHeaders"
          :items="componentsData.componentTemplates"
          :page="componentsForm.page"
          :items-per-page="componentsForm.perPage"
          :server-items-length="componentsData.totalCount"
          item-key="componentTemplateName"
          :footer-props="{
            showCurrentPage: true,
            itemsPerPageOptions: [ 5, 10, 15, 20 ]
          }"
          :loading="tableLoading"
          @update:options="changeOptions($event)"
          >
          <template v-slot:item.componentTemplateYaml="{ item }">
            <v-btn small color="primary" @click="detailHandle(item.deploySpecStatic)">查看详情</v-btn>
          </template>
          <template v-slot:item.handle="{ item }">
            <Operations
              :operations="[
                { text: '修改', onClick: () => {openUpdateComponent(item)} },
                { text: '删除', onClick: () => {openDeleteComponent(item)} }
              ]"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="yamlDialog"
      max-width="800px"
      persistent
      eager
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text>
          <Monaco
            ref="monaco2"
            :monacoOptions="singleMonacoOptions"
            :height="500"
          ></Monaco>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.yamlDialog = false
              this.$refs.monaco2.monacoEditor.setValue('')
            }"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="addComponentDialog"
      max-width="1100px"
      persistent
    >
      <v-card :loading="defaultLoading">
        <v-card-title>
          <span class="headline">新增组件模板</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mx-4 yaml-btn" small v-bind="attrs" v-on="on">
                <v-icon color="primary" @click="previewComponent()">mdi-cube-scan</v-icon>
              </v-btn>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="addComponent()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.addComponentDialog = false
            this.$refs.addComponentRef.resetValidation()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="addComponentRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>定义组件模板后，用户可以在新增组件的时候引用该模板。</small>
            </v-alert>
            <div class="d-flex justify-space-between mt-4">
              <div class="form-item-45">
                <v-text-field
                  label="组件模板名字（componentName）*"
                  required
                  dense
                  :rules="[v => !!v || '组件模板名字为必填项']"
                  v-model="addComponentForm.componentTemplateName"
                  hint="格式例如：mysql-v802"
                  persistent-hint
                ></v-text-field>
              </div>
              <div class="form-item-45">
                <v-text-field
                  label="组件模板说明（componentDesc）*"
                  required
                  dense
                  :rules="[v => !!v || '组件模板说明为必填项']"
                  v-model="addComponentForm.componentTemplateDesc"
                  hint="格式例如：mysql-v802"
                  persistent-hint
                ></v-text-field>
              </div>
            </div>
            <div class="form-row d-flex justify-space-between mt-4">
              <div class="form-item-45 d-flex align-center">
                <v-text-field
                  label="镜像名称(deployImage)*"
                  dense
                  v-model="addComponentForm.deploySpecStatic.deployImage"
                  :rules="[v => !!v || '镜像名称为必填项']"
                />
                <v-tooltip right max-width="200px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像，建议不要使用latest标签的镜像</div>
                    <div>也可以填写harbor中的基础镜像</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-45">
                <v-text-field
                  label="应用启动的副本实例数(deployReplicas)*"
                  dense
                  type="number"
                  v-model="addComponentForm.deploySpecStatic.deployReplicas"
                  :rules="[v => !!v && v > 0 || '应用启动的副本实例数为必填项']"
                >
                </v-text-field>
              </div>
            </div>
            <div class="form-row mt-4">
              <div class="form-item">
                <v-spacer></v-spacer>
                <v-select
                  :items="[
                    { text: '应用的资源配额设置', value: 'deployResources' },
                    { text: '杂项', value: '杂项' },
                    { text: '模块的内部端口设置', value: 'deployLocalPorts' },
                    { text: '应用挂装存储设置', value: 'deployVolumes' },
                    { text: '应用状态检查设置', value: 'deployHealthCheck' },
                    { text: '服务依赖', value:'dependServices' },
                    { text: '应用容器主机名解析', value: 'hostAliases' },
                    { text: '启动应用使用的用户和用户组配置', value: 'securityContext' },
                  ]"
                  dense
                  label="选择添加配置参数"
                  @change="chooseParams($event)"
                ></v-select>
              </div>
              <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployResources.cpuLimit !== '' || addComponentForm.deploySpecStatic.deployResources.cpuRequest !== '' || addComponentForm.deploySpecStatic.deployResources.memoryLimit !== '' || addComponentForm.deploySpecStatic.deployResources.memoryRequest !== ''" :id="'deployResources-add'">
                <div>
                  应用的资源配额设置(deployResources)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">给应用分配多少cpu和内存资源</span>
                  </v-tooltip>
                  <v-icon color="error" class="ml-4" @click="clearParams('deployResources')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.deployResources">
                  <div class="form-item-20 d-flex">
                    <v-text-field
                      label="内存请求配额(memoryRequest)*"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployResources.memoryRequest"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.memoryLimit"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.cpuRequest"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.cpuLimit"
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
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployCommand !== '' || addComponentForm.deploySpecStatic.deployEnvs !== null || addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds !== 0 || addComponentForm.deploySpecStatic.deployArgs !== null" :id="'杂项-add'">
                <div>杂项 <v-icon color="error" class="ml-4" @click="clearParams('other')">mdi-minus-circle-outline</v-icon></div>
                <div class="params-content d-flex justify-space-between mt-4">
                  <div class="form-item">
                    <small>环境变量(deployEnvs)</small>
                    <v-icon color="success" class="ml-4" @click="addDeployEnvs()">mdi-table-plus</v-icon>
                    <div class="env-item d-flex justify-space-between" v-for="(row, i) in addComponentForm.deploySpecStatic.deployEnvs" :key="i" v-if="addComponentForm.deploySpecStatic.deployEnvs">
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
                      <div>
                        <v-icon color="error" class="mt-4" @click="deleteDeployEnvs(i)">mdi-trash-can-outline</v-icon>
                      </div>
                    </div>
                    <div><small class="tip-color">应用容器中的环境变量设置</small></div>
                  </div>
                  <div class="form-item-45 d-flex align-center">
                    <v-combobox
                      label="命令行的启动参数(deployArgs)"
                      dense
                      multiple
                      small-chips
                      hide-selected
                      v-model="addComponentForm.deploySpecStatic.deployArgs"
                      append-icon=""
                    />
                  </div>
                  <div class="form-item-15 d-flex align-center">
                    <v-text-field
                      label="会话持久时间(deploySessionAffinityTimeoutSeconds)"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds"
                    />
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">对于多实例的有状态服务，如果需要启用session sticky支持，需要设置session sticky超时时间，单位秒</span>
                    </v-tooltip>
                  </div>
                </div>
                <div class="form-item-100 mt-4">
                  <v-text-field
                    label="启动应用命令行(deployCommand)"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployCommand"
                  />
                </div>
              </div>
              <div class="form-item-100 params-item" :id="'deployLocalPorts-add'" v-if="addComponentForm.deploySpecStatic.deployLocalPorts !== null">
                <div class="form-item-100" :id="'deployLocalPorts-'">
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
                    <v-icon color="success" class="mx-4" @click="addDeployLocalPort()">mdi-table-plus</v-icon>
                    <v-icon color="error" class="ml-4" @click="clearParams('portSetting')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployLocalPorts">
                    <div class="form-item-45">
                      <v-text-field
                        label="模块的内部服务端口号(port)*"
                        dense
                        type="number"
                        v-model="row.port"
                        :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-select
                        :items="[ 'http', 'tcp' ]"
                        label="协议类型(protocol)*"
                        dense
                        v-model="row.protocol"
                        :rules="[v => !!v || '协议类型为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDeployLocalPort(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDeployLocalPort(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployVolumes !== null" :id="'deployVolumes-add'">
                <div>
                  应用挂装存储设置(deployVolumes)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">该应用哪些目录或者文件需要进行持久化到共享存储</span>
                  </v-tooltip>
                  <v-icon color="success" class="ml-4" @click="addDeployVolumes()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('deployVolumes')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployVolumes">
                  <div class="form-item-45">
                    <v-text-field
                      label="容器中挂装的目录或文件的绝对路径(pathInPod)*"
                      dense
                      v-model="row.pathInPod"
                      :rules="[v => !!v || '容器中挂装的目录或文件的绝对路径为必填项']"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="持久化卷pvc中目录或文件的相对路径(pathInPv)*"
                      dense
                      v-model="row.pathInPv"
                      :rules="[v => !!v || '持久化卷pvc中目录或文件的相对路径为必填项']"
                    />
                  </div>
                  <div>
                    <v-icon color="success" class="mr-4" @click="copyDeployVolumes(i)">mdi-content-copy</v-icon>
                    <v-icon color="error" @click="deleteDeployVolumes(i)">mdi-trash-can-outline</v-icon>
                  </div>
                </div>
              </div>
              <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path !== '' || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders !== null" :id="'deployHealthCheck-add'">
                <div>
                  应用状态检查设置(deployHealthCheck)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">检查应用是否能正常对外提供服务，如果不能正常对外提供服务则进行重启或者标记服务不可访问</span>
                  </v-tooltip>
                  <v-icon color="error" @click="clearParams('deployHealthCheck')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4">
                  <div class="form-item-20 d-flex align-center">
                    <v-text-field
                      label="启动容器后等待多长时间才启动可访问性检查(readinessDelaySeconds)*"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds"
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
                        @change="checkChange($event)"
                        hint="checkPort和httpGet必须选其一"
                        persistent-hint
                        :value="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 ? 'httpGet' : 'checkPort'"
                      ></v-select>
                    </div>
                    <div class="mt-4" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0">
                      <v-text-field
                        label="检查tcp端口是否可连接(checkPort)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort"
                        :rules="[v => !!v || '检查tcp端口是否可连接为必填项']"
                        type="number"
                      />
                    </div>
                    <div v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0">
                      <small>通过http get方法检查是否可连接(httpGet)*</small>
                      <div class="d-flex justify-space-between mt-4">
                        <div class="form-item-45">
                          <v-text-field
                            label="本应用的http路径(path)*"
                            dense
                            v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path"
                            :rules="[v => !!v || '本应用的http路径为必填项']"
                          />
                        </div>
                        <div class="form-item-45">
                          <v-text-field
                            label="本应用的http端口(port)*"
                            dense
                            v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port"
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
                      <v-icon color="success" class="ml-4" @click="addHttpHeaders()">mdi-table-plus</v-icon>
                      <div v-for="(row, i) in addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders" :key="i">
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
                          <v-icon color="success" class="mr-4" @click="copyHttpHeaders(i)">mdi-content-copy</v-icon>
                          <v-icon color="error" @click="deleteHttpHeaders(i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.dependServices !== null" :id="'dependServices-add'">
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
                  <v-icon color="success" class="ml-4" @click="addDependServices()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('dependServices')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.dependServices">
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
                  <v-icon color="success" class="mr-4" @click="copyDependServices(i)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteDependServices(i)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.hostAliases !== null" :id="'hostAliases-add'">
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
                  <v-icon color="success" class="ml-4" @click="addHostAliases()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('hostAliases')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4 align-center" v-for="(row, i) in addComponentForm.deploySpecStatic.hostAliases">
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
                  <v-icon color="success" class="mr-4" @click="copyHostAliases(i)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteHostAliases(i)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.securityContext.runAsUser !== 0 || addComponentForm.deploySpecStatic.securityContext.runAsGroup !== 0" :id="'securityContext-add'">
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
                  <v-icon color="error" @click="clearParams('securityContext')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.securityContext">
                  <div class="form-item-45">
                    <v-text-field
                      label="应用运行的用户ID(runAsUser)*"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.securityContext.runAsUser"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="应用运行的用户组ID(runAsGroup)*"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.securityContext.runAsGroup"
                    />
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="updateComponentDialog"
      max-width="1100px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改组件模板</span>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mx-4 yaml-btn" small v-bind="attrs" v-on="on">
                <v-icon color="primary" @click="previewComponent()">mdi-cube-scan</v-icon>
              </v-btn>
            </template>
            <div>查看YAML定义</div>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on" @click="updateComponent()">mdi-progress-upload</v-icon>
            </template>
            <div>提交更新</div>
          </v-tooltip>
          <v-icon class="ml-4" @click="() => {
            this.updateComponentDialog = false
            this.$refs.addComponentRef.resetValidation()
          }">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-form ref="addComponentRef">
            <v-alert icon="mdi-alert-circle" prominent text type="info">
              <small>定义组件模板后，用户可以在新增组件的时候引用该模板。</small>
            </v-alert>
            <div class="form-item-100 mt-4">
              <v-text-field
                label="组件模板说明（componentDesc）*"
                required
                dense
                :rules="[v => !!v || '组件模板说明为必填项']"
                v-model="addComponentForm.componentTemplateDesc"
                hint="格式例如：mysql-v802"
                persistent-hint
              ></v-text-field>
            </div>
            <div class="form-row d-flex justify-space-between mt-4">
              <div class="form-item-45 d-flex align-center">
                <v-text-field
                  label="镜像名称(deployImage)*"
                  dense
                  v-model="addComponentForm.deploySpecStatic.deployImage"
                  :rules="[v => !!v || '镜像名称为必填项']"
                />
                <v-tooltip right max-width="200px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>可以填写hub.docker.io上的公网镜像名称，流水线会自动拉取公网镜像，建议不要使用latest标签的镜像</div>
                    <div>也可以填写harbor中的基础镜像</div>
                  </div>
                </v-tooltip>
              </div>
              <div class="form-item-45">
                <v-text-field
                  label="应用启动的副本实例数(deployReplicas)*"
                  dense
                  type="number"
                  v-model="addComponentForm.deploySpecStatic.deployReplicas"
                  :rules="[v => !!v && v > 0 || '应用启动的副本实例数为必填项']"
                >
                </v-text-field>
              </div>
            </div>
            <div class="form-row mt-4">
              <div class="form-item">
                <v-spacer></v-spacer>
                <v-select
                  :items="[
                    { text: '应用的资源配额设置', value: 'deployResources' },
                    { text: '杂项', value: '杂项' },
                    { text: '模块内部端口设置', value: 'deployLocalPorts' },
                    { text: '应用挂装存储设置', value: 'deployVolumes' },
                    { text: '应用状态检查设置', value: 'deployHealthCheck' },
                    { text: '服务依赖', value:'dependServices' },
                    { text: '应用容器主机名解析', value: 'hostAliases' },
                    { text: '启动应用使用的用户和用户组配置', value: 'securityContext' },
                  ]"
                  dense
                  label="选择添加配置参数"
                  @change="chooseParams($event)"
                ></v-select>
              </div>
              <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployResources.cpuLimit !== '' || addComponentForm.deploySpecStatic.deployResources.cpuRequest !== '' || addComponentForm.deploySpecStatic.deployResources.memoryLimit !== '' || addComponentForm.deploySpecStatic.deployResources.memoryRequest !== ''" :id="'deployResources-'+targetIndex">
                <div>
                  应用的资源配额设置(deployResources)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">给应用分配多少cpu和内存资源</span>
                  </v-tooltip>
                  <v-icon color="error" class="ml-4" @click="clearParams('deployResources')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.deployResources">
                  <div class="form-item-20 d-flex">
                    <v-text-field
                      label="内存请求配额(memoryRequest)*"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployResources.memoryRequest"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.memoryLimit"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.cpuRequest"
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
                      v-model="addComponentForm.deploySpecStatic.deployResources.cpuLimit"
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
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployCommand !== '' || addComponentForm.deploySpecStatic.deployEnvs !== null || addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds !== 0 || addComponentForm.deploySpecStatic.deployArgs !== null" :id="'杂项-'+targetIndex">
                <div>杂项 <v-icon color="error" class="ml-4" @click="clearParams('other')">mdi-minus-circle-outline</v-icon></div>
                <div class="params-content d-flex justify-space-between mt-4">
                  <div class="form-item">
                    <small>环境变量(deployEnvs)</small>
                    <v-icon color="success" class="ml-4" @click="addDeployEnvs()">mdi-table-plus</v-icon>
                    <div class="env-item d-flex justify-space-between" v-for="(row, i) in addComponentForm.deploySpecStatic.deployEnvs" :key="i" v-if="addComponentForm.deploySpecStatic.deployEnvs">
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
                      <v-icon color="error" class="mt-4" @click="deleteDeployEnvs(i)">mdi-trash-can-outline</v-icon>
                    </div>
                    <div><small class="tip-color">应用容器中的环境变量设置</small></div>
                  </div>
                  <div class="form-item-45 d-flex align-center">
                    <v-combobox
                      label="命令行的启动参数(deployArgs)"
                      dense
                      multiple
                      small-chips
                      hide-selected
                      v-model="addComponentForm.deploySpecStatic.deployArgs"
                      append-icon=""
                    />
                  </div>
                  <div class="form-item-15 d-flex align-center">
                    <v-text-field
                      label="会话持久时间(deploySessionAffinityTimeoutSeconds)"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds"
                    />
                    <v-tooltip right max-width="200px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <span style="font-size: 12px;">对于多实例的有状态服务，如果需要启用session sticky支持，需要设置session sticky超时时间，单位秒</span>
                    </v-tooltip>
                  </div>
                </div>
                <div class="form-item-100 mt-4">
                  <v-text-field
                    label="启动应用命令行(deployCommand)"
                    dense
                    v-model="addComponentForm.deploySpecStatic.deployCommand"
                  />
                </div>
              </div>
              <div class="form-item-100 params-item" :id="'deployLocalPorts-'+targetIndex" v-if="addComponentForm.deploySpecStatic.deployLocalPorts !== null">
                <div class="form-item-100" :id="'deployLocalPorts-'">
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
                    <v-icon color="success" class="mx-4" @click="addDeployLocalPort()">mdi-table-plus</v-icon>
                    <v-icon color="error" class="ml-4" @click="clearParams('portSetting')">mdi-minus-circle-outline</v-icon>
                  </div>
                  <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployLocalPorts">
                    <div class="form-item-45">
                      <v-text-field
                        label="模块的内部服务端口号(port)*"
                        dense
                        type="number"
                        v-model="row.port"
                        :rules="[v => !!v || '模块的内部服务端口号为必填项']"
                      />
                    </div>
                    <div class="form-item-45">
                      <v-select
                        :items="[ 'http', 'tcp' ]"
                        label="协议类型(protocol)*"
                        dense
                        v-model="row.protocol"
                        :rules="[v => !!v || '协议类型为必填项']"
                      />
                    </div>
                    <div>
                      <v-icon color="success" class="mr-4" @click="copyDeployLocalPort(i)">mdi-content-copy</v-icon>
                      <v-icon color="error" @click="deleteDeployLocalPort(i)">mdi-trash-can-outline</v-icon>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.deployVolumes !== null" :id="'deployVolumes-'+targetIndex">
                <div>
                  应用挂装存储设置(deployVolumes)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">该应用哪些目录或者文件需要进行持久化到共享存储</span>
                  </v-tooltip>
                  <v-icon color="success" class="ml-4" @click="addDeployVolumes()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('deployVolumes')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.deployVolumes">
                  <div class="form-item-45">
                    <v-text-field
                      label="容器中挂装的目录或文件的绝对路径(pathInPod)*"
                      dense
                      v-model="row.pathInPod"
                      :rules="[v => !!v || '容器中挂装的目录或文件的绝对路径为必填项']"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="持久化卷pvc中目录或文件的相对路径(pathInPv)*"
                      dense
                      v-model="row.pathInPv"
                      :rules="[v => !!v || '持久化卷pvc中目录或文件的相对路径为必填项']"
                    />
                  </div>
                  <v-icon color="success" class="mr-4" @click="copyDeployVolumes(i)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteDeployVolumes(i)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
              <div class="form-item-100 params-item" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port !== 0 || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path !== '' || addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders !== null" :id="'deployHealthCheck-'+targetIndex">
                <div>
                  应用状态检查设置(deployHealthCheck)
                  <v-tooltip right max-width="200px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="mx-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <span style="font-size: 12px;">检查应用是否能正常对外提供服务，如果不能正常对外提供服务则进行重启或者标记服务不可访问</span>
                  </v-tooltip>
                  <v-icon color="error" @click="clearParams('deployHealthCheck')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4">
                  <div class="form-item-20 d-flex align-center">
                    <v-text-field
                      label="启动容器后等待多长时间才启动可访问性检查(readinessDelaySeconds)*"
                      dense
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds"
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
                      v-model="addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds"
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
                        @change="checkChange($event)"
                        hint="checkPort和httpGet必须选其一"
                        persistent-hint
                        :value="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 ? 'httpGet' : 'checkPort'"
                      ></v-select>
                    </div>
                    <div class="mt-4" v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort !== 0">
                      <v-text-field
                        label="检查tcp端口是否可连接(checkPort)*"
                        dense
                        v-model="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort"
                        :rules="[v => !!v || '检查tcp端口是否可连接为必填项']"
                        type="number"
                      />
                    </div>
                    <div v-if="addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0">
                      <small>通过http get方法检查是否可连接(httpGet)*</small>
                      <div class="d-flex justify-space-between mt-4">
                        <div class="form-item-45">
                          <v-text-field
                            label="本应用的http路径(path)*"
                            dense
                            v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path"
                            :rules="[v => !!v || '本应用的http路径为必填项']"
                          />
                        </div>
                        <div class="form-item-45">
                          <v-text-field
                            label="本应用的http端口(port)*"
                            dense
                            v-model="addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port"
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
                      <v-icon color="success" class="ml-4" @click="addHttpHeaders()">mdi-table-plus</v-icon>
                      <div v-for="(row, i) in addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders" :key="i">
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
                          <v-icon color="success" class="mr-4" @click="copyHttpHeaders(i)">mdi-content-copy</v-icon>
                          <v-icon color="error" @click="deleteHttpHeaders(i)">mdi-trash-can-outline</v-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.dependServices !== null" :id="'dependServices-'+targetIndex">
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
                  <v-icon color="success" class="ml-4" @click="addDependServices()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('dependServices')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-for="(row, i) in addComponentForm.deploySpecStatic.dependServices">
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
                  <v-icon color="success" class="mr-4" @click="copyDependServices(i)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteDependServices(i)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.hostAliases !== null" :id="'hostAliases-'+targetIndex">
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
                  <v-icon color="success" class="ml-4" @click="addHostAliases()">mdi-table-plus</v-icon> 
                  <v-icon color="error" class="ml-4" @click="clearParams('hostAliases')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4 align-center" v-for="(row, i) in addComponentForm.deploySpecStatic.hostAliases">
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
                  <v-icon color="success" class="mr-4" @click="copyHostAliases(i)">mdi-content-copy</v-icon>
                  <v-icon color="error" @click="deleteHostAliases(i)">mdi-trash-can-outline</v-icon>
                </div>
              </div>
              <div class="form-item-100 params-item" v-show="addComponentForm.deploySpecStatic.securityContext.runAsUser !== 0 || addComponentForm.deploySpecStatic.securityContext.runAsGroup !== 0" :id="'securityContext-'+targetIndex">
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
                  <v-icon color="error" @click="clearParams('securityContext')">mdi-minus-circle-outline</v-icon>
                </div>
                <div class="params-content d-flex justify-space-between mt-4" v-if="addComponentForm.deploySpecStatic.securityContext">
                  <div class="form-item-45">
                    <v-text-field
                      label="应用运行的用户ID(runAsUser)*"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.securityContext.runAsUser"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="应用运行的用户组ID(runAsGroup)*"
                      dense
                      type="number"
                      v-model="addComponentForm.deploySpecStatic.securityContext.runAsGroup"
                    />
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteComponentDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">删除组件模板</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-alert icon="mdi-alert-circle" prominent text type="error">
              <small>删除组件模板</small>
            </v-alert>
            <v-container>
              确认要将组件模板移除吗？
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.deleteComponentDialog = false
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteComponent()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="auditDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 500px;">
          <pre
            v-for="(logMsg, i) in logList"
            :key="i"
            :id="'log' + i"
            :style="logMsg.logType | changeColor"
          >[{{ logMsg.logType }}] {{ logMsg.endTime }}  {{ logMsg.content }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.auditDialog = false
              this.refreshList()
            }"
            :disabled="disableBtn"
            :loading="disableBtn"
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
  </PageCard>
</template>

<script>
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import Operations from '@/lib/ui-lib/components/Operations'
import request from '@/utils/request'
import YAML from "yamljs";
import Monaco from "@/lib/monaco/Monaco";
export default {
  name: 'ComponentTemplates',
  components: {
    PageCard,
    Operations,
    Monaco
  },
  inject: ['successTip', 'errorTip', 'warnTip'],
  data () {
    return {
      tableLoading: true,
      defaultLoading: false,
      auditDialog: false,
      defaultComponentDialog: false,
      defaultComponentTemplateYaml: '',
      updateComponentDialog: false,
      logList: [],
      userToken: '',
      componentsHeaders:[
        { text: '组件模板名称', value: 'componentTemplateName', sortable: false },
        { text: '组件模板描述', value: 'componentTemplateDesc', sortable: false },
        { text: '组件模板定义YAML', value: 'componentTemplateYaml', sortable: false },
        { text: '创建时间', value: 'createTime', sortable: false },
        { text: '操作', value: 'handle', sortable: false },
      ],
      componentsData: {},
      componentsForm: {
        page: 1,
        perPage: 10
      },
      targetYaml: '',
      yamlDialog: false,
      addComponentDialog: false,
      addComponentForm: {
        componentTemplateName: '',
        componentTemplateDesc: '',
        deploySpecStatic: {
          deployImage: "",
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
          dependServices: null,
          hostAliases: null,
          securityContext: {
            runAsUser: 0,
            runAsGroup: 0,
          },
          deployEnvs: null,
          deployCommand: "",
          deploySessionAffinityTimeoutSeconds: 0,
        }
      },
      targetComponentName: '',
      deleteComponentDialog: false,
      disableBtn: false,
      YAMLDialog: false,
      yamlText: '',
      targetIndex: '',
      singleMonacoOptions: {
        value: '',
        automaticLayout:true,
        readOnly: true, // 是否只读
        theme: "vs-dark", // 编辑器主题
        language: "yaml"
      },
    }
  },
  methods: {
    showLog (response) {
      const vm =this
      vm.logList = []
      vm.auditDialog = response.data.withAdminLog
      if(response.data.withAdminLog){
        vm.disableBtn = true
        vm.ws = new WebSocket(`${vm.GLOBAL}/ws/log/audit/admin/${response.data.auditID}?x-user-token=${vm.userToken}`)
        vm.ws.onmessage = (event) => {
          vm.logList.push(JSON.parse(event.data))
        }
        vm.ws.onclose = () => {
          vm.logList.push({logType: 'END'})
          vm.disableBtn = false
        }
      }
    },
    changeOptions (data) {
      const vm = this
      vm.componentsForm.page = data.page
      vm.componentsForm.perPage = data.itemsPerPage
      vm.refreshList()
    },
    refreshList () {
      const vm = this
      vm.tableLoading = true
      request.post('admin/componentTemplates', vm.componentsForm).then(response => {
        vm.componentsData = response.data
        vm.tableLoading = false
        console.log(vm.componentsData)
      }).catch(error => {
        vm.tableLoading = false
        vm.errorTip(true, error.response.data.msg)
      })
    },
    detailHandle (item) {
      const vm = this
      let yaml = JSON.parse(JSON.stringify(item))
      if (yaml.deploySessionAffinityTimeoutSeconds !== null && yaml.deploySessionAffinityTimeoutSeconds !== 0) {
        yaml.deploySessionAffinityTimeoutSeconds = Number(yaml.deploySessionAffinityTimeoutSeconds);
      }else{
        delete yaml.deploySessionAffinityTimeoutSeconds
      }
      if (yaml.deployLocalPorts !== null) {
        yaml.deployLocalPorts.map((item) => {
          item.port = Number(item.port);
        });
      }
      if (yaml.deployNodePorts !== null) {
        yaml.deployNodePorts.map((item) => {
          item.port = Number(item.port);
        });
      }
      if (yaml.dependServices !== null) {
        yaml.dependServices.map((item) => {
          item.dependPort = Number(item.dependPort);
        });
      }
      yaml.deployHealthCheck.checkPort = Number(yaml.deployHealthCheck.checkPort);
      yaml.deployHealthCheck.livenessDelaySeconds = Number(yaml.deployHealthCheck.livenessDelaySeconds);
      yaml.deployHealthCheck.livenessPeriodSeconds = Number(yaml.deployHealthCheck.livenessPeriodSeconds);
      yaml.deployHealthCheck.readinessDelaySeconds = Number(yaml.deployHealthCheck.readinessDelaySeconds);
      yaml.deployHealthCheck.readinessPeriodSeconds = Number(yaml.deployHealthCheck.readinessPeriodSeconds);
      yaml.deployHealthCheck.httpGet.port = Number(yaml.deployHealthCheck.httpGet.port);
      yaml.securityContext.runAsUser = Number(yaml.securityContext.runAsUser);
      yaml.securityContext.runAsGroup = Number(yaml.securityContext.runAsGroup);
      yaml.deployReplicas = Number(yaml.deployReplicas);
      Object.keys(yaml).forEach(item => {
        if(yaml[item] !== null){
          if(yaml[item] instanceof Array && yaml[item].length <= 0){
            delete yaml[item]
          }else if(yaml[item] instanceof Object && JSON.stringify(yaml[item]) == "{}"){
            delete yaml[item]
          }else if(yaml[item] === ''){
            delete yaml[item]
          }else if(yaml[item] instanceof Object){
            if(item === 'deployResources'){
              if(yaml.deployResources.cpuLimit === '' && yaml.deployResources.cpuRequest === '' && yaml.deployResources.memoryLimit === '' && yaml.deployResources.memoryRequest === ''){
                delete yaml.deployResources
              }else{
                vm.sortData(yaml.deployResources)
              }
            }else if(item === 'deployHealthCheck'){
              if(yaml.deployHealthCheck.checkPort === 0 && yaml.deployHealthCheck.livenessDelaySeconds === 0 && yaml.deployHealthCheck.livenessPeriodSeconds === 0 && yaml.deployHealthCheck.readinessDelaySeconds === 0 && yaml.deployHealthCheck.readinessPeriodSeconds === 0 && yaml.deployHealthCheck.httpGet.port === 0 && yaml.deployHealthCheck.httpGet.httpHeaders === null && yaml.deployHealthCheck.httpGet.path === ''){
                delete yaml.deployHealthCheck
              }else{
                vm.sortData(yaml.deployHealthCheck.httpGet)
                vm.sortData(yaml.deployHealthCheck)
              }
            }else if(item === 'securityContext'){
              if(yaml.securityContext.runAsGroup === 0 && yaml.securityContext.runAsUser === 0){
                delete yaml.securityContext
              }else{
                vm.sortData(yaml.securityContext)
              }
            }else if(item === 'deployVolumes'){
              if(yaml.deployVolumes && yaml.deployVolumes !== null && yaml.deployVolumes.length > 0){
                yaml.deployVolumes.forEach(row => {
                  vm.sortData(row)
                })
              }
            }else if(item === 'deployLocalPorts'){
              if(yaml.deployLocalPorts && yaml.deployLocalPorts !== null && yaml.deployLocalPorts.length > 0){
                yaml.deployLocalPorts.forEach(row => {
                  vm.sortData(row)
                })
              }
            }
          }
        }else{
          delete yaml[item]
        }
      })
      vm.targetYaml = YAML.stringify(yaml, 4)
      vm.$refs.monaco2.monacoEditor.setValue(vm.targetYaml)
      vm.yamlDialog = true
    },
    openAddComponent (flag) {
      const vm = this
      vm.addComponentDialog = true
      vm.targetIndex = flag
      vm.defaultLoading = true
      request.get('/admin/componentTemplate').then(response => {
        vm.defaultLoading = false
        console.log(response)
        Object.keys(response.data.deploySpecStatic).forEach(item => {
          if(response.data.deploySpecStatic[item] !== null){
            if(response.data.deploySpecStatic[item] instanceof Array && response.data.deploySpecStatic[item].length <= 0){
              response.data.deploySpecStatic[item] = null
            }else if(response.data.deploySpecStatic[item] instanceof Object && JSON.stringify(response.data.deploySpecStatic[item]) == "{}"){
              response.data.deploySpecStatic[item] = null
            }
          }
        })
        if (response.data.deploySpecStatic.deployEnvs !== null) {
          response.data.deploySpecStatic.deployEnvs.forEach((row, rowIndex) => {
            row = row.split("=");
            response.data.deploySpecStatic.deployEnvs[rowIndex] = row;
          });
        }
        vm.addComponentForm.deploySpecStatic = response.data.deploySpecStatic
        vm.addComponentForm.componentTemplateName = ''
        vm.addComponentForm.componentTemplateDesc = ''
      }).catch(error => {
        vm.defaultLoading = false
        vm.errorTip(true, error.response.data.msg)
      })
    },
    previewComponent() {
      const vm = this;
      if (vm.$refs.addComponentRef.validate()) {
        var copyData = JSON.parse(JSON.stringify(vm.addComponentForm.deploySpecStatic))
        if (copyData.deploySessionAffinityTimeoutSeconds !== null && copyData.deploySessionAffinityTimeoutSeconds !== 0) {
          copyData.deploySessionAffinityTimeoutSeconds = Number(copyData.deploySessionAffinityTimeoutSeconds);
        }else{
          delete copyData.deploySessionAffinityTimeoutSeconds
        }
        if (copyData.deployLocalPorts !== null) {
          copyData.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.deployNodePorts !== null) {
          copyData.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.dependServices !== null) {
          copyData.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        copyData.deployHealthCheck.checkPort = Number(copyData.deployHealthCheck.checkPort);
        copyData.deployHealthCheck.livenessDelaySeconds = Number(copyData.deployHealthCheck.livenessDelaySeconds);
        copyData.deployHealthCheck.livenessPeriodSeconds = Number(copyData.deployHealthCheck.livenessPeriodSeconds);
        copyData.deployHealthCheck.readinessDelaySeconds = Number(copyData.deployHealthCheck.readinessDelaySeconds);
        copyData.deployHealthCheck.readinessPeriodSeconds = Number(copyData.deployHealthCheck.readinessPeriodSeconds);
        copyData.deployHealthCheck.httpGet.port = Number(copyData.deployHealthCheck.httpGet.port);
        copyData.securityContext.runAsUser = Number(copyData.securityContext.runAsUser);
        copyData.securityContext.runAsGroup = Number(copyData.securityContext.runAsGroup);
        copyData.deployReplicas = Number(copyData.deployReplicas);
        if (copyData.deployEnvs !== null && copyData.deployEnvs.length > 0) {
          copyData.deployEnvs.map((row, rowIndex) => {
            row = row.join("=");
            copyData.deployEnvs[rowIndex] = row;
          });
        }
        Object.keys(copyData).forEach(item => {
          if(copyData[item] !== null){
            if(copyData[item] instanceof Array && copyData[item].length <= 0){
              delete copyData[item]
            }else if(copyData[item] instanceof Object && JSON.stringify(copyData[item]) == "{}"){
              delete copyData[item]
            }else if(copyData[item] === ''){
              delete copyData[item]
            }else if(copyData[item] instanceof Object){
              if(item === 'deployResources'){
                if(copyData.deployResources.cpuLimit === '' && copyData.deployResources.cpuRequest === '' && copyData.deployResources.memoryLimit === '' && copyData.deployResources.memoryRequest === ''){
                  delete copyData.deployResources
                }else{
                  vm.sortData(copyData.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(copyData.deployHealthCheck.checkPort === 0 && copyData.deployHealthCheck.livenessDelaySeconds === 0 && copyData.deployHealthCheck.livenessPeriodSeconds === 0 && copyData.deployHealthCheck.readinessDelaySeconds === 0 && copyData.deployHealthCheck.readinessPeriodSeconds === 0 && copyData.deployHealthCheck.httpGet.port === 0 && copyData.deployHealthCheck.httpGet.httpHeaders === null && copyData.deployHealthCheck.httpGet.path === ''){
                  delete copyData.deployHealthCheck
                }else{
                  vm.sortData(copyData.deployHealthCheck.httpGet)
                  vm.sortData(copyData.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(copyData.securityContext.runAsGroup === 0 && copyData.securityContext.runAsUser === 0){
                  delete copyData.securityContext
                }else{
                  vm.sortData(copyData.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(copyData.deployVolumes && copyData.deployVolumes !== null && copyData.deployVolumes.length > 0){
                  copyData.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(copyData.deployLocalPorts && copyData.deployLocalPorts !== null && copyData.deployLocalPorts.length > 0){
                  copyData.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete copyData[item]
          }
        })
        vm.yamlText = YAML.stringify(copyData, 4);
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true;
      }
    },
    clearParams(name) {
      const vm = this;
      if(name === "other") {
        vm.addComponentForm.deploySpecStatic.deployCommand = "";
        vm.addComponentForm.deploySpecStatic.deployEnvs = null;
        vm.addComponentForm.deploySpecStatic.deployArgs = null;
        vm.addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds = 0;
      } else if (name === "securityContext") {
        vm.addComponentForm.deploySpecStatic.securityContext = {
          runAsUser: 0,
          runAsGroup: 0,
        };
      }else if(name === "deployHealthCheck") {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck = {
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
      }else if(name === 'deployResources'){
        vm.addComponentForm.deploySpecStatic.deployResources = {
          cpuLimit: '',
          cpuRequest: '',
          memoryLimit: '',
          memoryRequest: ''
        };
      }else if(name === 'portSetting'){
        vm.addComponentForm.deploySpecStatic.deployNodePorts = null
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = null
      }else{
        vm.addComponentForm.deploySpecStatic[name] = null;
      }
    },
    chooseParams(e) {
      const vm = this;
      if (e === "杂项") {
        if (vm.addComponentForm.deploySpecStatic.deployEnvs === null && vm.addComponentForm.deploySpecStatic.deploySessionAffinityTimeoutSeconds === 0 && vm.addComponentForm.deploySpecStatic.deployCommand === "" && vm.addComponentForm.deploySpecStatic.deployArgs === null){
          vm.addComponentForm.deploySpecStatic.deployEnvs = [["", ""]];
        }
      } else if (e === "deployLocalPorts") {
        if (vm.addComponentForm.deploySpecStatic.deployLocalPorts === null) {
          vm.addComponentForm.deploySpecStatic[e] = [];
        }
      } else if (e === "securityContext") {
        if (
          vm.addComponentForm.deploySpecStatic.securityContext.runAsUser == 0 &&
          vm.addComponentForm.deploySpecStatic.securityContext.runAsGroup == 0
        ) {
          vm.addComponentForm.deploySpecStatic.securityContext = {
            runAsUser: 1000,
            runAsGroup: 0,
          };
        }
      } else if (e === "deployHealthCheck") {
        if (
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .livenessDelaySeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .livenessPeriodSeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .readinessDelaySeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck
            .readinessPeriodSeconds === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.port === 0 &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.path === "" &&
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders ===
            null
        ) {
         vm.addComponentForm.deploySpecStatic.deployHealthCheck.readinessDelaySeconds = 15;
         vm.addComponentForm.deploySpecStatic.deployHealthCheck.readinessPeriodSeconds = 5;
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.livenessDelaySeconds = 60;
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.livenessPeriodSeconds = 30;
        }
      } else if (e === "deployResources") {
        if (vm.addComponentForm.deploySpecStatic.deployResources.cpuLimit === '' && vm.addComponentForm.deploySpecStatic.deployResources.cpuRequest === '' && vm.addComponentForm.deploySpecStatic.deployResources.memoryLimit === '' && vm.addComponentForm.deploySpecStatic.deployResources.memoryRequest === '') {
          vm.addComponentForm.deploySpecStatic.deployResources = {
            memoryRequest: "10Mi",
            memoryLimit: "100Mi",
            cpuRequest: "10m",
            cpuLimit: "100m",
          };
        }
      }else if(e === 'deployLocalPorts'){
        if(vm.addComponentForm.deploySpecStatic.deployLocalPorts === null){
          vm.addComponentForm.deploySpecStatic.deployNodePorts = []
        }
      } else {
        if (vm.addComponentForm.deploySpecStatic[e] === null) {
          if (
            e === "deployVolumes" ||
            e === "dependServices" ||
            e === "hostAliases"
          ) {
            vm.addComponentForm.deploySpecStatic[e] = [];
          } else {
            vm.addComponentForm.deploySpecStatic[e] = {};
          }
        }
      }
      vm.timer = setTimeout(() => {
        document.querySelector("#" + e + '-' + vm.targetIndex).scrollIntoView(true);
      }, 500);
    },
    checkChange(e) {
      const vm = this;
      if (e === "checkPort") {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet = {
          port: 0,
          path: "",
          httpHeaders: null
        }
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort = 8080
      }else{
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet = {
          path: "",
          port: 8080,
          httpHeaders: null,
        }
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.checkPort = 0
      }
    },
    changePortSet(e) {
      const vm = this;
      if(e === 'deployNodePorts'){
        vm.addComponentForm.deploySpecStatic.deployNodePorts = []
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = null
      }else{
        vm.addComponentForm.deploySpecStatic.deployNodePorts = null
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = []
      }
    },
    addDeployEnvs() {
      const vm = this;
      let addItem = ["", ""];
      if (vm.addComponentForm.deploySpecStatic.deployEnvs === null) {
        vm.addComponentForm.deploySpecStatic.deployEnvs = [];
        vm.addComponentForm.deploySpecStatic.deployEnvs.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployEnvs.push(addItem);
      }
    },
    addDeployLocalPort() {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "tcp",
      };
      if (vm.addComponentForm.deploySpecStatic.deployLocalPorts === null) {
        vm.addComponentForm.deploySpecStatic.deployLocalPorts = [];
        vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(addItem);
      }
    },
    copyDeployLocalPort(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployLocalPorts[j])
      );
      vm.addComponentForm.deploySpecStatic.deployLocalPorts.push(copyItem);
    },
    deleteDeployLocalPort(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployLocalPorts.splice(j, 1);
    },
    deleteDeployEnvs(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployEnvs.splice(j, 1);
    },
    addDeployNodePort() {
      const vm = this;
      let addItem = {
        port: null,
        protocol: "tcp",
        nodePort: null,
      };
      if (vm.addComponentForm.deploySpecStatic.deployNodePorts === null) {
        vm.addComponentForm.deploySpecStatic.deployNodePorts = [];
        vm.addComponentForm.deploySpecStatic.deployNodePorts.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployNodePorts.push(addItem);
      }
    },
    copyDeployNodePort(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployNodePorts[j])
      );
      vm.addComponentForm.deploySpecStatic.deployNodePorts.push(copyItem);
    },
    deleteDeployNodePort(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployNodePorts.splice(j, 1);
    },
    addDeployVolumes() {
      const vm = this;
      let addItem = {
        pathInPod: "",
        pathInPv: "",
      };
      if (vm.addComponentForm.deploySpecStatic.deployVolumes === null) {
        vm.addComponentForm.deploySpecStatic.deployVolumes = [];
        vm.addComponentForm.deploySpecStatic.deployVolumes.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.deployVolumes.push(addItem);
      }
    },
    copyDeployVolumes(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.deployVolumes[j])
      );
      vm.addComponentForm.deploySpecStatic.deployVolumes.push(copyItem);
    },
    deleteDeployVolumes(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployVolumes.splice(j, 1);
    },
    addHttpHeaders() {
      const vm = this;
      let addItem = {
        name: "",
        value: "",
      };
      if (
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders ===
        null
      ) {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders = [];
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      } else {
        vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
          addItem
        );
      }
    },
    copyHttpHeaders(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(
          vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders[j]
        )
      );
      vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.push(
        copyItem
      );
    },
    deleteHttpHeaders(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.deployHealthCheck.httpGet.httpHeaders.splice(
        j,
        1
      );
    },
    addDependServices() {
      const vm = this;
      let addItem = {
        dependName: "",
        dependPort: null,
        dependType: "TCP",
      };
      if (vm.addComponentForm.deploySpecStatic.dependServices === null) {
        vm.addComponentForm.deploySpecStatic.dependServices = [];
        vm.addComponentForm.deploySpecStatic.dependServices.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.dependServices.push(addItem);
      }
    },
    copyDependServices(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.dependServices[j])
      );
      vm.addComponentForm.deploySpecStatic.dependServices.push(copyItem);
    },
    deleteDependServices(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.dependServices.splice(j, 1);
    },
    addHostAliases() {
      const vm = this;
      let addItem = {
        ip: "",
        hostnames: [],
      };
      if (vm.addComponentForm.deploySpecStatic.hostAliases === null) {
        vm.addComponentForm.deploySpecStatic.hostAliases = [];
        vm.addComponentForm.deploySpecStatic.hostAliases.push(addItem);
      } else {
        vm.addComponentForm.deploySpecStatic.hostAliases.push(addItem);
      }
    },
    copyHostAliases(j) {
      const vm = this;
      let copyItem = JSON.parse(
        JSON.stringify(vm.addComponentForm.deploySpecStatic.hostAliases[j])
      );
      vm.addComponentForm.deploySpecStatic.hostAliases.push(copyItem);
    },
    deleteHostAliases(j) {
      const vm = this;
      vm.addComponentForm.deploySpecStatic.hostAliases.splice(j, 1);
    },
    addComponent () {
      const vm = this
      if(vm.$refs.addComponentRef.validate()){
        var copyData = JSON.parse(JSON.stringify(vm.addComponentForm.deploySpecStatic))
        if (copyData.deploySessionAffinityTimeoutSeconds !== null && copyData.deploySessionAffinityTimeoutSeconds !== 0) {
          copyData.deploySessionAffinityTimeoutSeconds = Number(copyData.deploySessionAffinityTimeoutSeconds);
        }else{
          delete copyData.deploySessionAffinityTimeoutSeconds
        }
        if (copyData.deployLocalPorts !== null) {
          copyData.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.deployNodePorts !== null) {
          copyData.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.dependServices !== null) {
          copyData.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        copyData.deployHealthCheck.checkPort = Number(copyData.deployHealthCheck.checkPort);
        copyData.deployHealthCheck.livenessDelaySeconds = Number(copyData.deployHealthCheck.livenessDelaySeconds);
        copyData.deployHealthCheck.livenessPeriodSeconds = Number(copyData.deployHealthCheck.livenessPeriodSeconds);
        copyData.deployHealthCheck.readinessDelaySeconds = Number(copyData.deployHealthCheck.readinessDelaySeconds);
        copyData.deployHealthCheck.readinessPeriodSeconds = Number(copyData.deployHealthCheck.readinessPeriodSeconds);
        copyData.deployHealthCheck.httpGet.port = Number(copyData.deployHealthCheck.httpGet.port);
        copyData.securityContext.runAsUser = Number(copyData.securityContext.runAsUser);
        copyData.securityContext.runAsGroup = Number(copyData.securityContext.runAsGroup);
        copyData.deployReplicas = Number(copyData.deployReplicas);
        if (copyData.deployEnvs !== null && copyData.deployEnvs.length > 0) {
          copyData.deployEnvs.map((row, rowIndex) => {
            row = row.join("=");
            copyData.deployEnvs[rowIndex] = row;
          });
        }
        Object.keys(copyData).forEach(item => {
          if(copyData[item] !== null){
            if(copyData[item] instanceof Array && copyData[item].length <= 0){
              delete copyData[item]
            }else if(copyData[item] instanceof Object && JSON.stringify(copyData[item]) == "{}"){
              delete copyData[item]
            }else if(copyData[item] === ''){
              delete copyData[item]
            }else if(copyData[item] instanceof Object){
              if(item === 'deployResources'){
                if(copyData.deployResources.cpuLimit === '' && copyData.deployResources.cpuRequest === '' && copyData.deployResources.memoryLimit === '' && copyData.deployResources.memoryRequest === ''){
                  delete copyData.deployResources
                }else{
                  vm.sortData(copyData.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(copyData.deployHealthCheck.checkPort === 0 && copyData.deployHealthCheck.livenessDelaySeconds === 0 && copyData.deployHealthCheck.livenessPeriodSeconds === 0 && copyData.deployHealthCheck.readinessDelaySeconds === 0 && copyData.deployHealthCheck.readinessPeriodSeconds === 0 && copyData.deployHealthCheck.httpGet.port === 0 && copyData.deployHealthCheck.httpGet.httpHeaders === null && copyData.deployHealthCheck.httpGet.path === ''){
                  delete copyData.deployHealthCheck
                }else{
                  vm.sortData(copyData.deployHealthCheck.httpGet)
                  vm.sortData(copyData.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(copyData.securityContext.runAsGroup === 0 && copyData.securityContext.runAsUser === 0){
                  delete copyData.securityContext
                }else{
                  vm.sortData(copyData.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(copyData.deployVolumes && copyData.deployVolumes !== null && copyData.deployVolumes.length > 0){
                  copyData.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(copyData.deployLocalPorts && copyData.deployLocalPorts !== null && copyData.deployLocalPorts.length > 0){
                  copyData.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete copyData[item]
          }
        })
        var componentTemplateYaml = YAML.stringify(copyData, 4);
        request.post('/admin/componentTemplate', {
          componentTemplateName: vm.addComponentForm.componentTemplateName,
          componentTemplateDesc: vm.addComponentForm.componentTemplateDesc,
          componentTemplateYaml: componentTemplateYaml
        }).then(response => {
          vm.addComponentDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    openUpdateComponent (item) {
      const vm = this
      vm.targetIndex = item.componentTemplateName
      vm.targetComponentName = item.componentTemplateName
      request.post('/admin/componentTemplates', vm.componentsForm).then(response => {
        response.data.componentTemplates.forEach(next => {
          if(next.componentTemplateName === item.componentTemplateName){
            vm.addComponentForm = next
          }
        })
        Object.keys(vm.addComponentForm.deploySpecStatic).forEach(item => {
          if(vm.addComponentForm.deploySpecStatic[item] !== null){
            if(vm.addComponentForm.deploySpecStatic[item] instanceof Array && vm.addComponentForm.deploySpecStatic[item].length <= 0){
              vm.addComponentForm.deploySpecStatic[item] = null
            }else if(vm.addComponentForm.deploySpecStatic[item] instanceof Object && JSON.stringify(vm.addComponentForm.deploySpecStatic[item]) == "{}"){
              vm.addComponentForm.deploySpecStatic[item] = null
            }
          }
        })
        if (vm.addComponentForm.deploySpecStatic.deployEnvs !== null) {
          vm.addComponentForm.deploySpecStatic.deployEnvs.forEach((row, rowIndex) => {
            row = row.split("=");
            vm.addComponentForm.deploySpecStatic.deployEnvs[rowIndex] = row;
          });
        }
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
      vm.updateComponentDialog = true
    },
    updateComponent () {
      const vm = this
      if(vm.$refs.addComponentRef.validate()){
        var copyData = JSON.parse(JSON.stringify(vm.addComponentForm.deploySpecStatic))
        if (copyData.deploySessionAffinityTimeoutSeconds !== null && copyData.deploySessionAffinityTimeoutSeconds !== 0) {
          copyData.deploySessionAffinityTimeoutSeconds = Number(copyData.deploySessionAffinityTimeoutSeconds);
        }else{
          delete copyData.deploySessionAffinityTimeoutSeconds
        }
        if (copyData.deployLocalPorts !== null) {
          copyData.deployLocalPorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.deployNodePorts !== null) {
          copyData.deployNodePorts.map((item) => {
            item.port = Number(item.port);
          });
        }
        if (copyData.dependServices !== null) {
          copyData.dependServices.map((item) => {
            item.dependPort = Number(item.dependPort);
          });
        }
        copyData.deployHealthCheck.checkPort = Number(copyData.deployHealthCheck.checkPort);
        copyData.deployHealthCheck.livenessDelaySeconds = Number(copyData.deployHealthCheck.livenessDelaySeconds);
        copyData.deployHealthCheck.livenessPeriodSeconds = Number(copyData.deployHealthCheck.livenessPeriodSeconds);
        copyData.deployHealthCheck.readinessDelaySeconds = Number(copyData.deployHealthCheck.readinessDelaySeconds);
        copyData.deployHealthCheck.readinessPeriodSeconds = Number(copyData.deployHealthCheck.readinessPeriodSeconds);
        copyData.deployHealthCheck.httpGet.port = Number(copyData.deployHealthCheck.httpGet.port);
        copyData.securityContext.runAsUser = Number(copyData.securityContext.runAsUser);
        copyData.securityContext.runAsGroup = Number(copyData.securityContext.runAsGroup);
        copyData.deployReplicas = Number(copyData.deployReplicas);
        if (copyData.deployEnvs !== null && copyData.deployEnvs.length > 0) {
          copyData.deployEnvs.map((row, rowIndex) => {
            row = row.join("=");
            copyData.deployEnvs[rowIndex] = row;
          });
        }
        Object.keys(copyData).forEach(item => {
          if(copyData[item] !== null){
            if(copyData[item] instanceof Array && copyData[item].length <= 0){
              delete copyData[item]
            }else if(copyData[item] instanceof Object && JSON.stringify(copyData[item]) == "{}"){
              delete copyData[item]
            }else if(copyData[item] === ''){
              delete copyData[item]
            }else if(copyData[item] instanceof Object){
              if(item === 'deployResources'){
                if(copyData.deployResources.cpuLimit === '' && copyData.deployResources.cpuRequest === '' && copyData.deployResources.memoryLimit === '' && copyData.deployResources.memoryRequest === ''){
                  delete copyData.deployResources
                }else{
                  vm.sortData(copyData.deployResources)
                }
              }else if(item === 'deployHealthCheck'){
                if(copyData.deployHealthCheck.checkPort === 0 && copyData.deployHealthCheck.livenessDelaySeconds === 0 && copyData.deployHealthCheck.livenessPeriodSeconds === 0 && copyData.deployHealthCheck.readinessDelaySeconds === 0 && copyData.deployHealthCheck.readinessPeriodSeconds === 0 && copyData.deployHealthCheck.httpGet.port === 0 && copyData.deployHealthCheck.httpGet.httpHeaders === null && copyData.deployHealthCheck.httpGet.path === ''){
                  delete copyData.deployHealthCheck
                }else{
                  vm.sortData(copyData.deployHealthCheck.httpGet)
                  vm.sortData(copyData.deployHealthCheck)
                }
              }else if(item === 'securityContext'){
                if(copyData.securityContext.runAsGroup === 0 && copyData.securityContext.runAsUser === 0){
                  delete copyData.securityContext
                }else{
                  vm.sortData(copyData.securityContext)
                }
              }else if(item === 'deployVolumes'){
                if(copyData.deployVolumes && copyData.deployVolumes !== null && copyData.deployVolumes.length > 0){
                  copyData.deployVolumes.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }else if(item === 'deployLocalPorts'){
                if(copyData.deployLocalPorts && copyData.deployLocalPorts !== null && copyData.deployLocalPorts.length > 0){
                  copyData.deployLocalPorts.forEach(row => {
                    vm.sortData(row)
                  })
                }
              }
            }
          }else{
            delete copyData[item]
          }
        })
        var componentTemplateYaml = YAML.stringify(copyData, 4);
        request.post(`/admin/componentTemplate/${vm.targetComponentName}`, {
          componentTemplateName: vm.targetComponentName,
          componentTemplateDesc: vm.addComponentForm.componentTemplateDesc,
          componentTemplateYaml: componentTemplateYaml
        }).then(response => {
          vm.updateComponentDialog = false
          vm.successTip(true, response.msg)
          vm.refreshList()
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请填写完整内容')
      }
    },
    openDeleteComponent (item) {
      const vm = this
      vm.targetComponentName = item.componentTemplateName
      vm.deleteComponentDialog = true
    },
    deleteComponent () {
      const vm = this
      request.delete(`/admin/componentTemplate/${vm.targetComponentName}`).then(response => {
        vm.deleteComponentDialog = false
        vm.successTip(true, response.msg)
        vm.refreshList()
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
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
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
    },
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    vm.refreshList()
  },
  computed: {
    
  }
}
</script>

<style lang="scss" scoped>
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
