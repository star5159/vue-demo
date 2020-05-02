<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <!--搜索框-->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品表格-->
      <el-table :data="goodsList" :stripe="true" :border="true" :cell-style="nameCol">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" class="nameTable"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="130px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!--编辑商品按钮-->
            <el-button type="primary" icon="el-icon-edit" @click="modifyGoods(scope.row.goods_id)"></el-button>
            <!--删除商品按钮-->
            <el-button type="danger" icon="el-icon-delete" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div style="text-align: center">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page="queryInfo.pagenum"
                       :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </div>
    </el-card>
    <!--修改商品的对话框-->
    <el-dialog title="修改商品" :visible.sync="modifyDialogVisible" width="35%" @close="modifyDialogClose">
      <el-form ref="modifyGoodsRef" :model="modifyGoodsForm" label-width="100px" :rules="GoodsRule">
        <el-form-item label="商品名称">
          <el-input v-model="modifyGoodsForm.goods_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="modifyGoodsForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="modifyGoodsForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="modifyGoodsForm.goods_number" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'list',
    data () {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        goodsList: [],
        total: 0,
        modifyDialogVisible: false,
        modifyGoodsForm: {},
        GoodsRule: {
          goods_name: [{
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }],
          goods_price: [{
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }],
          goods_number: [{
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }],
          goods_weight: [{
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }]
        },
        modifyId: 0
      }
    },
    created () {
      this.getGoodsList()
    },
    methods: {
      async getGoodsList () {
        const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
        this.$message.success('获取商品列表成功')
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      handleSizeChange (newSize) { // 改变页面展示数量条数
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange (newPage) { // 改变页码值变化
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      async modifyGoods (id) {
        this.modifyId = id
        const { data: res } = await this.$http.get('goods/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取商品信息失败')
        this.$message.success('获取商品信息成功')
        this.modifyGoodsForm = res.data
        this.modifyDialogVisible = true
      },
      modifyDialogClose () {
        this.$refs.modifyGoodsRef.resetFields() // 清空
      },
      updateGoods () {
        this.$refs.modifyGoodsRef.validate(async valid => {
          if (!valid) return this.$message.error('请将必填信息补充完整')
          const { data: res } = await this.$http.put('goods/' + this.modifyId, this.modifyGoodsForm)
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('更新商品信息失败')
          this.$message.success('更新商品信息成功')
          this.modifyDialogVisible = false
          this.getGoodsList()
        })
      },
      async deleteGoods (id) {
        const confirmRes = await this.$confirm('是否永远删除该商品？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
        this.$message.success('删除商品成功')
        this.getGoodsList()
      },
      goAddGoods () {
        this.$router.push('goods/addGoods')
      },
      nameCol ({ row, column, rowIndex, columnIndex }) { // 控制el-table单列样式
        if (columnIndex === 1) {
          // 指定列号
          return 'text-align: left;'
        } else {
          return ''
        }
      }
    }
  }
</script>

<style scoped>

</style>
