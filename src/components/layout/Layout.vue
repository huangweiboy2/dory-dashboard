<template>
  <v-app>
    <v-app-bar
      app
      color="#01579B"
      dark
      clipped-left
    >
      <div class="d-flex align-center mr-8" style="background-color: rgba(256, 256, 256, 0.15); padding: 8px; border-radius: 200px">
        <img style="height: 40px" src="~@/assets/icons/dory3.0.svg" />
      </div>
      <div class="d-flex align-center mr-8">
          <span style="font-size: 26px">DORY-CORE</span>
      </div>
      <v-spacer />
      <NavMenu :menu-data="menuService.state.topMenu.filter(menu => {
       if(userService.state.userObj.isAdmin !== null && userService.state.userObj.isAdmin) {
         return true
       } else {
         return menu.key !== 'admin'
       }
      })" :prop="{
        key: 'key',
        children: 'nodes',
        text: 'name'
      }" menu-type="horizontal"/>
    </v-app-bar>
    <v-navigation-drawer
      app
      clipped
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
    >
      <v-list-item class="pa-2">
        <v-list-item-avatar>
          <v-img :src="userInformation.avatar"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>{{ userInformation.name }}</v-list-item-title>

        <v-btn
          icon
          @click.stop="mini = !mini"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>
      <NavMenu :menu-data="menuService.state.leftMenu[leftNodesIndex].nodes.filter(item => {
        if(userService.state.userObj.isAdmin !== null && userService.state.userObj.isAdmin) {
          return true
        } else {
          return item.key !== 'auditLogs'
        }
      })" :prop="{
        key: 'key',
        children: 'nodes',
        text: 'name'
      }"/>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <v-snackbar :timeout="-1" top color="error" v-model="residentSnackbar.show">
          <v-row class="align-center">
            <v-col class="grow">登录信息失效,请重新登录</v-col>
            <v-btn text :to="'/login?redirect=' + $route.fullPath">确定</v-btn>
          </v-row>
        </v-snackbar>
        <v-slide-x-reverse-transition mode="out-in">
          <router-view :key="$route.fullPath" mode="out-in"/>
        </v-slide-x-reverse-transition>
      </v-container>
    </v-main>
    <v-dialog
      v-model="dialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">修改密码</span>
        </v-card-title>
        <v-card-text>
          <small>*为必填字段</small>
          <v-form ref="passwordRef">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="旧密码（oldPassword）*"
                    :type="oldPasswordDisplay ? 'text' : 'password'"
                    v-model="passwordForm.oldPassword"
                    :append-icon="oldPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="oldPasswordDisplay = !oldPasswordDisplay"
                    :rules="[v => !!v || '旧密码为必填项']"
                    required
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="新密码（newPassword）*"
                    :type="newPasswordDisplay ? 'text' : 'password'"
                    v-model="passwordForm.newPassword"
                    :append-icon="newPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="newPasswordDisplay = !newPasswordDisplay"
                    :rules="[v => !!v || '新密码为必填项']"
                    required
                    dense
                    hint="密码长度不能小于8位，必须包含大小写英文数字和特殊字符"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="确认密码（confirmPassword）*"
                    :type="confirmPasswordDisplay ? 'text' : 'password'"
                    v-model="passwordForm.confirmPassword"
                    :append-icon="confirmPasswordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="confirmPasswordDisplay = !confirmPasswordDisplay"
                    :rules="[v => !!v || '确认密码为必填项']"
                    required
                    dense
                    hint="必须跟新密码保持一致"
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
            @click="cancelChange()"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="changePassword()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="profileDialog"
      max-width="600px"
      @input="getProfile()"
    >
      <v-card>
        <v-card-title>
          <span class="headline">用户资料</span>
        </v-card-title>
        <v-card-text>
          <v-alert icon="mdi-alert-circle" prominent text type="info">
            <small>修改用户资料</small>
          </v-alert>
          <v-form ref="profileRef">
            <div class="img-wrap">
              <img :src="userInformation.avatar" alt="">
              <div class="edit-btn">
                <v-file-input
                  accept="image/png, image/jpeg, image/jpg"
                  solo
                  prepend-icon="mdi-image-edit"
                  @change="modifyAvatar($event)"
                >
                </v-file-input>
                <v-icon color="error" class="ml-2" @click="deleteAvatar()">mdi-trash-can</v-icon>
              </div>
            </div>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="显示名（name）*"
                    required
                    dense
                    v-model="profileForm.name"
                    :rules="[v => !!v || '用户名为必填项']"
                    hint="用户的显示名字。格式例如：测试-用户01"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="手机号码（mobile）*"
                    required
                    dense
                    v-model="profileForm.mobile"
                    :rules="[v => !!v || '手机为必填项']"
                    hint="用户的手机号码。格式例如：13812341234"
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
              this.getProfile()
              this.profileDialog = false
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updateProfile()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="tokenDialog"
      width="800"
    >
      <v-card>
        <v-card-title>
          <span class="headline">access-token列表</span>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="addTokenDialog"
            max-width="600"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
              >
                新增access-token
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="headline grey lighten-2">
                新增access-token
              </v-card-title>
              <v-form ref="accessTokenRef" v-model="valid">
                <v-card-text>
                  <v-alert icon="mdi-alert-circle" prominent text type="info">
                    <small>accessToken用于通过后端服务直接调用API接口，调用接口的时候，请求的中需要提供"x-access-token: xxx"的header信息。</small>
                  </v-alert>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            label="访问token名字（accessTokenName）*"
                            required
                            :rules="[v => !!v || 'access-token名称为必填项']"
                            dense
                            v-model="accessTokenForm.accessTokenName"
                            hint="访问token名字，建议体现访问token的用途，格式例如：access-for-devops"
                            persistent-hint
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            label="有效期（expireDays）*"
                            required
                            :rules="[v => !!v || '有效天数为必填项']"
                            dense
                            type="number"
                            v-model="accessTokenForm.expireDays"
                            hint="访问token的有效期，单位为天"
                            persistent-hint
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="cancelAdd()"
                  >
                    取消
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="addAccessToken()"
                  >
                    确认
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="[
              { text: '用户名', sortable: false, value: 'username' },
              { text: 'access-token名称', value: 'accessTokenName', sortable: false },
              { text: 'access-token', value: 'accessTokenCopy', sortable: false },
              { text: '是否过期', value: 'expired', sortable: false },
              { text: '过期时间', value: 'expireTime', sortable: false },
              { text: '操作', value: 'handle', sortable: false }
            ]"
            :items="accessTokens"
            class="elevation-1"
            :hide-default-footer="true"
          >
            <template v-slot:item.accessTokenCopy="{ item }">
              <div>
                ***<v-btn class="ml-1" rounded color="primary" small v-clipboard:copy="item.accessToken" v-clipboard:success="onCopy" v-clipboard:error="onError">COPY</v-btn>
              </div>
            </template>
            <template v-slot:item.handle="{ item }">
              <v-btn small color="error" @click="deleteToken(item.accessTokenName)">回收token</v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="Ssnackbar.show"
      :timeout="2000"
      color="success"
      class="white--text"
    >
      {{ Ssnackbar.text }}
    </v-snackbar>
    <v-snackbar color="error" v-model="Esnackbar.show" timeout="-1" top>
      {{ Esnackbar.text }}
      <v-btn text @click="Esnackbar.show = false" outlined small class="float-right">关闭</v-btn>
    </v-snackbar>
    <v-snackbar
      v-model="Wsnackbar.show"
      :timeout="2000"
      color="orange"
      class="white--text"
    >
      {{ Wsnackbar.text }}
    </v-snackbar>
    <v-dialog
      v-model="cropperDialog"
      max-width="1000px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">裁剪图片</span>
        </v-card-title>
        <v-card-text>
          <div class="cropper-content">
          <div class="cropper" style="text-align:center">
            <vueCropper
              ref="cropper"
              :img="option.img"
              :outputSize="option.size"
              :outputType="option.outputType"
              :info="true"
              :full="option.full"
              :canMove="option.canMove"
              :canMoveBox="option.canMoveBox"
              :original="option.original"
              :autoCrop="option.autoCrop"
              :fixed="option.fixed"
              :fixedNumber="option.fixedNumber"
              :centerBox="option.centerBox"
              :infoTrue="option.infoTrue"
              :fixedBox="option.fixedBox"
            ></vueCropper>
          </div>
        </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="() => {
              this.cropperDialog = false
            }"
          >
            取消
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="updateAvatar()"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>

