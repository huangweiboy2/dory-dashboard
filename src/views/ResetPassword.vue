<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height class="login-container">
        <v-row class="align-center justify-center">
          <v-col xs="12" sm="8" md="6" lg="5" xl="3">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>重置密码</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-stepper v-model="e1">
                <v-stepper-items>
                  <v-stepper-content step="3">
                    <v-form style="height: 200px" ref="resetPassword_form">
                      <v-text-field
                        label="重置密码"
                        name="newPassword"
                        prepend-icon="mdi-lock"
                        type="password"
                        v-model="loginForm.newPassword"
                        :rules="[rules.required]"
                      ></v-text-field>
                      <v-text-field
                        label="确认密码"
                        name="confirmPassword"
                        prepend-icon="mdi-lock"
                        type="password"
                        v-model="loginForm.confirmPassword"
                        :rules="[rules.required, rules.confirmPassword]"
                      ></v-text-field>
                    </v-form>
                    <v-row>
                      <v-col cols="12" class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          :loading="resetPasswordLoading"
                          v-stream:click="resetPasswordClick$"
                        >
                          确认
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-snackbar top :color="snackbar.color" v-model="snackbar.show">
      {{ snackbar.text }}
      <v-btn text @click="snackbar.show = false">关闭</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import User from '@/services/user'
import { delay, filter, mergeMap, tap } from 'rxjs/operators'
import USER_API from '@/api/user'
const userService = User.getInstance()
export default {
  name: 'Login',
  data () {
    const vm = this
    return {
      passwordDisplay: false,
      loginLoading: false,
      loginForm: {
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        required: value => !!value || '请输入此字段',
        confirmPassword: value => {
          if (value === vm.loginForm.newPassword) {
            return true
          } else {
            return '密码不一致'
          }
        }
      },
      snackbar: {
        show: false,
        text: '',
        color: 'primary'
      },
      e1: 3,
      confirmRequestValidateCodeLoading: false,
      confirmValidateCodeLoading: false,
      resetPasswordLoading: false
    }
  },
  domStreams: ['confirmRequestValidateCodeClick$', 'confirmValidateCodeClick$', 'resetPasswordClick$'],
  methods: {
    userLogin () {
      const vm = this
      if (!vm.$refs.login_form.validate()) return
      // 表单验证成功
      vm.loginLoading = true
      new Promise(resolve => {
        resolve(vm.loginForm)
      }).then(response => {
        userService.userObj$.next(response)
      }).catch(({ msg }) => {
        vm.snackbarShow('登录出错请联系管理员', 'error')
      }).then(_ => {
        vm.loginLoading = false
        vm.$router.replace('/')
      }).finally(() => {
        vm.loginLoading = false
      })
    },
    snackbarShow (text, color) {
      this.snackbar = {
        show: true,
        text,
        color
      }
    }
  },
  created () {
    const vm = this
    vm.resetPasswordClick$.pipe(
      filter(next => {
        return vm.$refs.resetPassword_form.validate()
      }),
      tap(next => {
        vm.resetPasswordLoading = true
      }),
      mergeMap(next => {
        return USER_API.resetPassword(Object.assign({}, vm.loginForm, { resetToken: '111' }))
      }),
      delay(2000),
      filter(next => {
        if (next === true) {
          return true
        } else {
          vm.resetPasswordLoading = false
          vm.snackbarShow('重置密码失败,请联系管理员', 'error')
          return false
        }
      }),
      tap(next => {
        vm.resetPasswordLoading = false
        vm.snackbarShow('重置密码成功,请重新登录', 'success')
        userService.userObj$.next(null)
      }),
      delay(1000)
    ).subscribe(next => {
      vm.$router.push({ path: '/login' })
    })
  }
}
</script>

<style scoped lang="scss">
.login-container {
  background-image: url("~@/assets/login/background.jpg");
  background-position: center;
  background-size: 100% auto;
  @media (max-aspect-ratio: 2560/1600){
    background-size: auto 100%;
  }
}
</style>
