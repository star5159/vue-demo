<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加新角色</el-button>
      <el-table :data="rolesList" :stripe="true" :border="true">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :key="item1.id" v-for="(item1,i1) in scope.row.children"
                    :class="['tree-bottom', i1 === 0 ? 'tree-top' : '', 'vertical-center']">
              <el-col :span="4">
                <el-tag closable @close="removeRoleRights(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row :key="item2.id" v-for="(item2,i2) in item1.children"
                        :class="[i2 === 0 ? '' : 'tree-top', 'vertical-center']">
                  <el-col :span="5">
                    <el-tag type="success" closable @close="removeRoleRights(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-tag type="warning" :key="item3.id" v-for="item3 in item2.children" closable
                            @close="removeRoleRights(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="500px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="modifyRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="distributionRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="35%" @close="addDialogClose">
      <el-form ref="addRoleRef" :model="addRoleForm" label-width="100px" :rules="RoleRule">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色的对话框-->
    <el-dialog title="修改角色" :visible.sync="modifyDialogVisible" width="35%" @close="modifyDialogClose">
      <el-form ref="modifyRoleRef" :model="modifyRoleForm" label-width="100px" :rules="RoleRule">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="modifyRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="modifyRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色权限对话框-->
    <el-dialog title="分配角色权限" :visible.sync="setDialogVisible" width="35%">
      <el-tree :data="rightsTree" :props="treeProps" show-checkbox :default-expand-all="true"
               :default-checked-keys="rightsKey" node-key="id" ref="treeRef"></el-tree>
      <el-button @click="setDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="updateRights">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'roles',
    data () {
      return {
        rolesList: [],
        addRoleForm: {
          roleName: '',
          roleDesc: ''
        },
        addDialogVisible: false, // 添加对话框
        modifyDialogVisible: false, // 修改对话框
        setDialogVisible: false, // 分配对话框
        RoleRule: {
          roleName: [
            {
              required: true,
              message: '请输入角色名称',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          roleDesc: [
            {
              message: '请输入角色描述',
              trigger: 'blur'
            }
          ]
        },
        modifyRoleForm: {}, // 角色原信息
        rightsTree: [],
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        rightsKey: [],
        roleId: '' // 角色id
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      async getRolesList () { // 获取角色列表及其拥有权限
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.$message.success('获取角色列表成功')
        this.rolesList = res.data
      },
      async removeRoleRights (role, rightsId) { // 删除角色权限
        const confirmRes = await this.$confirm('是否确定永久删除该角色权限?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色权限失败！')
        this.$message.success('删除角色权限成功')
        role.children = res.data
      },
      addDialogClose () { // 监听用户对话框的关闭
        this.$refs.addRoleRef.resetFields() // 清空
      },
      modifyDialogClose () {
        this.$refs.modifyRoleRef.resetFields() // 清空
      },
      addRole () { // 添加角色
        this.$refs.addRoleRef.validate(async valid => {
          if (!valid) return // 如果预验证规则不通过，直接返回
          const { data: res } = await this.$http.post('roles', this.addRoleForm)
          if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
          this.$message.success('添加角色成功')
          this.addDialogVisible = false
          this.getRolesList()
        })
      },
      async modifyRole (id) { // 获取角色原信息
        const { data: res } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取角色原信息失败！')
        this.$message.success('获取角色原信息成功')
        this.modifyRoleForm = res.data
        this.modifyDialogVisible = true
      },
      updateRole () { // 更新角色信息
        this.$refs.modifyRoleRef.validate(async valid => {
          if (!valid) return // 如果预验证规则不通过，直接返回
          const { data: res } = await this.$http.put('roles/' + this.modifyRoleForm.roleId, this.modifyRoleForm)
          if (res.meta.status !== 200) return this.$message.error('更新角色信息失败！')
          this.$message.success('更新角色信息成功')
          this.modifyDialogVisible = false
          this.getRolesList()
        })
      },
      async deleteRole (id) { // 删除角色
        const confirmRes = await this.$confirm('是否确定永久删除该角色?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
        this.$message.success('删除角色成功')
        this.getRolesList()
      },
      async distributionRights (role) { // 获取角色原权限信息
        this.roleId = role.id
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取角色原权限失败')
        this.$message.success('获取角色权限成功')
        this.rightsTree = res.data
        this.rightsKey = []
        this.getRights(role, this.rightsKey)
        this.setDialogVisible = true
      },
      getRights (node, arr) { // 获取角色权限叶子节点
        if (node.children === undefined) return arr.push(node.id)
        node.children.forEach(item => this.getRights(item, arr))
      },
      async updateRights () { // 更新角色权限
        const keysId = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
        console.log(keysId)
        const idStr = keysId.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) return this.$message.error('权限更新失败')
        this.$message.success('权限更新成功')
        this.setDialogVisible = false
        this.getRolesList()
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 10px;
  }

  .tree-top {
    border-top: 1px solid #dddddd;
  }

  .tree-bottom {
    border-bottom: 1px solid #dddddd;
  }

  .vertical-center {
    display: flex;
    align-items: center;
  }
</style>