import NavMenu from '@/lib/ui-lib/components/NavMenu'
import MenuService from '@/services/menu'
import User from '@/services/user'
import { pluck, mergeMap, repeat } from 'rxjs/operators'
import USER_API from '@/api/user'
import request from "@/utils/request";
const menuService = MenuService.getInstance()
const userService = User.getInstance()
export default {
  name: 'Layout',
  provide () {
    return {
      successTip: this.successTip,
      errorTip: this.errorTip,
      warnTip: this.warnTip
    }
  },
  components: {
    NavMenu
  },
  domStreams: ['confirmUpdateProfile$'],
  data: () => ({
    menuService,
    userService,
    oldPasswordDisplay: false,
    newPasswordDisplay: false,
    confirmPasswordDisplay: false,
    drawer: true,
    mini: false,
    dialog: false,
    profileDialog: false,
    tokenDialog: false,
    addTokenDialog: false,
    leftNodesIndex: 0,
    residentSnackbar: {
      show: false,
      text: '',
      color: 'primary'
    },
    Ssnackbar: {
      show: false,
      text: '',
    },
    Esnackbar: {
      show: false,
      text: '',
    },
    Wsnackbar: {
      show: false,
      text: '',
    },
    userInformation: '',
    accessTokens: [],
    accessTokenForm: {
      accessTokenName: '',
      expireDays: 30
    },
    valid: true,
    profileForm: {
      name: '',
      mobile: ''
    },
    passwordForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    cropperDialog: false,
    fileName: '',
    option:{
      img: '',             //裁剪图片的地址
      outputSize: 1,       //裁剪生成图片的质量(可选0.1 - 1)
      outputType: 'jpeg',  //裁剪生成图片的格式（jpeg || png || webp）
      info: true,          //图片大小信息
      canScale: true,      //图片是否允许滚轮缩放
      autoCrop: true,      //是否默认生成截图框
      autoCropWidth: 300,  //默认生成截图框宽度
      autoCropHeight: 300, //默认生成截图框高度
      fixed: true,         //是否开启截图框宽高固定比例
      fixedNumber: [1, 1], //截图框的宽高比例
      full: false,         //false按原比例裁切图片，不失真
      fixedBox: false,      //固定截图框大小，不允许改变
      canMove: true,      //上传图片是否可以移动
      canMoveBox: true,    //截图框能否拖动
      original: false,     //上传图片按照原始比例渲染
      centerBox: false,    //截图框是否被限制在图片里面
      height: true,        //是否按照设备的dpr 输出等比例图片
      infoTrue: true,     //true为展示真实输出图片宽高，false展示看到的截图框宽高
      maxImgSize: 3000,    //限制图片最大宽度和高度
      enlarge: 1,          //图片根据截图框输出比例倍数
      mode: '300px 300px'  //图片默认渲染方式
    }
  }),
  created () {
    const vm = this
    vm.userInformation = JSON.parse(localStorage.getItem('userObj'))
    USER_API.getProfile().then(response => {
      this.profileForm.name = response.data.profile.name
      this.profileForm.mobile = response.data.profile.mobile
    }).catch(error => {
      this.errorTip(true,error.response.data.msg)
    })
    USER_API.getAccessToken().then(response => {
      vm.accessTokens = response.data.accessTokens
    }).catch(error => {
      this.errorTip(true,error.response.data.msg)
    })
    vm.$watchAsObservable('$route', { immediate: true }).pipe(
      pluck('newValue')
    ).subscribe(next => {
      if (next.fullPath.startsWith('/cicd')) {
        vm.leftNodesIndex = 0
      } else if (next.fullPath.startsWith('/admin')) {
        vm.leftNodesIndex = 1
      } else if (next.fullPath.startsWith('/console')) {
        vm.leftNodesIndex = 2
      } else if (next.fullPath.startsWith('/metrics')) {
        vm.leftNodesIndex = 3
      } else if (next.fullPath.startsWith('/announcements')) {
        vm.leftNodesIndex = 4
      }
    })
    vm.$subscribeTo(menuService.leftMenu$, (next) => {

    })
    vm.$subscribeTo(userService.userObj$, (next) => {
      if (!next || next.userStatus === 'invalid') {
        vm.residentSnackbar.show = true
      } else {
        vm.residentSnackbar.show = false
      }
    })
  },
  methods: {
    getAccessToken (snackbarText) {
      const vm = this
      USER_API.getAccessToken().then(response => {
        vm.accessTokens = response.data.accessTokens
        vm.successTip(true,response.msg)
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    getProfile () {
      USER_API.getProfile().then(response => {
        this.profileForm.name = response.data.profile.name
        this.profileForm.mobile = response.data.profile.mobile
      }).catch(error => {
        this.errorTip(true,error.response.data.msg)
      })
    },
    addAccessToken () {
      const vm = this
      if(vm.$refs.accessTokenRef.validate()){
        vm.accessTokenForm.expireDays = Number(vm.accessTokenForm.expireDays)
        USER_API.postAccessToken(vm.accessTokenForm).then(response => {
          vm.getAccessToken(response.msg)
          console.log(response)
          vm.addTokenDialog = false
          vm.accessTokenForm.accessTokenName = ''
          vm.$refs.form.resetValidation()
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    cancelAdd () {
      this.accessTokenForm.accessTokenName = ''
      this.$refs.accessTokenRef.resetValidation()
      this.addTokenDialog = false
    },
    onCopy () {
      this.successTip(true,'复制成功')
    },
    onError () {
      this.errorTip(true,'复制失败')
    },
    deleteToken (accessTokenName) {
      const vm = this
      USER_API.deleteAccessToken(accessTokenName).then(response => {
        vm.getAccessToken(response.msg)
      }).catch(error => {
        vm.errorTip(true,error.response.data.msg)
      })
    },
    updateProfile () {
      const vm = this
      if(vm.$refs.profileRef.validate()){
        USER_API.updateProfile(vm.profileForm).then(response => {
          vm.profileDialog = false
          vm.successTip(true,response.msg)
        }).catch(error => {
          vm.profileDialog = false
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    changePassword () {
      const vm = this
      if(vm.$refs.passwordRef.validate()){
        USER_API.changePassword(vm.passwordForm).then(response => {
          vm.dialog = false
          vm.$refs.passwordRef.reset()
          vm.successTip(true,response.msg)
          vm.timer=setTimeout(() => {
            // vm.$router.push({ path: '/login' })
          },2000)
        }).catch(error => {
          vm.errorTip(true,error.response.data.msg)
        })
      }
    },
    cancelChange () {
      this.dialog = false
      this.$refs.passwordRef.reset()
    },
    successTip (show, message) {
      this.Ssnackbar.show = show
      this.Ssnackbar.text = message
    },
    errorTip (show, message) {
      this.Esnackbar.show = show
      this.Esnackbar.text = message
    },
    warnTip (show, message) {
      this.Wsnackbar.show = show
      this.Wsnackbar.text = message
    },
    modifyAvatar(e) {
      const vm = this
      vm.fileName = e.name
      //转化为blob
      let reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === 'object') {
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        vm.option.img = data
      }
      //转化为base64
      reader.readAsDataURL(e)
      vm.cropperDialog = true
    },
    deleteAvatar() {
      const vm = this
      request.delete('/account/avatar').then(response => {
        vm.successTip(true, response.msg)
        vm.profileDialog = false
        vm.userInformation = JSON.parse(localStorage.getItem('userObj'))
      }).catch(error => {
        vm.errorTip(true, error.response.data.msg)
      })
    },
    updateAvatar() {
      const vm = this
      vm.$refs.cropper.getCropBlob(data => {
        let formData = new FormData();
        formData.append('avatar', data, vm.fileName)
        request.post('/account/avatar', formData).then(response => {
          vm.successTip(true, response.msg)
          vm.cropperDialog = false
          vm.profileDialog = false
          vm.userInformation = JSON.parse(localStorage.getItem('userObj'))
        }).catch(error => {
          vm.errorTip(true, error.response.data.msg)
        })
      })
      vm.$forceUpdate()
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style lang='scss'>
.v-navigation-drawer .v-navigation-drawer__content::-webkit-scrollbar{
  width: 6px;
}
.theme--dark.v-app-bar.v-toolbar.v-sheet {
  z-index: 10;
}
.v-navigation-drawer .v-navigation-drawer__content::-webkit-scrollbar-track{
  background: rgb(239, 239, 239);
  border-radius: 2px;
}
.v-navigation-drawer .v-navigation-drawer__content::-webkit-scrollbar-thumb{
  background: #bfbfbf;
  border-radius: 10px;
}
.img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }
  .edit-btn {
    margin-left: 16px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    button {
      margin: 0 !important;
      cursor: pointer;
    }
    .v-input__control {
      display: none;
    }
    .v-text-field.v-text-field--solo .v-input__prepend-outer, .v-text-field.v-text-field--solo .v-input__append-outer {
      margin: 0 !important;
      .v-icon {
        color: #1976d2 !important;
      }
    }
    .v-input {
      flex: none;
    }
  }
}
.cropper-content {
  .cropper {
    width: auto;
    height: 500px;
  }
}
</style>
