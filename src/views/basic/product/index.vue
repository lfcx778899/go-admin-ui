<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">

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
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称">
        <el-input
          v-model="queryParams.product_name"
          placeholder="请输入供应商名称"
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
          v-permisaction="['productinformation:productinformation:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="productinformationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permisaction="['productinformation:productinformation:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-permisaction="['productinformation:productinformation:remove']"
            size="mini"
            type="text"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品类别" prop="productType">
          <el-input v-model="form.productType" placeholder="产品类别" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="产品名称" />
        </el-form-item>
        <el-form-item label="产品英文名称" prop="productEnglishName">
          <el-input v-model="form.productEnglishName" placeholder="产品英文名称" />
        </el-form-item>
        <el-form-item label="CASNO号" prop="productCasno">
          <el-input v-model="form.productCasno" placeholder="CASNO号" />
        </el-form-item>
        <el-form-item label="货号" prop="productItemNumber">
          <el-input v-model="form.productItemNumber" placeholder="货号" />
        </el-form-item>
        <el-form-item label="品牌" prop="productBrandName">
          <el-input v-model="form.productBrandName" placeholder="品牌" />
        </el-form-item>
        <el-form-item label="产品规格" prop="productSpecifications">
          <el-input v-model="form.productSpecifications" placeholder="产品规格" />
        </el-form-item>
        <el-form-item label="产品单位" prop="productUnits">
          <el-input v-model="form.productUnits" placeholder="产品单位" />
        </el-form-item>
        <el-form-item label="条形码" prop="productBarcode">
          <el-input v-model="form.productBarcode" placeholder="条形码" />
        </el-form-item>
        <el-form-item label="包装规格" prop="packageSize">
          <el-input v-model="form.packageSize" placeholder="包装规格" />
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
import { getProductPage, create, deleteSupplier, updateSupplier, changeStatus } from '@/api/basic/product'
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
      rules: {}
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
        console.log(resp)
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
        productId: undefined,
        productType: undefined,
        productName: undefined,
        productEnglishName: undefined,
        productCasno: undefined,
        productItemNumber: undefined,
        productBrandName: undefined,
        productSpecifications: undefined,
        productUnits: undefined,
        productBarcode: undefined,
        packageSize: undefined,
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
      const id = row.id || this.ids
      getProductInformation(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '编辑商品'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateProductInformation(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addProductInformation(this.form).then(response => {
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
      const Ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delProductInformation(Ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>

<style scoped>

</style>
