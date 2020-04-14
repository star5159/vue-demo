<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="quit">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!--预留加上△折叠图案，折叠加上动画延时-->
        <div class="foldMenu" @click="collapseMenu"></div>
        <el-menu background-color="#3c4457" text-color="#fff" active-text-color="#2471FF" :unique-opened="true"
                 :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="firstClassMenu.id + ''" v-for="firstClassMenu in menulist" :key="firstClassMenu.id">
            <template slot="title">
              <i :class="icons[firstClassMenu.id]"></i>
              <span>{{firstClassMenu.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/' + submenu.path" v-for="submenu in firstClassMenu.children" :key="submenu.id"
                          @click="saveNav('/' + submenu.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{submenu.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'home',
    data () {
      return {
        menulist: [],
        icons: {
          125: 'iconfont icon-users',
          103: 'iconfont icon-tijikongjian',
          101: 'iconfont icon-shangpin',
          102: 'iconfont icon-danju',
          145: 'iconfont icon-baobiao'
        },
        isCollapse: false,
        activePath: ''
      }
    },
    created () {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      quit () { // 登出
        window.sessionStorage.removeItem('token')
        this.$router.push('/login')
      },
      async getMenuList () { // 获取侧边栏菜单列表
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist = res.data
      },
      collapseMenu () { // 改变菜单栏折叠状态
        this.isCollapse = !this.isCollapse
      },
      saveNav (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #404040;
    display: flex;
    justify-content: space-between;
    align-items: center;

    div {
      display: flex;
      align-items: center;

      span {
        color: white;
        font-size: 20px;
        margin-left: 10px;
      }
    }
  }

  .el-aside {
    background-color: #3c4457;

    .el-menu {
      border-right: 0;
    }
  }

  .el-main {
    background-color: #e6e7ff;
  }

  .iconfont {
    margin-right: 10px;
  }

  .foldMenu {
    height: 20px;
  }
</style>
