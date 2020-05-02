<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form ref="addGoodsRef" :model="addGoodsForm" label-width="120px" :rules="GoodsRule" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTab" @tab-click="tabChange">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addGoodsForm.goods_cat" :options="cateList" :props="cateProps"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <p v-if="manyParameter.length === 0">此商品暂无相关参数</p>
            <el-form-item v-for="item in manyParameter" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" v-for="(val,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <p v-if="onlyParameter.length === 0">此商品暂无相关属性</p>
            <el-form-item v-for="item in onlyParameter" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="actionUrl" :on-preview="handlePreview" :on-remove="handleRemove"
                       :on-success="handleSuccess"
                       list-type="picture" :headers="headers">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览显示框-->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="picUrl" alt="图片" class="previewImg"/>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'addGoods',
    data () {
      return {
        activeIndex: '0', // Tab索引
        addGoodsForm: {
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_cat: [], // 商品分类对应的id
          goods_introduce: '',
          pics: [], // 上传的图片临时路径
          attrs: [] // 商品的参数，包含动态参数和静态属性
        },
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
          }],
          goods_cat: [{
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }]
        },
        cateList: [],
        cateProps: { // 级联选择器属性
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id'
        },
        manyParameter: [], // 商品动态参数
        onlyParameter: [], // 商品静态属性
        validate: true, // 预验证结果
        actionUrl: 'http://127.0.0.1:8888/api/private/v1/upload', // 图片上传的请求地址
        headers: { // upload请求头
          Authorization: window.sessionStorage.getItem('token')
        },
        picDialogVisible: false,
        picUrl: '' // 预览图的url
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      async getCateList () { // 获取商品分类列表
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
        this.$message.success('获取商品分类列表成功')
        this.cateList = res.data
      },
      beforeTab (activeName, oldActiveName) { // 切换Tab前先验证
        if (oldActiveName === '0') {
          this.$refs.addGoodsRef.validate(valid => {
            this.validate = valid
          })
          if (!this.validate) {
            this.$message.error('请将必填信息补充完整')
            return false
          }
        }
      },
      async tabChange () {
        if (this.activeIndex === '1') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          if (res.meta.status !== 200) return this.$message.error('获取商品动态参数失败')
          this.$message.success('获取商品动态参数成功')
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          this.manyParameter = res.data
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          if (res.meta.status !== 200) return this.$message.error('获取商品静态属性失败')
          this.$message.success('获取商品静态属性成功')
          this.onlyParameter = res.data
        }
      },
      handlePreview (file) {
        this.picUrl = file.response.data.url
        this.picDialogVisible = true
      },
      handleRemove (file) {
        const picInfo = file.response.data.tmp_path
        const index = this.addGoodsForm.pics.findIndex(x => x.pic === picInfo)
        this.addGoodsForm.pics.splice(index, 1)
      },
      handleSuccess (response) {
        const picInfo = { pic: response.data.tmp_path }
        this.addGoodsForm.pics.push(picInfo)
      },
      async addGoods () {
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',') // 将分类列表id处理成字符串
        this.manyParameter.forEach(item => { // 添加商品动态参数
          const manyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          form.attrs.push(manyInfo)
        })
        this.onlyParameter.forEach(item => { // 添加商品静态属性
          const onlyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          form.attrs.push(onlyInfo)
        })
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        console.log(res.data)
        this.$router.push('/goods')
      }
    },
    computed: {
      cateId () {
        if (this.addGoodsForm.goods_cat.length === 3) {
          return this.addGoodsForm.goods_cat[2]
        } else if (this.addGoodsForm.goods_cat.length === 2) {
          return this.addGoodsForm.goods_cat[1]
        } else {
          return null
        }
      }
    }
  }
</script>

<style scoped>
  .el-checkbox {
    margin: 0 15px !important;
  }

  .previewImg {
    width: 100%;
  }

  .btn {
    margin: 10px;
  }
</style>
