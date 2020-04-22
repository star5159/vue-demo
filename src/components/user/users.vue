<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--搜索框-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加新用户</el-button>
        </el-col>
      </el-row>
      <!--用户表格-->
      <el-table :data="usersList" :stripe="true" :border="true">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="手机" prop="mobile"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state" width="100px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--编辑用户按钮-->
            <el-button type="primary" icon="el-icon-edit" @click="modifyUser(scope.row.id)"></el-button>
            <!--删除用户按钮-->
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <!--分配用户角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="35%" @close="addDialogClose">
      <el-form ref="addUserRef" :model="addUserForm" label-width="80px" :rules="UserRule">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog title="修改用户" :visible.sync="modifyDialogVisible" width="35%" @close="modifyDialogClose">
      <el-form ref="modifyUserRef" :model="modifyUserForm" label-width="80px" :rules="UserRule">
        <el-form-item label="用户名">
          <el-input v-model="modifyUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="modifyUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="modifyUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog title="分配角色" :visible.sync="setDialogVisible" width="35%">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前用户：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="roleSelectId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <el-button @click="setDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="updateRole">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'users',
    data () {
      const checkEmail = (rule, value, check) => {
        const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (regEmail.test(value)) return check()
        check(new Error('请输入合法的邮箱'))
      }
      const checkMobile = (rule, value, check) => {
        const regMobile = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\d])|(18[0-9]))\d{8}$/
        if (regMobile.test(value)) return check()
        check(new Error('请输入合法的手机号'))
      }
      return {
        queryInfo: {
          query: '',
          pagenum: 1, // 用户列表页数
          pagesize: 2 // 用户列表显示条数
        },
        usersList: [], // 用户列表
        total: 0,
        addDialogVisible: false, // 控制添加用户对话框的显隐
        addUserForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        UserRule: {
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
          ],
          email: [
            {
              required: true,
              message: '请输入邮箱',
              trigger: 'blur'
            },
            {
              validator: checkEmail,
              trigger: 'blur'
            }],
          mobile: [
            {
              required: true,
              message: '请输入手机号',
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }]
        },
        modifyDialogVisible: false, // 控制修改用户对话框的显隐
        modifyUserForm: {}, // 用户原信息
        setDialogVisible: false,
        userInfo: {}, // 用户信息
        rolesList: [],
        roleSelectId: ''
      }
    },
    created () {
      this.getUsersList()
    },
    methods: {
      async getUsersList () { // 请求用户列表数据
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败！')
        }
        this.usersList = res.data.users
        this.total = res.data.total
      },
      handleSizeChange (newSize) { // 改变页面展示数量条数
        this.queryInfo.pagesize = newSize
        this.getUsersList()
      },
      handleCurrentChange (newPage) { // 改变页码值变化
        this.queryInfo.pagenum = newPage
        this.getUsersList()
      },
      async userState (newState) { // 监听switch状态改变
        const { data: res } = await this.$http.put(`users/${newState.id}/state/${newState.mg_state}`)
        if (res.meta.status !== 200) return this.$message.error('用户状态更新失败！')
        this.$message.success('用户状态更新成功')
      },
      addDialogClose () { // 监听用户对话框的关闭
        this.$refs.addUserRef.resetFields() // 清空
      },
      modifyDialogClose () {
        this.$refs.modifyUserRef.resetFields() // 清空
      },
      addUser () { // 添加用户
        this.$refs.addUserRef.validate(async valid => {
          if (!valid) return // 如果预验证规则不通过，直接返回
          const { data: res } = await this.$http.post('users', this.addUserForm)
          if (res.meta.status !== 201) return this.$message.error('添加用户失败！')
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUsersList()
        })
      },
      async modifyUser (id) { // 获取用户原信息以便修改
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取用户原信息失败！')
        this.$message.success('获取用户信息成功')
        this.modifyUserForm = res.data
        this.modifyDialogVisible = true
      },
      updateUser () { // 更新编辑的用户信息
        this.$refs.modifyUserRef.validate(async valid => {
          if (!valid) return // 如果预验证规则不通过，直接返回
          const { data: res } = await this.$http.put('users/' + this.modifyUserForm.id, this.modifyUserForm)
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('更新用户信息失败！')
          this.$message.success('更新用户信息成功')
          this.modifyDialogVisible = false
          this.getUsersList()
        })
      },
      async deleteUser (id) { // 删除用户
        const confirmRes = await this.$confirm('是否确定永久删除该用户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
        this.$message.success('删除用户成功')
        this.getUsersList()
      },
      async setRole (userInfo) { // 获取可选择角色
        this.userInfo = userInfo
        this.roleSelectId = ''
        this.setDialogVisible = true
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.$message.success('获取角色列表成功')
        this.rolesList = res.data
      },
      async updateRole () { // 更新用户角色
        if (!this.roleSelectId) return this.$message.error('请选择要分配的角色')
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.roleSelectId })
        if (res.meta.status === 400) {
          this.setDialogVisible = false
          return this.$message.error('不允许修改admin账户')
        }
        if (res.meta.status !== 200) return this.$message.error('更新用户角色失败')
        this.$message.success('更新用户角色成功')
        this.setDialogVisible = false
        this.getUsersList()
      }
    }
  }
</script>

<style scoped>

</style>
