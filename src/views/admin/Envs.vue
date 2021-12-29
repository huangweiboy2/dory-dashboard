<template>
  <div class="envs">
    <PageCard name="环境管理">
      <v-card>
        <v-card-title>
          <v-form style="width: 100%">
            <v-container class="d-flex flex-wrap" fluid>
              <v-row>
                <v-col cols="4">
                  <v-select
                    :items="envNamesResponse.data.envNames"
                    v-model="pageRequest.envNames"
                    label="环境名称"
                    dense
                    small-chips
                    multiple
                    clearable
                    @change="$observables.queryPage$.next('envNameChange')"
                  ></v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="$observables.addEnvClick$.next('add')">新增环境</v-btn>
              </v-row>
            </v-container>
          </v-form>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="pageResponse.data.envK8ss"
            :server-items-length="pageRequest.perPage"
            class="elevation-1"
            dense
            item-key="envName"
            show-expand
          >
            <template v-slot:item.handle="{ item }">
              <Operations
                :operations="[
                  { text: '修改环境', onClick: () => {$observables.modifyEnvClick$.next(item)} },
                  { text: '删除环境', onClick: () => {$observables.deleteEnvClick$.next(item)} }
                ]"
              ></Operations>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-1">
                <v-card class="rounded-0">
                  <v-card-title>
                    环境PV设置
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="$observables.addPvClick$.next(item)">新增PV</v-btn>
                  </v-card-title>
                  <v-card-text>
                    <env-pvs-data-table
                      :pvs="item.pvs"
                      :env-item="item"
                      hideDefaultFooter
                      disablePagination
                      @modifyPv="(pvItem, envItem) => {$observables.modifyPvClick$.next({
                        pvItem, envItem
                      })}"
                      @deletePv="(pvItem) => {$observables.deletePvClick$.next(pvItem)}"
                    />
                  </v-card-text>
                </v-card>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </PageCard>
    <v-dialog
      v-model="operationDialog"
      persistent
      :max-width="dialogWidth"
    >
      <OperationCard
        v-bind="operationCardConfig.attrs"
        v-on="Object.entries(operationCardConfig.listeners).reduce((acc, [key, value]) => {
          if(value) {
            acc[key] = value
          }
          return acc
        }, {})"
      >
        <template v-slot:addEnv v-if="operationCardConfig.attrs.formEls.includes('addEnv')">
          <v-form ref="envRef">
            <div class="env-wrap">
              <div class="d-flex justify-space-between">
                <div class="form-item-45">
                  <v-text-field
                    label="kubernetes环境标识(envName)*"
                    required
                    dense
                    v-model="formValue.envK8s.envName"
                    :rules="[
                      v => !!v || '请输入环境名称',
                    ]"
                  />
                </div>
                <div class="form-item-45">
                  <v-text-field
                    label="kubernetes环境描述(envDesc)*"
                    required
                    dense
                    v-model="formValue.envK8s.envDesc"
                    :rules="[
                      v => !!v || '请输入环境描述',
                    ]"
                    hint="用于显示在流水线上的环境名称"
                    persistent-hint
                  />
                </div>
              </div>
              <div class="params-item mt-4">
                <small>kubernetes环境参数</small>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver地址(host)*"
                      required
                      dense
                      v-model="formValue.envK8s.host"
                      :rules="[
                        v => !!v || 'apiserver地址为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver地址</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver端口(port)*"
                      required
                      dense
                      v-model="formValue.envK8s.port"
                      type="number"
                      :rules="[
                        v => !!v || 'apiserver端口为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver端口</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver的token(token)*"
                      required
                      dense
                      v-model="formValue.envK8s.token"
                      :rules="[
                        v => !!v || 'apiserver的token为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver的token</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目数据Pod设置(projectDataPod)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>该kubernetes pod可以访问默认持久化的根目录，用于通过该pod给各个项目名字空间发送初始化文件</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod所在名字空间(namespace)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.namespace"
                      :rules="[
                        v => !!v || 'pod所在名字空间为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod的名字(pod)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.pod"
                      :rules="[
                        v => !!v || 'pod的名字为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod中项目共享目录的根路径(path)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.path"
                      :rules="[
                        v => !!v || 'pod中项目共享目录的根路径为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>该路径挂装了所有项目名字空间的共享存储的根路径</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>harbor配置(harborConfig)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于kubernetes集群拉取harbor镜像</div>
                    <div>注意，需要设置kubernetes集群的harbor相关证书</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的访问主机名(hostname)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.hostname"
                      :rules="[
                        v => !!v || 'harbor的访问主机名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的IP地址(ip)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.ip"
                      :rules="[
                        v => !!v || 'harbor的IP地址为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的端口(port)*"
                      required
                      dense
                      type="number"
                      v-model="formValue.envK8s.harborConfig.port"
                      :rules="[
                        v => !!v || 'harbor的端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员用户名(username)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.username"
                      :rules="[
                        v => !!v || 'harbor的管理员用户名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员密码(password)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.password"
                      :rules="[
                        v => !!v || 'harbor的管理员密码为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员邮箱(email)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.email"
                      :rules="[
                        v => !!v || 'harbor的管理员邮箱为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>nexus配置(nexusConfig)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于kubernetes集群拉取的debug容器yum源设置和docker proxy设置</div>
                    <div>注意，需要设置kubernetes集群的insecure-registry</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus主机名(hostname)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.hostname"
                      :rules="[
                        v => !!v || 'nexus主机名为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>可以使用ip地址</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的ip地址(ip)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.ip"
                      :rules="[
                        v => !!v || 'nexus的ip地址为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的访问端口(port)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.port"
                      :rules="[
                        v => !!v || 'nexus的访问端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-hub代理registry访问端口(portDocker)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portDocker"
                      :rules="[
                        v => !!v || 'nexus的docker-hub代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-quay代理registry访问端口(portQuay)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portQuay"
                      :rules="[
                        v => !!v || 'nexus的docker-quay代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-gcr代理registry访问端口(portGcr)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portGcr"
                      :rules="[
                        v => !!v || 'nexus的docker-gcr代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户账号(username)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.username"
                      :rules="[
                        v => !!v || 'nexus的公共用户账号为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户密码(password)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.password"
                      :rules="[
                        v => !!v || 'nexus的公共用户密码为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户邮箱(email)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.email"
                      :rules="[
                        v => !!v || 'nexus的公共用户邮箱为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <div class="form-item mt-4">
                  <v-select
                    :items="[
                      {text: '本地持久化存储设置', value: 'pvConfigLocal'},
                      {text: 'cephfs持久化存储设置', value: 'pvConfigCephfs'},
                      {text: 'nfs持久化存储设置', value: 'pvConfigNfs'},
                    ]"
                    label="kubernetes持久化存储设置*"
                    @change="chooseParams($event)"
                    required
                    :value="paramValue()"
                    dense
                    hint="四选一"
                    persistent-hint
                    :rules="[
                      v => !!v || 'kubernetes持久化存储设置为必填项',
                    ]"
                  />
                </div>
                <div v-if="formValue.envK8s.localFlag">
                  <small>本地持久化存储设置(pvConfigLocal)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用本地存储情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-100 mt-4">
                      <v-text-field
                        label="本地存储绝对路径(localPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigLocal.localPath"
                        :rules="[
                          v => !!v || '本地存储绝对路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
                <div v-if="formValue.envK8s.cephfsFlag">
                  <small>cephfs持久化存储设置(pvConfigCephfs)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用cephfs情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs账号(cephUser)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephUser"
                        :rules="[
                          v => !!v || 'cephfs账号为必填项',
                        ]"
                      />
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs秘钥(cephSecret)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephSecret"
                        :rules="[
                          v => !!v || 'cephfs秘钥为必填项',
                        ]"
                      />
                    </div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4 d-flex align-center">
                      <v-combobox
                        label="cephfs所有monitor地址与端口(cephMonitors)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephMonitors"
                        multiple
                        small-chips
                        hide-selected
                        append-icon=""
                        :rules="[
                          v => !!v || 'cephfs所有monitor地址与端口为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>例如: 192.168.60.43:6789</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs存储路径(cephPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephPath"
                        :rules="[
                          v => !!v || 'cephfs存储路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
                <div v-if="formValue.envK8s.nfsFlag">
                  <small>nfs持久化存储设置(pvConfigNfs)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用nfs情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="nfs服务器地址(nfsServer)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigNfs.nfsServer"
                        :rules="[
                          v => !!v || 'nfs服务器地址为必填项',
                        ]"
                      />
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="nfs存储路径(nfsPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigNfs.nfsPath"
                        :rules="[
                          v => !!v || 'nfs存储路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目应用部署选择器(projectNodeSelector)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>项目的deployment选择部署在什么标签的节点上</div>
                  </div>
                </v-tooltip>
                <v-icon color="success" class="ml-4" @click="addprojectNodeSelector()">mdi-table-plus</v-icon>
                <div class="d-flex justify-space-between mt-4" v-for="(row, i) in formValue.envK8s.projectNodeSelector" :key="i">
                  <div class="form-item-45">
                    <v-text-field
                      label="标签名(labelName)*"
                      dense
                      v-model="row[0]"
                      :rules="[
                        v => !!v || '标签名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="标签值(labelValue)*"
                      dense
                      v-model="row[1]"
                      :rules="[
                        v => !!v || '标签值为必填项',
                      ]"
                    />
                  </div>
                  <div>
                    <v-icon color="success" class="mr-4" @click="copyprojectNodeSelector(i)">mdi-content-copy</v-icon>
                    <v-icon color="error" @click="deleteprojectNodeSelector(i)" v-if="formValue.envK8s.projectNodeSelector.length > 1">mdi-trash-can-outline</v-icon>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目资源配额设置(limitConfig)</small>
                <div class="mt-4">
                  <small>默认每个Pod的资源配额限制(containerLimit)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>如果应用部署的时候，没有指定资源配额，则按照这个默认设置分配资源配额</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的请求内存资源设置(memoryRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.memoryRequest"
                        :rules="[
                          v => !!v || '默认每个Pod的请求内存资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的请求cpu资源设置(cpuRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.cpuRequest"
                        :rules="[
                          v => !!v || '默认每个Pod的请求cpu资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的最大内存资源设置(memoryLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.memoryLimit"
                        :rules="[
                          v => !!v || '默认每个Pod的最大内存资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的最大cpu资源设置(cpuLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.cpuLimit"
                        :rules="[
                          v => !!v || '默认每个Pod的最大cpu资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <small>整个项目的容器云资源配额限制(namespaceLimit)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>整个项目名字空间，所有应用可以使用的资源配额总量，超过这个总量将无法发布应用</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的请求内存资源总和设置(memoryRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.memoryRequest"
                        :rules="[
                          v => !!v || '整个项目所有Pod的请求内存资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的请求cpu资源总和设置(cpuRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.cpuRequest"
                        :rules="[
                          v => !!v || '整个项目所有Pod的请求cpu资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的最大内存资源总和设置(memoryLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.memoryLimit"
                        :rules="[
                          v => !!v || '整个项目所有Pod的最大内存资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的最大cpu资源总和设置(cpuLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.cpuLimit"
                        :rules="[
                          v => !!v || '整个项目所有Pod的最大cpu资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的数量总和设置(podsLimit)*"
                        required
                        dense
                        type="number"
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.podsLimit"
                        :rules="[
                          v => v > 0 || '整个项目所有Pod的数量总和设置为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </template>
        <template v-slot:updateEnv v-if="operationCardConfig.attrs.formEls.includes('updateEnv')">
          <v-form ref="envRef">
            <div class="env-wrap">
              <div class="d-flex justify-space-between">
                <div class="form-item-100">
                  <v-text-field
                    label="kubernetes环境描述(envDesc)*"
                    required
                    dense
                    v-model="formValue.envK8s.envDesc"
                    :rules="[
                      v => !!v || '请输入环境描述',
                    ]"
                    hint="用于显示在流水线上的环境名称"
                    persistent-hint
                  />
                </div>
              </div>
              <div class="params-item mt-4">
                <small>kubernetes环境参数</small>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver地址(host)*"
                      required
                      dense
                      v-model="formValue.envK8s.host"
                      :rules="[
                        v => !!v || 'apiserver地址为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver地址</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver端口(port)*"
                      required
                      dense
                      v-model="formValue.envK8s.port"
                      type="number"
                      :rules="[
                        v => !!v || 'apiserver端口为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver端口</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="apiserver的token(token)*"
                      required
                      dense
                      v-model="formValue.envK8s.token"
                      :rules="[
                        v => !!v || 'apiserver的token为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>kubernetes环境的apiserver的token</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目数据Pod设置(projectDataPod)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>该kubernetes pod可以访问默认持久化的根目录，用于通过该pod给各个项目名字空间发送初始化文件</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod所在名字空间(namespace)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.namespace"
                      :rules="[
                        v => !!v || 'pod所在名字空间为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod的名字(pod)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.pod"
                      :rules="[
                        v => !!v || 'pod的名字为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="pod中项目共享目录的根路径(path)*"
                      required
                      dense
                      v-model="formValue.envK8s.projectDataPod.path"
                      :rules="[
                        v => !!v || 'pod中项目共享目录的根路径为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>该路径挂装了所有项目名字空间的共享存储的根路径</div>
                      </div>
                    </v-tooltip>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>harbor配置(harborConfig)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于kubernetes集群拉取harbor镜像</div>
                    <div>注意，需要设置kubernetes集群的harbor相关证书</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的访问主机名(hostname)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.hostname"
                      :rules="[
                        v => !!v || 'harbor的访问主机名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的IP地址(ip)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.ip"
                      :rules="[
                        v => !!v || 'harbor的IP地址为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的端口(port)*"
                      required
                      dense
                      type="number"
                      v-model="formValue.envK8s.harborConfig.port"
                      :rules="[
                        v => !!v || 'harbor的端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员用户名(username)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.username"
                      :rules="[
                        v => !!v || 'harbor的管理员用户名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员密码(password)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.password"
                      :rules="[
                        v => !!v || 'harbor的管理员密码为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="harbor的管理员邮箱(email)*"
                      required
                      dense
                      v-model="formValue.envK8s.harborConfig.email"
                      :rules="[
                        v => !!v || 'harbor的管理员邮箱为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>nexus配置(nexusConfig)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>用于kubernetes集群拉取的debug容器yum源设置和docker proxy设置</div>
                    <div>注意，需要设置kubernetes集群的insecure-registry</div>
                  </div>
                </v-tooltip>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus主机名(hostname)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.hostname"
                      :rules="[
                        v => !!v || 'nexus主机名为必填项',
                      ]"
                    />
                    <v-tooltip right max-width="300px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                      </template>
                      <div style="font-size: 12px;">
                        <div>可以使用ip地址</div>
                      </div>
                    </v-tooltip>
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的ip地址(ip)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.ip"
                      :rules="[
                        v => !!v || 'nexus的ip地址为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的访问端口(port)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.port"
                      :rules="[
                        v => !!v || 'nexus的访问端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-hub代理registry访问端口(portDocker)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portDocker"
                      :rules="[
                        v => !!v || 'nexus的docker-hub代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-quay代理registry访问端口(portQuay)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portQuay"
                      :rules="[
                        v => !!v || 'nexus的docker-quay代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的docker-gcr代理registry访问端口(portGcr)*"
                      required
                      dense
                      type="numebr"
                      v-model="formValue.envK8s.nexusConfig.portGcr"
                      :rules="[
                        v => !!v || 'nexus的docker-gcr代理registry访问端口为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-4">
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户账号(username)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.username"
                      :rules="[
                        v => !!v || 'nexus的公共用户账号为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户密码(password)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.password"
                      :rules="[
                        v => !!v || 'nexus的公共用户密码为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item d-flex align-center">
                    <v-text-field
                      label="nexus的公共用户邮箱(email)*"
                      required
                      dense
                      v-model="formValue.envK8s.nexusConfig.email"
                      :rules="[
                        v => !!v || 'nexus的公共用户邮箱为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <div class="form-item mt-4">
                  <v-select
                    :items="[
                      {text: '本地持久化存储设置', value: 'pvConfigLocal'},
                      {text: 'cephfs持久化存储设置', value: 'pvConfigCephfs'},
                      {text: 'nfs持久化存储设置', value: 'pvConfigNfs'},
                    ]"
                    label="kubernetes持久化存储设置*"
                    @change="chooseParams($event)"
                    required
                    :value="paramValue()"
                    dense
                    hint="四选一"
                    persistent-hint
                    :rules="[
                      v => !!v || 'kubernetes持久化存储设置为必填项',
                    ]"
                  />
                </div>
                <div v-if="formValue.envK8s.localFlag">
                  <small>本地持久化存储设置(pvConfigLocal)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用本地存储情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-100 mt-4">
                      <v-text-field
                        label="本地存储绝对路径(localPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigLocal.localPath"
                        :rules="[
                          v => !!v || '本地存储绝对路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
                <div v-if="formValue.envK8s.cephfsFlag">
                  <small>cephfs持久化存储设置(pvConfigCephfs)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用cephfs情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs账号(cephUser)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephUser"
                        :rules="[
                          v => !!v || 'cephfs账号为必填项',
                        ]"
                      />
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs秘钥(cephSecret)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephSecret"
                        :rules="[
                          v => !!v || 'cephfs秘钥为必填项',
                        ]"
                      />
                    </div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4 d-flex align-center">
                      <v-combobox
                        label="cephfs所有monitor地址与端口(cephMonitors)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephMonitors"
                        multiple
                        small-chips
                        hide-selected
                        append-icon=""
                        :rules="[
                          v => !!v || 'cephfs所有monitor地址与端口为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>例如: 192.168.60.43:6789</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="cephfs存储路径(cephPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigCephfs.cephPath"
                        :rules="[
                          v => !!v || 'cephfs存储路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
                <div v-if="formValue.envK8s.nfsFlag">
                  <small>nfs持久化存储设置(pvConfigNfs)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>假如持久化存储使用nfs情况下请设置</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between">
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="nfs服务器地址(nfsServer)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigNfs.nfsServer"
                        :rules="[
                          v => !!v || 'nfs服务器地址为必填项',
                        ]"
                      />
                    </div>
                    <div class="form-item-45 mt-4">
                      <v-text-field
                        label="nfs存储路径(nfsPath)*"
                        required
                        dense
                        v-model="formValue.envK8s.pvConfigNfs.nfsPath"
                        :rules="[
                          v => !!v || 'nfs存储路径为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目应用部署选择器(projectNodeSelector)</small>
                <v-tooltip right max-width="300px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                  </template>
                  <div style="font-size: 12px;">
                    <div>项目的deployment选择部署在什么标签的节点上</div>
                  </div>
                </v-tooltip>
                <v-icon color="success" class="ml-4" @click="addprojectNodeSelector()">mdi-table-plus</v-icon>
                <div class="d-flex justify-space-between mt-4" v-for="(row, i) in formValue.envK8s.projectNodeSelector" :key="i">
                  <div class="form-item-45">
                    <v-text-field
                      label="标签名(labelName)*"
                      dense
                      v-model="row[0]"
                      :rules="[
                        v => !!v || '标签名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="标签值(labelValue)*"
                      dense
                      v-model="row[1]"
                      :rules="[
                        v => !!v || '标签值为必填项',
                      ]"
                    />
                  </div>
                  <div>
                    <v-icon color="success" class="mr-4" @click="copyprojectNodeSelector(i)">mdi-content-copy</v-icon>
                    <v-icon color="error" @click="deleteprojectNodeSelector(i)" v-if="formValue.envK8s.projectNodeSelector.length > 1">mdi-trash-can-outline</v-icon>
                  </div>
                </div>
              </div>
              <div class="params-item mt-4">
                <small>项目资源配额设置(limitConfig)</small>
                <div class="mt-4">
                  <small>默认每个Pod的资源配额限制(containerLimit)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>如果应用部署的时候，没有指定资源配额，则按照这个默认设置分配资源配额</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的请求内存资源设置(memoryRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.memoryRequest"
                        :rules="[
                          v => !!v || '默认每个Pod的请求内存资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的请求cpu资源设置(cpuRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.cpuRequest"
                        :rules="[
                          v => !!v || '默认每个Pod的请求cpu资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的最大内存资源设置(memoryLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.memoryLimit"
                        :rules="[
                          v => !!v || '默认每个Pod的最大内存资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="默认每个Pod的最大cpu资源设置(cpuLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.containerLimit.cpuLimit"
                        :rules="[
                          v => !!v || '默认每个Pod的最大cpu资源设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <small>整个项目的容器云资源配额限制(namespaceLimit)</small>
                  <v-tooltip right max-width="300px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                    </template>
                    <div style="font-size: 12px;">
                      <div>整个项目名字空间，所有应用可以使用的资源配额总量，超过这个总量将无法发布应用</div>
                    </div>
                  </v-tooltip>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的请求内存资源总和设置(memoryRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.memoryRequest"
                        :rules="[
                          v => !!v || '整个项目所有Pod的请求内存资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item-45 d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的请求cpu资源总和设置(cpuRequest)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.cpuRequest"
                        :rules="[
                          v => !!v || '整个项目所有Pod的请求cpu资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="d-flex justify-space-between mt-4">
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的最大内存资源总和设置(memoryLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.memoryLimit"
                        :rules="[
                          v => !!v || '整个项目所有Pod的最大内存资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100Mi表示100M内存，1Gi表示1G内存</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的最大cpu资源总和设置(cpuLimit)*"
                        required
                        dense
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.cpuLimit"
                        :rules="[
                          v => !!v || '整个项目所有Pod的最大cpu资源总和设置为必填项',
                        ]"
                      />
                      <v-tooltip right max-width="300px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small class="ml-2 diy-icon" v-bind="attrs" v-on="on">mdi-progress-question</v-icon>
                        </template>
                        <div style="font-size: 12px;">
                          <div>100m表示0.1，表示0.1个CPU</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div class="form-item d-flex align-center">
                      <v-text-field
                        label="整个项目所有Pod的数量总和设置(podsLimit)*"
                        required
                        dense
                        type="number"
                        v-model="formValue.envK8s.limitConfig.namespaceLimit.podsLimit"
                        :rules="[
                          v => v > 0 || '整个项目所有Pod的数量总和设置为必填项',
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </template>
        <template v-slot:addPV v-if="operationCardConfig.attrs.formEls.includes('addPV')">
          <v-form ref="pvRef">
            <div class="pv-wrap">
              <div class="d-flex justify-space-between">
                <div class="form-item-45">
                  <v-text-field
                    label="PV名字(pvName)*"
                    required
                    dense
                    v-model="formValue.pvName"
                    :rules="[
                      v => !!v || '请输入PV名字',
                    ]"
                    hint="例如：test-project1-local-pv，必须以-pv结尾"
                    persistent-hint
                  />
                </div>
                <div class="form-item-45">
                  <v-text-field
                    label="PV描述(pvDesc)*"
                    required
                    dense
                    v-model="formValue.pvDesc"
                    :rules="[
                      v => !!v || '请输入PV描述',
                    ]"
                  />
                </div>
              </div>
            </div>
            <div class="form-item mt-4">
              <v-select
                :items="[ true, false ]"
                label="是否只读(readOnly)"
                v-model="formValue.pvDefYaml.readOnly"
                dense
              />
            </div>
            <div class="params-item">
              <div class="form-item mt-4">
                <v-select
                  :items="[
                    { text: '挂装本地文件作为持久化卷', value: 'hostPath' },
                    { text: '挂装cephfs作为持久化卷', value: 'cephfs' },
                    { text: '挂装rbd作为持久化卷', value: 'rbd' },
                    { text: '挂装glusterfs作为持久化卷', value: 'glusterfs' },
                    { text: '挂装nfs作为持久化卷', value: 'nfs' },
                  ]"
                  label="选择配置"
                  hint="配置 hostPath cephfs glusterfs nfs rbd 能且只能选其一"
                  persistent-hint
                  dense
                  :value="pvValue()"
                  @change="pvChange($event)"
                />
              </div>
              <div class="mt-4" v-if="formValue.pvDefYaml.hostPathFlag">
                <small>挂装本地文件作为持久化卷(hostPath)</small>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item-100">
                    <v-text-field
                      label="挂装的本地存储的绝对路径(path)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.hostPath.path"
                      :rules="[
                        v => !!v || '挂装的本地存储的绝对路径为必填项',
                      ]"
                      hint="例如: /xxx"
                      persistent-hint
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4" v-if="formValue.pvDefYaml.cephfsFlag">
                <small>挂装cephfs作为持久化卷(cephfs)</small>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item-100">
                    <v-combobox
                      label="cephfs的monitor地址(monitors)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.cephfs.monitors"
                      multiple
                      small-chips
                      hide-selected
                      append-icon=""
                      :rules="[
                        v => v.length > 0 || 'cephfs的monitor地址为必填项',
                      ]"
                      hint="例如: 192.168.0.1:6789"
                      persistent-hint
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item">
                    <v-text-field
                      label="cephfs的访问密钥(keyring)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.cephfs.keyring"
                      :rules="[
                        v => !!v || 'cephfs的访问密钥为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-text-field
                      label="cephfs的访问用户名(user)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.cephfs.user"
                      :rules="[
                        v => !!v || 'cephfs的访问用户名为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-text-field
                      label="挂装cephfs中的绝对路径(path)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.cephfs.path"
                      :rules="[
                        v => !!v || '挂装cephfs中的绝对路径为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4" v-if="formValue.pvDefYaml.rbdFlag">
                <small>挂装rbd作为持久化卷(rbd)</small>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item-100">
                    <v-combobox
                      label="rbd的monitor地址(monitors)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.monitors"
                      multiple
                      small-chips
                      hide-selected
                      append-icon=""
                      :rules="[
                        v => v.length > 0 || 'rbd的monitor地址为必填项',
                      ]"
                      hint="例如: 192.168.0.1:6789"
                      persistent-hint
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item-45">
                    <v-text-field
                      label="rbd的访问密钥(keyring)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.keyring"
                      :rules="[
                        v => !!v || 'rbd的访问密钥为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="rbd的访问用户名(user)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.user"
                      :rules="[
                        v => !!v || 'rbd的访问用户名为必填项',
                      ]"
                    />
                  </div>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item">
                    <v-text-field
                      label="rbd的镜像名称(image)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.image"
                      :rules="[
                        v => !!v || 'rbd的镜像名称为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-text-field
                      label="rbd的pool名称(pool)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.pool"
                      :rules="[
                        v => !!v || 'rbd的pool名称为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-select
                      :items="[ 'ext4', 'xfs' ]"
                      label="映射的文件系统类型(fsType)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.rbd.fsType"
                      :rules="[
                        v => !!v || '映射的文件系统类型为必填项',
                      ]"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4" v-if="formValue.pvDefYaml.glusterfsFlag">
                <small>挂装glusterfs作为持久化卷(glusterfs)</small>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item">
                    <v-combobox
                      label="glusterfs的访问ip地址(endpointIPs)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.glusterfs.endpointIPs"
                      multiple
                      small-chips
                      hide-selected
                      append-icon=""
                      :rules="[
                        v => !!v || 'glusterfs的访问ip地址为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-text-field
                      label="glusterfs的访问端口(endpointPort)*"
                      required
                      dense
                      type="number"
                      v-model="formValue.pvDefYaml.glusterfs.endpointPort"
                      :rules="[
                        v => v > 0 || 'glusterfs的访问端口为必填项',
                      ]"
                    />
                  </div>
                  <div class="form-item">
                    <v-text-field
                      label="挂装glusterfs中的路径(path)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.glusterfs.path"
                      :rules="[
                        v => !!v || '挂装glusterfs中的路径为必填项',
                      ]"
                      hint="例如: glusterfs_vol"
                      persistent-hint
                    />
                  </div>
                </div>
              </div>
              <div class="mt-4" v-if="formValue.pvDefYaml.nfsFlag">
                <small>挂装nfs作为持久化卷(nfs)</small>
                <div class="d-flex justify-space-between mt-2">
                  <div class="form-item-45">
                    <v-text-field
                      label="nfs的服务器地址(server)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.nfs.server"
                      :rules="[
                        v => !!v || 'nfs的服务器地址为必填项',
                      ]"
                      hint="例如: 192.168.0.1"
                      persistent-hint
                    />
                  </div>
                  <div class="form-item-45">
                    <v-text-field
                      label="挂装的nfs的绝对路径(path)*"
                      required
                      dense
                      v-model="formValue.pvDefYaml.nfs.path"
                      :rules="[
                        v => !!v || '挂装的nfs的绝对路径为必填项',
                      ]"
                      hint="例如: /xxx"
                      persistent-hint
                    />
                  </div>
                </div>
              </div>
            </div>
          </v-form>
        </template>
      </OperationCard>
    </v-dialog>
    <v-dialog
      v-model="logDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">查看详情</span>
        </v-card-title>
        <v-card-text id='log-container' style="overflow-x: scroll; background: #151515; color: #e0e0e0; position: relative; height: 300px;">
            <pre
              v-for="(logMsg, i) in logCardConfig.attrs.logList"
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
            @click="(logCardConfig.listeners.confirm || (() => {}))"
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
              this.$observables.queryPage$.next('refresh')
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
import Vue from 'vue'
import PageCard from '@/lib/ui-lib/page-templates/PageCard'
import Operations from '@/lib/ui-lib/components/Operations'
import ENV_API from '@/api/admin/env'
import { catchError, mergeMap, tap, withLatestFrom, filter, map, pluck, finalize, scan, switchMap, take, exhaustMap, takeUntil } from 'rxjs/operators'
import { defer, of, race, Subject } from 'rxjs'
import { rtnRetryWhenOperator } from '@/utils/request'
import OperationCard from '@/lib/ui-lib/components/OperationCard'
import { webSocket } from 'rxjs/webSocket'
import User from '@/services/user'
import EnvPvsDataTable from '@/components/EnvPvsDataTable'
import YAML from "yamljs";
import request from "@/utils/request";
import Monaco from "@/lib/monaco/Monaco";
export default {
  name: 'Envs',
  components: {
    EnvPvsDataTable,
    OperationCard,
    PageCard,
    Operations,
    Monaco
  },
  inject: ['successTip', 'errorTip', 'warnTip'],
  subscriptions () {
    return {
      queryPage$: new Subject(),
      queryEnvNames$: new Subject(),
      queryPvs$: new Subject(),
      addPvClick$: new Subject(),
      deletePvClick$: new Subject(),
      modifyPvClick$: new Subject(),
      addEnvClick$: new Subject(),
      deleteEnvClick$: new Subject(),
      modifyEnvClick$: new Subject()
    }
  },
  data () {
    return {
      pageRequest: {
        envNames: [],
        page: 1,
        perPage: 10
      },
      pageResponse: {
        data: {
          envK8ss: []
        }
      },
      envNamesResponse: {
        data: {
          envNames: []
        }
      },
      operationDialog: false,
      operationCardConfig: {
        attrs: {
          title: null,
          formEls: [],
          formRef: null,
          formInfo: null,
          confirmLoading: false
        },
        listeners: {
          cancel: null,
          confirm: null
        }
      },
      formValue: {},
      logDialog: false,
      logCardConfig: {
        attrs: {
          logList: []
        },
        listeners: {
          confirm: null
        }
      },
      headers: [
        { text: '环境名称', value: 'envName', sortable: false },
        { text: '环境描述', value: 'envDesc', sortable: false },
        { text: '操作', value: 'handle', sortable: false }
      ],
      YAMLDialog: false,
      yamlText: "",
      userToken: '',
      auditDialog: false,
      logList: [],
      disableBtn: false,
      dialogWidth: '1200px',
      targetEnvName: '',
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
    addprojectNodeSelector() {
      const vm = this;
      var addItem = [];
      if (vm.formValue.envK8s.projectNodeSelector === null) {
        vm.formValue.envK8s.projectNodeSelector = [];
        vm.formValue.envK8s.projectNodeSelector.push(addItem);
      } else {
        vm.formValue.envK8s.projectNodeSelector.push(addItem);
      }
    },
    copyprojectNodeSelector(i) {
      const vm = this
      let copyItem = JSON.parse(JSON.stringify(vm.formValue.envK8s.projectNodeSelector[i]));
      vm.formValue.envK8s.projectNodeSelector.push(copyItem);
    },
    deleteprojectNodeSelector(i) {
      const vm = this
      vm.formValue.envK8s.projectNodeSelector.splice(i, 1)
    },
    chooseParams(e) {
      console.log(e)
      const vm = this
      if(e === 'pvConfigLocal'){
        vm.formValue.envK8s.localFlag = true
        vm.formValue.envK8s.cephfsFlag = false
        vm.formValue.envK8s.glusterfsFlag = false
        vm.formValue.envK8s.nfsFlag = false
      }else if(e === 'pvConfigCephfs'){
        vm.formValue.envK8s.localFlag = false
        vm.formValue.envK8s.cephfsFlag = true
        vm.formValue.envK8s.glusterfsFlag = false
        vm.formValue.envK8s.nfsFlag = false
      }else if(e === 'pvConfigNfs'){
        vm.formValue.envK8s.localFlag = false
        vm.formValue.envK8s.cephfsFlag = false
        vm.formValue.envK8s.glusterfsFlag = false
        vm.formValue.envK8s.nfsFlag = true
      }
      vm.$forceUpdate()
    },
    paramValue() {
      const vm = this
      if(vm.formValue.envK8s.localFlag){
        return 'pvConfigLocal'
      }else if(vm.formValue.envK8s.cephfsFlag){
        return 'pvConfigCephfs'
      }else if(vm.formValue.envK8s.nfsFlag){
        return 'pvConfigNfs'
      }
    },
    previewEnv() {
      const vm = this
      if(vm.$refs.envRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.formValue.envK8s))
        // copyData.pvConfigGlusterfs.endpointPort = Number(copyData.pvConfigGlusterfs.endpointPort)
        if(!copyData.localFlag){
          delete copyData.pvConfigLocal
        }
        if(!copyData.cephfsFlag){
          delete copyData.pvConfigCephfs
        }
        // if(!copyData.glusterfsFlag){
        //   delete copyData.pvConfigGlusterfs
        // }
        if(!copyData.nfsFlag){
          delete copyData.pvConfigNfs
        }
        delete copyData.localFlag
        delete copyData.cephfsFlag
        delete copyData.glusterfsFlag
        delete copyData.nfsFlag
        copyData.port = Number(copyData.port)
        copyData.harborConfig.port = Number(copyData.harborConfig.port)
        copyData.limitConfig.namespaceLimit.podsLimit = Number(copyData.limitConfig.namespaceLimit.podsLimit)
        copyData.nexusConfig.port = Number(copyData.nexusConfig.port)
        copyData.nexusConfig.portDocker = Number(copyData.nexusConfig.portDocker)
        copyData.nexusConfig.portGcr = Number(copyData.nexusConfig.portGcr)
        copyData.nexusConfig.portQuay = Number(copyData.nexusConfig.portQuay)
        var newObj = {}
        copyData.projectNodeSelector.map(item => {
          newObj[item[0]] = item[1]
        })
        copyData.projectNodeSelector = newObj
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true
      }else{
        vm.warnTip(true, '请输入完整信息')
      }
    },
    addEnv() {
      const vm = this
      if(vm.$refs.envRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.formValue.envK8s))
        // copyData.pvConfigGlusterfs.endpointPort = Number(copyData.pvConfigGlusterfs.endpointPort)
        if(!copyData.localFlag){
          delete copyData.pvConfigLocal
        }
        if(!copyData.cephfsFlag){
          delete copyData.pvConfigCephfs
        }
        // if(!copyData.glusterfsFlag){
        //   delete copyData.pvConfigGlusterfs
        // }
        if(!copyData.nfsFlag){
          delete copyData.pvConfigNfs
        }
        delete copyData.localFlag
        delete copyData.cephfsFlag
        delete copyData.glusterfsFlag
        delete copyData.nfsFlag
        copyData.port = Number(copyData.port)
        copyData.harborConfig.port = Number(copyData.harborConfig.port)
        copyData.limitConfig.namespaceLimit.podsLimit = Number(copyData.limitConfig.namespaceLimit.podsLimit)
        copyData.nexusConfig.port = Number(copyData.nexusConfig.port)
        copyData.nexusConfig.portDocker = Number(copyData.nexusConfig.portDocker)
        copyData.nexusConfig.portGcr = Number(copyData.nexusConfig.portGcr)
        copyData.nexusConfig.portQuay = Number(copyData.nexusConfig.portQuay)
        var newObj = {}
        copyData.projectNodeSelector.map(item => {
          newObj[item[0]] = item[1]
        })
        copyData.projectNodeSelector = newObj
        let envK8sYaml = YAML.stringify(copyData, 4)
        request.post('/admin/env', {
          envK8sYaml: envK8sYaml
        }).then(response => {
          vm.operationDialog = false
          vm.showLog(response)
          vm.successTip(true, response.msg);
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入完整信息')
      }
    },
    updateEnv() {
      const vm = this
      if(vm.$refs.envRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.formValue.envK8s))
        // copyData.pvConfigGlusterfs.endpointPort = Number(copyData.pvConfigGlusterfs.endpointPort)
        if(!copyData.localFlag){
          delete copyData.pvConfigLocal
        }
        if(!copyData.cephfsFlag){
          delete copyData.pvConfigCephfs
        }
        // if(!copyData.glusterfsFlag){
        //   delete copyData.pvConfigGlusterfs
        // }
        if(!copyData.nfsFlag){
          delete copyData.pvConfigNfs
        }
        delete copyData.localFlag
        delete copyData.cephfsFlag
        delete copyData.glusterfsFlag
        delete copyData.nfsFlag
        copyData.port = Number(copyData.port)
        copyData.harborConfig.port = Number(copyData.harborConfig.port)
        copyData.limitConfig.namespaceLimit.podsLimit = Number(copyData.limitConfig.namespaceLimit.podsLimit)
        copyData.nexusConfig.port = Number(copyData.nexusConfig.port)
        copyData.nexusConfig.portDocker = Number(copyData.nexusConfig.portDocker)
        copyData.nexusConfig.portGcr = Number(copyData.nexusConfig.portGcr)
        copyData.nexusConfig.portQuay = Number(copyData.nexusConfig.portQuay)
        var newObj = {}
        copyData.projectNodeSelector.map(item => {
          newObj[item[0]] = item[1]
        })
        copyData.projectNodeSelector = newObj
        let envK8sYaml = YAML.stringify(copyData, 4)
        request.post(`/admin/env/${vm.targetEnvName}`, {
          envK8sYaml: envK8sYaml
        }).then(response => {
          vm.operationDialog = false
          vm.showLog(response)
          vm.successTip(true, response.msg);
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入完整信息')
      }
    },
    pvValue() {
      const vm = this
      if(vm.formValue.pvDefYaml.hostPathFlag){
        return 'hostPath'
      }else if(vm.formValue.pvDefYaml.cephfsFlag){
        return 'cephfs'
      }else if(vm.formValue.pvDefYaml.glusterfsFlag){
        return 'glusterfs'
      }else if(vm.formValue.pvDefYaml.nfsFlag){
        return 'nfs'
      }else if(vm.formValue.pvDefYaml.rbdFlag) {
        return 'rbd'
      }else{
        vm.formValue.pvDefYaml.hostPathFlag = true
        return 'hostPath'
      }
    },
    pvChange(e) {
      const vm = this
      if(e === 'hostPath'){
        vm.formValue.pvDefYaml.hostPathFlag = true
        vm.formValue.pvDefYaml.cephfsFlag = false
        vm.formValue.pvDefYaml.glusterfsFlag = false
        vm.formValue.pvDefYaml.nfsFlag = false
        vm.formValue.pvDefYaml.rbdFlag = false
      }else if(e === 'cephfs'){
        vm.formValue.pvDefYaml.hostPathFlag = false
        vm.formValue.pvDefYaml.cephfsFlag = true
        vm.formValue.pvDefYaml.glusterfsFlag = false
        vm.formValue.pvDefYaml.nfsFlag = false
        vm.formValue.pvDefYaml.rbdFlag = false
      }else if(e === 'glusterfs'){
        vm.formValue.pvDefYaml.hostPathFlag = false
        vm.formValue.pvDefYaml.cephfsFlag = false
        vm.formValue.pvDefYaml.glusterfsFlag = true
        vm.formValue.pvDefYaml.nfsFlag = false
        vm.formValue.pvDefYaml.rbdFlag = false
      }else if(e === 'nfs'){
        vm.formValue.pvDefYaml.hostPathFlag = false
        vm.formValue.pvDefYaml.cephfsFlag = false
        vm.formValue.pvDefYaml.glusterfsFlag = false
        vm.formValue.pvDefYaml.nfsFlag = true
        vm.formValue.pvDefYaml.rbdFlag = false
      }else if(e === 'rbd'){
        vm.formValue.pvDefYaml.hostPathFlag = false
        vm.formValue.pvDefYaml.cephfsFlag = false
        vm.formValue.pvDefYaml.glusterfsFlag = false
        vm.formValue.pvDefYaml.nfsFlag = false
        vm.formValue.pvDefYaml.rbdFlag = true
      }
      vm.$forceUpdate()
    },
    previewPV() {
      const vm = this
      if(vm.$refs.pvRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.formValue.pvDefYaml))
        copyData.glusterfs.endpointPort = Number(copyData.glusterfs.endpointPort)
        if(!copyData.hostPathFlag){
          delete copyData.hostPath
        }
        if(!copyData.cephfsFlag){
          delete copyData.cephfs
        }
        if(!copyData.glusterfsFlag){
          delete copyData.glusterfs
        }
        if(!copyData.nfsFlag){
          delete copyData.nfs
        }
        if(!copyData.rbdFlag){
          delete copyData.rbd
        }
        delete copyData.hostPathFlag
        delete copyData.cephfsFlag
        delete copyData.glusterfsFlag
        delete copyData.nfsFlag
        delete copyData.rbdFlag
        vm.yamlText = YAML.stringify(copyData, 4)
        vm.$refs.monaco.monacoEditor.setValue(vm.yamlText)
        vm.YAMLDialog = true
      }else{
        vm.warnTip(true, '请输入完整信息')
      }
    },
    addPV(envName) {
      const vm = this
      if(vm.$refs.pvRef.validate()){
        let copyData = JSON.parse(JSON.stringify(vm.formValue.pvDefYaml))
        copyData.glusterfs.endpointPort = Number(copyData.glusterfs.endpointPort)
        if(!copyData.hostPathFlag){
          delete copyData.hostPath
        }
        if(!copyData.cephfsFlag){
          delete copyData.cephfs
        }
        if(!copyData.glusterfsFlag){
          delete copyData.glusterfs
        }
        if(!copyData.nfsFlag){
          delete copyData.nfs
        }
        if(!copyData.rbdFlag){
          delete copyData.rbd
        }
        delete copyData.hostPathFlag
        delete copyData.cephfsFlag
        delete copyData.glusterfsFlag
        delete copyData.nfsFlag
        delete copyData.rbdFlag
        var pvDefYaml = YAML.stringify(copyData, 4)
        request.post(`/admin/env/${envName}/pvAdd`, {
          pvName: vm.formValue.pvName,
          pvDesc: vm.formValue.pvDesc,
          pvDefYaml: pvDefYaml
        }).then(response => {
          vm.operationDialog = false
          vm.$observables.queryPage$.next('refresh')
          vm.successTip(true, response.msg);
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }else{
        vm.warnTip(true, '请输入完整信息')
      }
    },
    closeYaml() {
      const vm = this;
      vm.$refs.monaco.monacoEditor.setValue('')
      vm.YAMLDialog = false;
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
        vm.ws.onclose = (e) => {
          vm.disableBtn = false
          vm.logList.push({logType: 'END'})
        }
      }
    },
  },
  created () {
    const vm = this
    vm.userToken = JSON.parse(localStorage.getItem('userObj')).userToken
    vm.$observables.queryPvs$.pipe(
      mergeMap(next => {
        const index = next.index
        const envName = next.envName
        return defer(() => { return ENV_API.getEnvPvs(envName) }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            return of(null)
          }),
          withLatestFrom(of(index))
        )
      }),
      filter(next => next[0])
    ).subscribe(next => {
      vm.pageResponse.data.envK8ss[next[1]].pvs = next[0].data.pvs
    })
    vm.$observables.queryPage$.pipe(
      mergeMap(next => {
        return defer(() => {
          return ENV_API.getEnvs(vm.pageRequest)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            return of(null)
          })
        )
      }),
      filter(next => next),
      withLatestFrom(vm.$observables.queryPage$),
      tap(next => {
        next[0].data.envK8ss.forEach((row, index) => {
          row.pvs = []
          row.index = index
        })
        vm.pageResponse = next[0]
        if (next[1] !== 'init') {
          vm.successTip(true, next[0].msg)
        }
      }),
      mergeMap(next => {
        return next[0].data.envK8ss
      }),
      tap(next => {
        vm.$observables.queryPvs$.next(next)
      })
    ).subscribe(next => {
    })
    vm.$observables.queryEnvNames$.pipe(
      mergeMap(next => {
        return defer(() => {
          return ENV_API.getEnvNames()
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            return of(null)
          })
        )
      }),
      filter(next => next)
    ).subscribe(next => {
      vm.envNamesResponse = next
    })
    function clearOperationCard () {
      vm.operationCardConfig.attrs.confirmLoading = false
      vm.operationCardConfig.attrs.title = ''
      vm.operationCardConfig.attrs.formRef = null
      vm.operationCardConfig.attrs.formInfo = ''
      vm.operationCardConfig.attrs.formEls = []
      vm.operationCardConfig.listeners.cancel = null
      vm.operationCardConfig.listeners.confirm = null
    }

    vm.$watchAsObservable('operationDialog').pipe(
      pluck('newValue'),
      filter(next => !next),
      tap(next => {
        clearOperationCard()
      })
    ).subscribe(() => {})
    vm.$observables.addEnvClick$.pipe(
      map(next => {
        return [next, new Subject(), Vue.observable({
          envK8s: {}
        })]
      }),
      tap(next => {
        const formValue = next[2]
        vm.formValue = formValue
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '新增环境'
        vm.operationCardConfig.attrs.formRef = 'addEnvForm'
        vm.operationCardConfig.attrs.formInfo = <v-alert icon="mdi-alert-circle" prominent text type="info">
          <small>新增kubernetes环境，新增环境后可配置项目发布应用到该环境。</small>
        </v-alert>
        ENV_API.getDefaultEnv().then(response => {
          vm.formValue.envK8s = response.data.envK8s
          if(vm.formValue.envK8s.pvConfigLocal.localPath === ''){
            vm.formValue.envK8s.localFlag = false
          }else{
            vm.formValue.envK8s.localFlag = true
          }
          if(vm.formValue.envK8s.pvConfigCephfs.cephMonitors === null && vm.formValue.envK8s.pvConfigCephfs.cephPath === '' && vm.formValue.envK8s.pvConfigCephfs.cephSecret === '' && vm.formValue.envK8s.pvConfigCephfs.cephUser === ''){
            vm.formValue.envK8s.cephfsFlag = false
          }else{
            vm.formValue.envK8s.cephfsFlag = true
          }
          // if(vm.formValue.envK8s.pvConfigGlusterfs.endpointIPs === null && vm.formValue.envK8s.pvConfigGlusterfs.endpointPort === 0 && vm.formValue.envK8s.pvConfigGlusterfs.path === ''){
          //   vm.formValue.envK8s.glusterfsFlag = false
          // }else{
          //   vm.formValue.envK8s.glusterfsFlag = true
          // }
          if(vm.formValue.envK8s.pvConfigNfs.nfsPath === '' && vm.formValue.envK8s.pvConfigNfs.nfsServer === ''){
            vm.formValue.envK8s.nfsFlag = false
          }else{
            vm.formValue.envK8s.nfsFlag = true
          }
          if(vm.formValue.envK8s.projectNodeSelector !== null){
            var projectNodeSelectorList = []
            Object.keys(vm.formValue.envK8s.projectNodeSelector).map(item => {
              let obj = []
              obj[0] = item
              obj[1] = vm.formValue.envK8s.projectNodeSelector[item]
              projectNodeSelectorList.push(obj)
            })
            vm.formValue.envK8s.projectNodeSelector = projectNodeSelectorList
          }
          console.log(vm.formValue.envK8s)
          vm.operationCardConfig.attrs.formEls = ['addEnv']
        })
        vm.operationCardConfig.listeners.top = true
        vm.operationCardConfig.listeners.close = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.preview = () => { vm.previewEnv() }
        vm.operationCardConfig.listeners.update = () => { vm.addEnv() }
        // vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
        // vm.operationCardConfig.listeners.confirm = () => { next[1].next(true) }
        vm.dialogWidth = '1200px'
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1],
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      mergeMap(next => {
        const envConfig = next[2]
        // const envConfig = next[1]
        return defer(() => {
          return ENV_API.createEnv(envConfig)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          })
        )
      }),
      filter(next => next),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.successTip(true, next.msg)
      }),
      tap(next => {
        vm.logDialog = true
        vm.logCardConfig.listeners.confirm = () => { vm.logDialog = false }
      }),
      switchMap(next => {
        return webSocket(`${vm.GLOBAL}/ws/log/audit/admin/${next.data.auditID}?x-user-token=${User.getInstance().state.userObj.userToken}`).pipe(
          catchError(error => {
            console.log(error)
            return of(null)
          }),
          finalize(() => {
            console.log('final')
          }),
          filter(next => next),
          takeUntil(vm.$watchAsObservable('logDialog').pipe(
            pluck('newValue'),
            filter(next => next === false),
            take(1)
          )),
          scan((acc, next) => {
            acc.push(next)
            return acc
          }, []),
          tap(next => {
            vm.logCardConfig.attrs.logList = next
          })
        )
      }),
      switchMap(next => {
        return vm.$watchAsObservable('logDialog').pipe(
          pluck('newValue'),
          filter(next => next === false),
          take(1)
        )
      }),
      tap(next => {
        vm.logCardConfig.attrs.logList = []
        vm.$observables.queryPage$.next('envAdd')
      })
    ).subscribe(next => {})

    vm.$observables.deleteEnvClick$.pipe(
      map(next => {
        return [next, new Subject(), Vue.observable({
          envName: ''
        })]
      }),
      tap(next => {
        const formValue = next[2]
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '删除环境'
        vm.operationCardConfig.attrs.formRef = 'deleteEnvForm'
        vm.operationCardConfig.attrs.formInfo = <v-alert icon="mdi-alert-circle" prominent text type="error">
          <small>删除环境后项目将无法发布应用到该环境。<v-chip small color="red">危险操作，请输入环境名。</v-chip></small>
        </v-alert>
        vm.operationCardConfig.attrs.formEls = [
          <v-text-field
            label="环境名（envName）*"
            required
            dense
            vModel={formValue.envName}
            rules={[
              v => !!v || '请输入环境名称',
              v => v === next[0].envName || '请输入正确的环境名称'
            ]}
            hint={`确认要删除环境${next[0].envName}吗？`}
            persistent-hint
          />
        ]
        vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.confirm = () => { next[1].next(true) }
        vm.dialogWidth = '600px'
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1].pipe(
            map(confirm => {
              return vm.$refs.deleteEnvForm.validate()
            })
          ),
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      exhaustMap(next => {
        return defer(() => {
          return ENV_API.deleteEnv(next[1].envName)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          })
        )
      }),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.successTip(true, next.msg)
        vm.$observables.queryPage$.next('envDelete')
      })
    ).subscribe(next => {})
    vm.$observables.modifyEnvClick$.pipe(
      map(next => {
        vm.targetEnvName = next.envName
        return [next, new Subject(), Vue.observable({
          envK8s: next
        })]
      }),
      tap(next => {
        const formValue = next[2]
        vm.formValue = formValue
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '修改环境'
        vm.operationCardConfig.attrs.formRef = 'modifyEnvForm'
        vm.operationCardConfig.attrs.formInfo = ''
        if(vm.formValue.envK8s.pvConfigLocal.localPath === ''){
          vm.formValue.envK8s.localFlag = false
        }else{
          vm.formValue.envK8s.localFlag = true
        }
        if(vm.formValue.envK8s.pvConfigCephfs.cephMonitors instanceof Array){
          if(vm.formValue.envK8s.pvConfigCephfs.cephMonitors.length === 0 && vm.formValue.envK8s.pvConfigCephfs.cephPath === '' && vm.formValue.envK8s.pvConfigCephfs.cephSecret === '' && vm.formValue.envK8s.pvConfigCephfs.cephUser === ''){
            vm.formValue.envK8s.cephfsFlag = false
          }else{
            vm.formValue.envK8s.cephfsFlag = true
          }
        }else{
          if(vm.formValue.envK8s.pvConfigCephfs.cephMonitors === null && vm.formValue.envK8s.pvConfigCephfs.cephPath === '' && vm.formValue.envK8s.pvConfigCephfs.cephSecret === '' && vm.formValue.envK8s.pvConfigCephfs.cephUser === ''){
            vm.formValue.envK8s.cephfsFlag = false
          }else{
            vm.formValue.envK8s.cephfsFlag = true
          }
        }
        // if(vm.formValue.envK8s.pvConfigGlusterfs.endpointIPs === null && vm.formValue.envK8s.pvConfigGlusterfs.endpointPort === 0 && vm.formValue.envK8s.pvConfigGlusterfs.path === ''){
        //   vm.formValue.envK8s.glusterfsFlag = false
        // }else{
        //   vm.formValue.envK8s.glusterfsFlag = true
        // }
        if(vm.formValue.envK8s.pvConfigNfs.nfsPath === '' && vm.formValue.envK8s.pvConfigNfs.nfsServer === ''){
          vm.formValue.envK8s.nfsFlag = false
        }else{
          vm.formValue.envK8s.nfsFlag = true
        }
        if(vm.formValue.envK8s.projectNodeSelector !== null){
          var projectNodeSelectorList = []
          Object.keys(vm.formValue.envK8s.projectNodeSelector).map(item => {
            let obj = []
            obj[0] = item
            obj[1] = vm.formValue.envK8s.projectNodeSelector[item]
            projectNodeSelectorList.push(obj)
          })
          vm.formValue.envK8s.projectNodeSelector = projectNodeSelectorList
        }
        console.log(vm.formValue.envK8s)
        vm.operationCardConfig.attrs.formEls = ['updateEnv']
        vm.operationCardConfig.listeners.top = true
        vm.operationCardConfig.listeners.close = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.preview = () => { vm.previewEnv() }
        vm.operationCardConfig.listeners.update = () => { vm.updateEnv() }
        vm.dialogWidth = '1200px'
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1],
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      mergeMap(next => {
        const envConfig = next[2]
        // const envConfig = next[1]
        return defer(() => {
          return ENV_API.modifyEnv(next[1].envName, envConfig)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          })
        )
      }),
      filter(next => next),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.successTip(true, next.msg)
      }),
      tap(next => {
        vm.logDialog = true
        vm.logCardConfig.listeners.confirm = () => { vm.logDialog = false }
      }),
      switchMap(next => {
        return webSocket(`${vm.GLOBAL}/ws/log/audit/admin/${next.data.auditID}?x-user-token=${User.getInstance().state.userObj.userToken}`).pipe(
          catchError(error => {
            console.log(error)
            return of(null)
          }),
          finalize(() => {
            console.log('final')
          }),
          filter(next => next),
          takeUntil(vm.$watchAsObservable('logDialog').pipe(
            pluck('newValue'),
            filter(next => next === false),
            take(1)
          )),
          scan((acc, next) => {
            acc.push(next)
            return acc
          }, []),
          tap(next => {
            vm.logCardConfig.attrs.logList = next
          })
        )
      }),
      switchMap(next => {
        return vm.$watchAsObservable('logDialog').pipe(
          pluck('newValue'),
          filter(next => next === false),
          take(1)
        )
      }),
      tap(next => {
        vm.logCardConfig.attrs.logList = []
        vm.$observables.queryPage$.next('envModify')
      })
    ).subscribe(() => {})
    vm.$observables.addPvClick$.pipe(
      map(next => {
        return [next, new Subject(), Vue.observable({
          pvName: '',
          pvDesc: '',
          pvDefYaml: {
            readOnly: false,
            hostPath: {
              path: ''
            },
            cephfs: {
              monitors: [],
              keyring: '',
              user: '',
              path: '/'
            },
            rbd: {
              monitors: [],
              keyring: '',
              user: '',
              pool: '',
              image: '',
              fsType: 'ext4',
            },
            glusterfs: {
              endpointIPs: [],
              endpointPort: 0,
              path: ''
            },
            nfs: {
              server: '',
              path: ''
            }
          }
        })]
      }),
      tap(next => {
        const envName = next[0].envName
        const formValue = next[2]
        vm.formValue = formValue
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '新增环境的持久化卷PV'
        vm.operationCardConfig.attrs.formRef = 'addPvForm'
        vm.operationCardConfig.attrs.formInfo = <v-alert icon="mdi-alert-circle" prominent text type="info">
          <small>在kubernetes环境下新增持久化卷PV，新增PV后可以配置项目使用该持久化卷PV</small>
        </v-alert>
        vm.operationCardConfig.attrs.formEls = ['addPV']
        vm.operationCardConfig.listeners.top = true
        vm.operationCardConfig.listeners.close = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.preview = () => { vm.previewPV() }
        vm.operationCardConfig.listeners.update = () => { vm.addPV(envName) }
        vm.dialogWidth = '1200px'
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1],
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      mergeMap(next => {
        const pvConfig = next[2]
        const envConfig = next[1]
        return defer(() => {
          return ENV_API.createPv(envConfig.envName, pvConfig)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          }),
          withLatestFrom(of(envConfig))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.$observables.queryPvs$.next(next[1])
        vm.successTip(true, next[0].msg)
      })
    ).subscribe(next => {})
    vm.$observables.modifyPvClick$.pipe(
      map(next => {
        return [next, new Subject(), Vue.observable({
          pvDesc: next.pvItem.pvDesc
        })]
      }),
      tap(next => {
        const formValue = next[2]
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '修改PV'
        vm.operationCardConfig.attrs.formRef = 'modifyPvForm'
        vm.operationCardConfig.attrs.formInfo = '*为必填字段'
        vm.operationCardConfig.attrs.formEls = [
          <v-text-field
            required
            dense
            label="PV描述*"
            vModel={formValue.pvDesc}
          />
        ]
        vm.operationCardConfig.listeners.top = false
        vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.confirm = () => { next[1].next(true) }
        vm.dialogWidth = '600px'
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1],
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      mergeMap(next => {
        const pvConfig = next[2]
        pvConfig.pvName = next[1].pvItem.pvName
        // const envConfig = next[1]
        return defer(() => {
          return ENV_API.modifyPv(next[1].pvItem.envName, pvConfig)
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          }),
          withLatestFrom(of(next[1]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.successTip(true, next[0].msg)
      }),
      tap(next => {
        vm.$observables.queryPvs$.next(next[1].envItem)
      })
    ).subscribe(() => {})
    vm.$observables.deletePvClick$.pipe(
      map(next => {
        return [next, new Subject(), Vue.observable({
          pvName: ''
        })]
      }),
      tap(next => {
        const formValue = next[2]
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.operationCardConfig.attrs.title = '删除PV'
        vm.operationCardConfig.attrs.formRef = 'deletePvForm'
        vm.operationCardConfig.attrs.formInfo = <v-alert icon="mdi-alert-circle" prominent text type="error">
          <small>在kubernetes环境下删除持久化卷PV。<v-chip small color="red">危险操作，请输入持久化卷的名字。</v-chip></small>
        </v-alert>
        vm.operationCardConfig.attrs.formEls = [
          <v-text-field
            label="持久化卷PV名字（pvName）*"
            required
            dense
            vModel={formValue.pvName}
            rules={[
              v => !!v || '请输入PV名称',
              v => v === next[0].pvName || '请输入正确的PV名称'
            ]}
            hint={`确认要删除环境${next[0].envName}下的持久化卷${next[0].pvName}吗？`}
            persistent-hint
          />
        ]
        vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
        vm.operationCardConfig.listeners.confirm = () => { next[1].next(true) }
        vm.operationDialog = true
      }),
      mergeMap(next => {
        return race([
          next[1].pipe(
            map(confirm => {
              return vm.$refs.deletePvForm.validate()
            })
          ),
          vm.$watchAsObservable('operationDialog').pipe(
            pluck('newValue'),
            filter(next => !next)
          )
        ]).pipe(
          withLatestFrom(of(next[0]), of(next[2]))
        )
      }),
      filter(next => next[0]),
      tap(next => {
        vm.operationCardConfig.listeners.cancel = null
        vm.operationCardConfig.attrs.confirmLoading = true
      }),
      exhaustMap(next => {
        return defer(() => {
          return ENV_API.deletePv(next[1].envName, { pvName: next[1].pvName })
        }).pipe(
          rtnRetryWhenOperator(),
          catchError(next => {
            vm.operationCardConfig.listeners.cancel = () => { vm.operationDialog = false }
            vm.operationCardConfig.attrs.confirmLoading = false
            vm.errorTip(true, next.response.data.msg)
            return of(null)
          })
        )
      }),
      filter(next => next),
      tap(next => {
        vm.operationDialog = false
        vm.operationCardConfig.attrs.confirmLoading = false
        vm.successTip(true, next.msg)

        vm.$observables.queryPage$.next('pvDelete')
      })
    ).subscribe(next => {})
    vm.$observables.queryPage$.next('init')
    vm.$observables.queryEnvNames$.next('init')
  },
  filters: {
    changeColor: function (value) {
      if (value === 'FAIL') {
        return { color: 'red' }
      } else if (value === 'INFO') {
        return { color: 'green' }
      } else {
        return null
      }
    }
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
