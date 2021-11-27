<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 登录头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFromRef"
        :model="loginForm"
        :rules="rules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 登录 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="loginReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      //表单的验证规则
      rules: {
        //用户名的验证规则
        username: [
          { required: true, message: '请输入用户名😊', trigger: 'blur' },
        ],
        //密码的验证规则
        password: [
          { required: true, message: '请输入密码😊', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    //重置表单 理由element提供的方法
    loginReset() {
      console.log(this)
      this.$refs.loginFromRef.resetFields()
    },
    login() {
      this.$refs.loginFromRef.validate(async (valid) => {
        if (!valid) return
        //登录发起请求
        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('登录成功')

        //登录成功后保存token 到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)

        //跳转主页
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ddd;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>