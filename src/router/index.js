import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/components/layout/Layout'
import User from '@/services/user'
import { Subject } from 'rxjs'
const userService = User.getInstance()

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/cicd/projects'
  },
  {
    path: '/cicd',
    component: Layout,
    name: 'Cicd',
    redirect: '/cicd/projects',
    children: [
      {
        path: 'projects',
        name: 'CicdProjects',
        component: () => import('../views/cicd/Projects')
      },
      {
        path: 'pipeline/:pipelineName',
        name: 'CicdPipeline',
        component: () => import('../views/cicd/Pipeline')
      },
      {
        path: 'project/:projectName',
        name: 'CicdProject',
        component: () => import('../views/cicd/Project')
      },
      {
        path: 'projectDef/:projectName',
        name: 'CicdProjectDef',
        component: () => import('../views/cicd/ProjectDef')
      },
      {
        path: 'module/:projectName/:moduleType/:moduleName',
        name: 'CicdModule',
        component: () => import('../views/cicd/Module')
      },
      {
        path: 'runs',
        name: 'CicdRuns',
        component: () => import('../views/cicd/Runs')
      },
      {
        path: 'run/:runName',
        name: 'CicdRun',
        component: () => import('../views/cicd/Run')
      },
      {
        path: 'queue',
        name: 'CicdQueue',
        component: () => import('../views/cicd/Queue')
      },
      {
        path: 'commits',
        name: 'CicdCommits',
        component: () => import('../views/cicd/Commits')
      },
      {
        path: 'steps',
        name: 'CicdSteps',
        component: () => import('../views/cicd/Steps')
      },
    ]
  },
  {
    path: '/metrics',
    component: Layout,
    name: 'Metrics',
    redirect: '/metrics/runs',
    children: [
      {
        path: 'runs',
        name: 'MetricsRuns',
        component: () => import('../views/metrics/Runs')
      },
      {
        path: 'steps',
        name: 'MetricsSteps',
        component: () => import('../views/metrics/Steps')
      },
      {
        path: 'builds',
        name: 'MetricsBuilds',
        component: () => import('../views/metrics/Builds')
      },
      {
        path: 'packages',
        name: 'MetricsPackages',
        component: () => import('../views/metrics/Packages')
      },
      {
        path: 'deploys',
        name: 'MetricsDeploys',
        component: () => import('../views/metrics/Deploys')
      },
      {
        path: 'checkDeploys',
        name: 'MetricsCheckDeploys',
        component: () => import('../views/metrics/CheckDeploys')
      },
      {
        path: 'checkQuotas',
        name: 'MetricsCheckQuotas',
        component: () => import('../views/metrics/CheckQuotas')
      },
      {
        path: 'customSteps',
        name: 'MetricsCustomSteps',
        component: () => import('../views/metrics/CustomSteps')
      },
      {
        path: 'commits',
        name: 'MetricsCommits',
        component: () => import('../views/metrics/Commits')
      },
      {
        path: 'auditLogs',
        name: 'MetricsAuditLogs',
        component: () => import('../views/metrics/AuditLogs')
      }
    ]
  },
  {
    path: '/admin',
    component: Layout,
    name: 'Admin',
    redirect: '/admin/projects',
    children: [
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('../views/admin/Projects')
      },
      {
        path: 'project/:projectName',
        name: 'AdminProject',
        component: () => import('../views/admin/Project')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users')
      },
      {
        path: 'envs',
        name: 'AdminEnvs',
        component: () => import('../views/admin/Envs')
      },
      {
        path: 'customStepConfs',
        name: 'AdminCustomStepConfs',
        component: () => import('../views/admin/CustomStepConfs')
      },
      {
        path: 'auditLogs',
        name: 'AdminAuditLogs',
        component: () => import('../views/admin/AuditLogs')
      },
      {
        path: 'componentTemplates',
        name: 'AdminComponentTemplates',
        component: () => import('../views/admin/ComponentTemplates'),
      },
      {
        path: 'queue',
        name: 'AdminQueue',
        component: () => import('../views/admin/Queue')
      },
      {
        path: 'cronLogs',
        name: 'AdminCronLogs',
        component: () => import('../views/admin/CronLogs')
      },
      {
        path: 'triggerWebhookLogs',
        name: 'AdminTriggerWebhookLogs',
        component: () => import('../views/admin/TriggerWebhookLogs')
      },
    ]
  },
  {
    path: '/console',
    component: Layout,
    name: 'Console',
    redirect: '/console/projects',
    children: [
      {
        path: 'projects',
        name: 'ConsoleProjects',
        component: () => import('../views/console/Projects')
      },
      {
        path: 'project/:projectName',
        name: 'ConsoleProject',
        component: () => import('../views/console/Project')
      },
      {
        path: 'cronLogs',
        name: 'ConsoleCronLogs',
        component: () => import('../views/console/CronLogs')
      },
      {
        path: 'triggerWebhookLogs',
        name: 'ConsoleTriggerWebhookLogs',
        component: () => import('../views/console/TriggerWebhookLogs')
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login'),
    beforeEnter: (to, from, next) => {
      if (userService.state.userObj && userService.state.userObj.userStatus === 'valid') {
        next({ path: '/' })
      }
      next()
    }
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('../views/ForgetPassword')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword')
  },
  {
    path: '*',
    redirect: '/cicd/projects',
    name: 'projects',
    hidden: true,
  }
]

const router = new VueRouter({
  routes
})
const whiteList = ['Login', 'ForgetPassword', 'ResetPassword']

export const routerBeforeSubject = new Subject()
router.beforeEach((to, from, next) => {
  routerBeforeSubject.next({
    to, from, next
  })
  if ((userService.state.userObj && userService.state.userObj.userStatus === 'valid') || whiteList.includes(to.name)) {
    next()
  } else {
    next({ path: `/login?redirect=${to.fullPath}` })
  }
})

export default router
