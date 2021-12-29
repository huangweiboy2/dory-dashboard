<template>
  <router-view v-if="isRouterAlive" />
</template>

<script>
export default {
  name: 'App',
  provide () {
    return {
      reload: this.reload
    }
  },
  components: {},
  data: () => ({
    isRouterAlive: true
  }),
  methods: {
    reload () {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    }
  }
}
</script>
<style>
table th,table td{
  padding: 0 8px !important;
}
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.repo-wrap a {
  text-decoration: none;
}
.repo-wrap a .v-chip {
  cursor: pointer;
}
</style>
