<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header class="el_header">
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧区域 -->
      <el-aside :width="asideWidth">
        <div class="toggle-button"  @click="toggle_button">|||</div>
        <!-- 首页导航 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse = "isCollapse"
          :collapse-transition="false" 
          :unique-opened='true'
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            v-for="item in menuList"
            :key="item.id"
            :index="String(item.id)"
          >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 菜单的图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 菜单的文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="String('/'+i.path)"
              v-for="i in item.children"
              :key="i.id"
              @click="saveNavState(String('/'+i.path))"
            >
              <template slot="title">
                <!-- 菜单的图标 -->
                <i class="el-icon-menu"></i>
                <!-- 菜单的文本 -->
                <span>{{ i.authName }}</span>
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
  data() {
    return {
      menuList: [],
      iconsObj: {
        160: 'el-icon-magic-stick',
        125: 'el-icon-user',
        103: 'el-icon-s-platform',
        101: 'el-icon-shopping-bag-1',
        102: 'el-icon-shopping-cart-2',
        145: 'el-icon-tickets',
      },
      //控制是否折叠
      isCollapse:false,
      asideWidth:'200px',
      //激活的菜单路径
      activePath:''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    loginout() {
      //清空token
      window.sessionStorage.clear()
      //跳转登录页面
      this.$router.push('/login')
    },
    //获取所有菜单信息
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return res.meta.msg
      this.menuList = res.data
    },
    //折叠菜单栏
    toggle_button(){
      this.isCollapse = !this.isCollapse
      if(this.isCollapse){
        this.asideWidth = "64px"
      }else{
        this.asideWidth = "200px"
      }
    },
    //活动菜单栏的颜色
    saveNavState(path){
      window.sessionStorage.setItem('activePath',path)
    },
  },
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el_header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle-button{
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    background-color: #4a5064;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-left: 10px;
}
</style>