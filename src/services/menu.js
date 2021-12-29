import { BehaviorSubject } from 'rxjs'
import Vue from 'vue'
import USER_API from '@/api/user'
import User from '@/services/user'
const userService = User.getInstance()
export default class Menu {
  topMenu$ = new BehaviorSubject([
    { key: 'projects', icon: 'mdi-rocket-launch', title: '持续交付', type: 'router', routerKey: 'Cicd' },
    { key: 'metrics', icon: 'mdi-bulletin-board', title: '度量统计', type: 'router', routerKey: 'Metrics' },
    { key: 'console', icon: 'mdi-console', title: '个人控制台', type: 'router', routerKey: 'Console' },
    { key: 'admin', icon: 'mdi-account-cog', title: '管理控制台', type: 'router', routerKey: 'Admin' },
    // { key: 'docs', icon: 'mdi-help-circle', title: '帮助手册', type: 'router' },
    // { key: 'msgs', icon: 'mdi-android-messages', title: '消息通知', type: 'router' },
    // { key: 'notices', icon: 'mdi-bulletin-board', title: '公告通知', type: 'router' },
    {
      key: 'myAccount',
      icon: 'mdi-account-box',
      title: '我的账号菜单',
      nodes: [
        {
          key: 'accessToken',
          name: '访问token',
          icon: 'mdi-filter-variant',
          type: 'function',
          onClick (h, context) {
            context.parent.tokenDialog = true
          }
        },
        {
          key: 'changePwd',
          name: '修改密码',
          icon: 'mdi-lock',
          type: 'function',
          onClick (h, context) {
            context.parent.dialog = true
          }
        },
        {
          key: 'editProfile',
          name: '修改资料',
          icon: 'mdi-file-document-edit',
          type: 'function',
          onClick (h, context) {
            context.parent.profileDialog = true
          }
        },
        {
          key: 'logout',
          name: '退出登录',
          icon: 'mdi-logout',
          type: 'function',
          onClick (h, context) {
            USER_API.logout().then(next => {
              userService.userObj$.next(null)
              context.parent.$router.push({ path: '/login' })
            })
          }
        }
      ]
    }
  ])

  leftMenu$ = new BehaviorSubject([
    {
      key: 'cicd',
      name: '持续交付',
      nodes: [
        { key: 'projects', name: '持续交付', icon: 'mdi-rocket-launch', type: 'router', routerKey: 'CicdProjects' },
        { key: 'runs', name: '运行记录', icon: 'mdi-play-circle', type: 'router', routerKey: 'CicdRuns' },
        { key: 'queue', name: '运行队列', icon: 'mdi-format-list-bulleted-square', type: 'router', routerKey: 'CicdQueue' },
        { key: 'commits', name: 'commit提交记录', icon: 'mdi-git', type: 'router', routerKey: 'CicdCommits' },
        {
          key: 'steps',
          name: '步骤执行记录',
          icon: 'mdi-step-forward-2',
          type: 'router',
          routerKey: 'CicdSteps',
          nodes: []
        },
      ]
    },
    {
      key: 'admin',
      name: '管理控制台',
      nodes: [
        { key: 'adminProjects', name: '项目管理', icon: 'mdi-rocket-launch', type: 'router', routerKey: 'AdminProjects' },
        { key: 'AdminUsers', name: '用户管理', icon: 'mdi-account-circle', type: 'router', routerKey: 'AdminUsers' },
        { key: 'AdminEnvs', name: '环境管理', icon: 'mdi-apple-icloud', type: 'router', routerKey: 'AdminEnvs' },
        { key: 'AdminCustomStepConfs', name: '自定义步骤', icon: 'mdi-focus-field-vertical', type: 'router', routerKey: 'AdminCustomStepConfs' },
        { key: 'AdminComponentTemplates', name: '组件模板', icon: 'mdi-video-input-component', type: 'router', routerKey: 'AdminComponentTemplates' },
        { key: 'queue', name: '运行队列', icon: 'mdi-format-list-bulleted-square', type: 'router', routerKey: 'AdminQueue' },
        { key: 'AdminAuditLogs', name: '审计日志', icon: 'mdi-math-log', type: 'router', routerKey: 'AdminAuditLogs' },
        { key: 'AdminCronLogs', name: '计划任务日志', icon: 'mdi-file-tree', type: 'router', routerKey: 'AdminCronLogs' },
        { key: 'triggerWebhookLogs', name: 'webhook触发日志', icon: 'mdi-webhook', type: 'router', routerKey: 'AdminTriggerWebhookLogs' },
      ]
    },
    {
      key: 'console',
      name: '个人控制台',
      nodes: [
        { key: 'adminProjects', name: '项目管理', icon: 'mdi-rocket-launch', type: 'router', routerKey: 'ConsoleProjects' },
        { key: 'ConsoleCronLogs', name: '计划任务日志', icon: 'mdi-file-tree', type: 'router', routerKey: 'ConsoleCronLogs' },
        { key: 'triggerWebhookLogs', name: 'webhook触发日志', icon: 'mdi-webhook', type: 'router', routerKey: 'ConsoleTriggerWebhookLogs' },
      ]
    },
    {
      key: 'metrics',
      name: '度量统计',
      nodes: [
        { key: 'runs', name: '流水线', icon: 'mdi-play-circle', type: 'router', routerKey: 'MetricsRuns' },
        { key: 'steps', name: '步骤', icon: 'mdi-step-forward-2', type: 'router', routerKey: 'MetricsSteps' },
        { key: 'builds', name: '构建', icon: 'mdi-office-building', type: 'router', routerKey: 'MetricsBuilds' },
        { key: 'packages', name: '镜像打包', icon: 'mdi-package', type: 'router', routerKey: 'MetricsPackages' },
        { key: 'deploys', name: '容器发布', icon: 'mdi-codepen', type: 'router', routerKey: 'MetricsDeploys' },
        { key: 'checkDeploys', name: '容器发布检查', icon: 'mdi-check-network', type: 'router', routerKey: 'MetricsCheckDeploys' },
        { key: 'checkQuotas', name: '资源配额检查', icon: 'mdi-database-check', type: 'router', routerKey: 'MetricsCheckQuotas' },
        { key: 'customSteps', name: '自定义步骤', icon: 'mdi-focus-field-vertical', type: 'router', routerKey: 'MetricsCustomSteps' },
        { key: 'commits', name: 'commit提交', icon: 'mdi-git', type: 'router', routerKey: 'MetricsCommits' },
        { key: 'auditLogs', name: '审计日志', icon: 'mdi-math-log', type: 'router', routerKey: 'MetricsAuditLogs' },
      ]
    },
  ])

  currentMenu$ = new BehaviorSubject({
    top: null,
    left: null
  })

  state = Vue.observable({
    leftMenu: [],
    topMenu: [],
    currentMenu: {
      top: null,
      left: null
    }
  })

  constructor () {
    const _this = this
    _this.leftMenu$.subscribe(next => {
      _this.state.leftMenu = next
    })
    _this.topMenu$.subscribe(next => {
      _this.state.topMenu = next
    })
    _this.currentMenu$.subscribe(next => {
      _this.state.currentMenu = next
    })
  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new this()
    }
    return this.instance
  }
}
