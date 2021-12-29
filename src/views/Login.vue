<template>
  <v-app>
    <v-main>
      <v-container
        class="login-container"
        fluid
        fill-height
      >
        <v-row class="align-center justify-center">
          <v-col xs="12" sm="8" md="6" lg="5" xl="3">
            <v-card class="elevation-12 pa-3">
              <v-card-title>
                <img style="height: 40px; margin-right: 10px" src="~@/assets/icons/dory3.0.svg" />
                <span>Dory-Core (社区版)</span>
              </v-card-title>
<!--              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>登录</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>-->
              <v-card-text>
                <v-form ref="login_form">
                  <v-text-field
                    label="帐号"
                    name="username"
                    prepend-icon="mdi-account"
                    type="text"
                    v-model="loginForm.username"
                    :rules="[rules.required]"
                    hint="登录的账号或者邮箱"
                    persistent-hint
                  ></v-text-field>

                  <v-text-field
                    id="password"
                    label="密码"
                    name="password"
                    prepend-icon="mdi-lock"
                    :type="passwordDisplay ? 'text' : 'password'"
                    v-model="loginForm.password"
                    :append-icon="passwordDisplay ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="passwordDisplay = !passwordDisplay"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-form>
                <div class="d-flex">
                  <v-spacer />
                  <a style="color: rgba(0, 0, 0, 0.6)" @click="$router.push('/forget-password')">忘记密码?</a>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  block
                  :loading="loginLoading"
                  color="primary"
                  @click="userLogin"
                >登录</v-btn
                >
              </v-card-actions>
              <div class="d-flex align-center px-2 mt-1">
                <div class="flex-grow-1" style="height: 1px; background: #bfbfbf"></div>
                <div class="pa-1">欢迎来到</div>
                <div class="flex-grow-1" style="height: 1px; background: #bfbfbf"></div>
              </div>
              <div class="d-flex justify-center pb-3" style="font-size: 14px; font-weight: normal; color: rgba(0, 0, 0, 0.6)">
                Dory-Core - 极简应用上云引擎
              </div>
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
import USER_API from '@/api/user'
const userService = User.getInstance()
export default {
  name: 'Login',
  data: () => ({
    passwordDisplay: false,
    loginLoading: false,
    loginForm: {
      username: '',
      password: ''
    },
    rules: {
      required: value => !!value || '请输入此字段'
    },
    snackbar: {
      show: false,
      text: '',
      color: 'primary'
    }
  }),
  methods: {
    userLogin () {
      const vm = this
      if (!vm.$refs.login_form.validate()) return
      // 表单验证成功
      vm.loginLoading = true
      /* new Promise(resolve => {
        resolve(vm.loginForm)
      }) */
      USER_API.login(vm.loginForm).then(response => {
        // userService.userObj$.next(response)
      }).then(_ => {
        vm.loginLoading = false
        vm.$router.replace('/')
      }).catch((error) => {
        if (error && error.response.status === 403) {
          vm.snackbarShow('用户名或密码错误,请重新输入', 'error')
        } else {
          vm.snackbarShow('登录出错请联系管理员', 'error')
        }
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
  }
}
</script>

<style lang="scss">
.login-container {
  background-image: url("~@/assets/login/background.jpg");
  background-position: center;
  background-size: 100% auto;
  @media (max-aspect-ratio: 2560/1600){
    background-size: auto 100%;
  }
}
</style>
