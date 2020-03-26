<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="head_portrait">
        <img src="../assets/logo.png" alt="头像">
      </div>
      <!-- 表单区 -->
      <el-form :model="loginForm" :rules="formRules" ref="loginRef" class="login_info">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="bts">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button type="info" round>注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login',
    data () {
      return {
        loginForm: { // 登录表单数据绑定对象
          username: 'admin',
          password: '123456'
        },
        formRules: { // 表单数据验证规则
          username: [
            {
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 10,
              message: '长度在 6 到 10 个字符',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      login () {
        this.$refs.loginRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('login', this.loginForm)
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message({
              showClose: true,
              message: '登录失败',
              type: 'error'
            })
          }
          this.$message({
            showClose: true,
            message: '登录成功',
            type: 'success'
          })
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    height: 100%;
    background-color: #297eff;
  }

  .login_box {
    height: 300px;
    width: 450px;
    background-color: white;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
  }

  .head_portrait {
    height: 100px;
    width: 100px;
    border-radius: 50%;
    position: absolute;
    border: 2px solid #d2d2d2;
    padding: 5px;
    margin: 0;
    box-shadow: 0 0 10px #828282;
    background-color: #ffffff;
    left: 50%;
    transform: translate(-50%, -50%);

    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eeeeee;
    }
  }

  .login_info {
    position: absolute;
    /*top: 30%;*/
    bottom: 0;
    /*height: 100%;*/
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .bts {
    display: flex;
    justify-content: center;
  }
</style>
