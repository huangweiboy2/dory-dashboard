<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        fill-height
        class="login-container"
      >
        <v-row class="align-center justify-center">
          <v-col xs="12" sm="8" md="6" lg="5" xl="3">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>忘记密码</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-stepper v-model="e1">
                <v-stepper-header>
                  <v-stepper-step
                    :complete="e1 > 1"
                    step="1"
                  >
                    输入帐号
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step
                    :complete="e1 > 2"
                    step="2"
                  >
                    发送验证邮件
                  </v-stepper-step>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-form style="height: 200px" ref="requestValidateCode_form">
                      <v-text-field
                        label="用户名"
                        name="username"
                        prepend-icon="mdi-account"
                        type="text"
                        v-model="loginForm.username"
                        :rules="[rules.required]"
                      ></v-text-field>
                      <v-text-field
                        label="邮箱"
                        name="mail"
                        prepend-icon="mdi-email"
                        type="text"
                        v-model="loginForm.mail"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </v-form>
                    <v-row>
                      <v-col cols="12" class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          :loading="confirmRequestValidateCodeLoading"
                          v-stream:click="confirmRequestValidateCodeClick$"
                        >
                          确认
                        </v-btn>

                        <v-btn text @click="() => { $router.back() }">
                          取消
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-stepper-content>
                  <v-stepper-content step="2">
                    <v-form style="height: 200px" ref="validateCode_form">
                      <div class="d-flex justify-center">
                        <v-icon color="success" class="mb-2" style="font-size: 46px">
                          mdi-checkbox-marked-circle-outline
                        </v-icon>
                      </div>
                      <div class="d-flex justify-center">
                        验证链接发送成功,请查看邮箱
                      </div>
                    </v-form>
                    <v-row>
                      <v-col cols="12" class="d-flex">
                        <v-spacer></v-spacer>
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
        username: '',
        mail: ''
      },
      rules: {
        required: value => !!value || '请输入此字段',
        confirmPassword: value => {
          if (value === vm.loginForm.password) {
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
      e1: 1,
      confirmRequestValidateCodeLoading: false,
      confirmValidateCodeLoading: false,
      resetPasswordLoading: false
    }
  },
  domStreams: ['confirmRequestValidateCodeClick$'],
  methods: {
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
    vm.confirmRequestValidateCodeClick$.pipe(
      filter(next => {
        return vm.$refs.requestValidateCode_form.validate()
      }),
      tap(next => {
        vm.confirmRequestValidateCodeLoading = true
      }),
      mergeMap(next => {
        return USER_API.forgetPassword(vm.loginForm).then(response => {
          console.log(response)
        }).catch(error => {
          console.log(error.response)
        })
      }),
      delay(2000),
      filter(next => {
        if (next === true) {
          return true
        } else {
          vm.confirmRequestValidateCodeLoading = false
          vm.snackbarShow('无此用户,请检查后重新获取验证码', 'error')
          return false
        }
      })
    ).subscribe(next => {
      vm.confirmRequestValidateCodeLoading = false
      vm.snackbarShow('获取验证码成功,请检查邮箱', 'success')
      vm.e1 = 2
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
