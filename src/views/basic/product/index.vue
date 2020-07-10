<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">

      <el-form-item label="产品类别">
        <el-select
          v-model="queryParams.product_type"
          placeholder="产品类别"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in productTypeList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称">
        <el-input
          v-model="queryParams.product_name"
          placeholder="请输入产品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品ID" prop="product_id" width="300" />
      <el-table-column label="产品类别" prop="product_type" width="150" />
      <el-table-column label="产品名称" prop="product_name" width="250" />
      <el-table-column label="英文名称" prop="product_english_name" width="100" />
      <el-table-column label="CASNO号" prop="product_casno" width="120" />
      <el-table-column label="货号" prop="product_item_number" width="120" />
      <el-table-column label="品牌" prop="product_brand_name" width="120" />
      <el-table-column label="规格" prop="product_specifications" width="120" />
      <el-table-column label="单位" prop="product_units" width="120" />
      <el-table-column label="备注" prop="remark" width="120" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            size="small"
            type="warning"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="产品类别" prop="product_type">
          <el-select
            v-model="form.product_type"
            placeholder="产品类别"
            clearable
            style="width: 360px"
          >
            <el-option
              v-for="dict in productTypeList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="产品名称" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="产品英文名称" prop="product_english_name">
          <el-input v-model="form.product_english_name" placeholder="产品英文名称" />
        </el-form-item>
        <el-form-item label="CASNO号" prop="product_casno">
          <el-input v-model="form.product_casno" placeholder="CASNO号" />
        </el-form-item>
        <el-form-item label="货号" prop="product_item_number">
          <el-input v-model="form.product_item_number" placeholder="货号" />
        </el-form-item>
        <el-form-item label="品牌" prop="product_brand_name">
          <el-input v-model="form.product_brand_name" placeholder="品牌" />
        </el-form-item>
        <el-form-item label="产品规格" prop="product_specifications">
          <el-input v-model="form.product_specifications" placeholder="产品规格" />
        </el-form-item>
        <el-form-item label="产品单位" prop="product_units">
          <el-input v-model="form.product_units" placeholder="产品单位" />
        </el-form-item>
        <el-form-item label="条形码" prop="product_barcode">
          <el-input v-model="form.product_barcode" placeholder="条形码" />
        </el-form-item>
        <el-form-item label="包装规格" prop="package_size">
          <el-input v-model="form.package_size" placeholder="包装规格" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getProductPage, create, deleteProduct, updateProduct, getProduct } from '@/api/basic/product'
import { getDicts } from '@/api/system/dict/data'
export default {
  name: 'Index',
  data() {
    return {
      loading: false,
      single: true,
      multiple: true,
      title: '',
      open: false,
      isEdit: false,
      queryParams: {
        product_type: '',
        product_name: '',
        pageIndex: 1,
        pageSize: 20
      },
      productTypeList: [],
      form: {},
      rules: {
        product_type:[{ required: true, message: '商品类型不能为空', trigger: 'blur' }],
        product_name:[{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
      },
      productList:[],
      total:0,
    }
  },
  created() {
    // 获取产品类别
    getDicts('goods_type').then(response => {
      this.productTypeList = response.data
    })
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      getProductPage(this.queryParams).then(resp => {
        this.productList = resp.data.items;
        this.total = resp.data.total;
        this.loading = false
      })
    },
    refreshQuery() {
      this.queryParams = { pageIndex: 1, pageSize: 20 }
      this.getList()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        product_id: undefined,
        product_type: undefined,
        product_name: undefined,
        product_english_name: undefined,
        product_casno: undefined,
        product_item_number: undefined,
        product_brand_name: undefined,
        product_specifications: undefined,
        product_units: undefined,
        product_barcode: undefined,
        package_size: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增商品'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.form = row;
      this.title = '编辑商品'
      this.open = true
      this.isEdit = true
    },
    handleDetail(row){
      sessionStorage.setItem("productId",row.id);
      this.$router.push({path:'/basic/productdetail'})
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateProduct(this.form.id,this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            create(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除商品"' + row.product_name + '"?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=> {
        deleteProduct(row.id).then(resp=>{
          if (resp.code === 200) {
            this.msgSuccess('删除成功')
            this.getList()
          } else {
            this.msgError(resp.msg)
          }
        })

      })
    }
  }
}
</script>

<style scoped>

</style>
