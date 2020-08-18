<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
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
        <el-select
          v-model="queryParams.product_name"
          placeholder="产品名称"
          clearable
          filterable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="product in selectProductList"
            :key="product.id"
            :label="product.product_name"
            :value="product.product_name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="库位名称">
        <el-select
          v-model="queryParams.product_name"
          placeholder="库位名称"
          clearable
          filterable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="product in locationList"
            :key="product.id"
            :label="product.location_name"
            :value="product.location_name"
          />
        </el-select>
      </el-form-item>
      <!--<el-form-item label="产品名称">-->
        <!--<el-input-->
          <!--v-model="queryParams.product_name"-->
          <!--placeholder="请输入产品名称"-->
          <!--clearable-->
          <!--size="small"-->
          <!--style="width: 240px"-->
        <!--/>-->
      <!--</el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--<el-row :gutter="10" class="mb8">-->
      <!--<el-col :span="1.5">-->
        <!--<el-button-->
          <!--type="primary"-->
          <!--icon="el-icon-plus"-->
          <!--size="mini"-->
          <!--@click="handleAdd"-->
        <!--&gt;新增-->
        <!--</el-button>-->
      <!--</el-col>-->
    <!--</el-row>-->

    <el-table v-loading="loading" :data="controlList">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="产品类别" align="center" prop="product_type" />
      <el-table-column label="产品名称" align="center" prop="product_name"/>
      <el-table-column label="规格" prop="product_specifications"/>
      <el-table-column label="单位" prop="product_units" width="120" />
      <el-table-column label="库存数量" align="center" prop="inventory_quantity" width="120"/>
      <el-table-column label="预警数量" align="center" prop="safety_inventory" width="120"/>
      <el-table-column label="存储位置" align="center" prop="location_name" width="120"/>
      <!--<el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
      <!--<template slot-scope="scope">-->
      <!--<el-button-->
      <!--size="mini"-->
      <!--type="text"-->
      <!--icon="el-icon-edit"-->
      <!--@click="handleUpdate(scope.row)"-->
      <!--&gt;修改</el-button>-->
      <!--<el-button-->
      <!--size="mini"-->
      <!--type="text"-->
      <!--icon="el-icon-delete"-->
      <!--@click="handleDelete(scope.row)"-->
      <!--&gt;删除</el-button>-->
      <!--</template>-->
      <!--</el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入库存位置" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="库存数量" prop="inventoryQuantity">
          <el-input-number :min="0" :step="1" v-model="form.inventoryQuantity" placeholder="请输入库存数量" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="预警数量" prop="safetyInventory">
          <el-input-number :min="0" :step="1" v-model="form.safetyInventory" placeholder="请输入安全库存" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="库存位置" prop="storageLocation">
          <el-input v-model="form.storageLocation" placeholder="请输入库存位置" style="width: 360px"/>
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
  import { getControlPage } from '@/api/inventory/control'
  import { getDicts } from '@/api/system/dict/data'
  import { getAll } from '@/api/basic/product'
  import { getAll as getAllLocation } from '@/api/basic/location'
  export default {
    name: 'Index',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 【请填写功能名称】表格数据
        controlList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageIndex: 1,
          pageSize: 10
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {},
        productTypeList:[],
        productList:[],
        selectProductList:[],
        locationList:[],
      }
    },
    created() {
      getDicts('goods_type').then(response => {
        this.productTypeList = response.data
      })
      getAll().then(response => {
        this.productList = response.data.items
        this.selectProductList = this.productList
      })
      getAllLocation().then(resp=>{
        this.locationList = resp.data.items
      })
      this.getList()
    },
    methods: {
      getList() {
        this.loading = true
        getControlPage(this.queryParams).then(response => {
          this.controlList = response.data.items
          this.total = response.data.total
          this.loading = false
        })
      },
      changeProductName() {
        this.selectProductList = this.productList.filter(item => {
          return item.product_type === this.queryParams.product_type
        })
        this.queryParams.product_name = ''
      },
      cancel() {
        this.open = false
        this.reset()
      },
      reset() {
        this.form = {
          id: undefined,
          productId: undefined,
          inventoryQuantity: undefined,
          safetyInventory: undefined,
          storageLocation: undefined,
          remark: undefined,
          createBy: undefined,
          updateBy: undefined,
          createdAt: undefined,
          updatedAt: undefined
        }
        this.resetForm('form')
      },
      handleQuery() {
        this.queryParams.pageIndex = 1
        this.getList()
      },
      resetQuery() {
        this.queryParams = {
          pageIndex: 1,
            pageSize: 10
        }
        this.handleQuery()
      },
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加库存记录'
      },
      handleUpdate(row) {
        this.reset()
        const id = row.id || this.ids
        getControl(id).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改【请填写功能名称】'
        })
      },
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateControl(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                }
              })
            } else {
              addControl(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('新增成功')
                  this.open = false
                  this.getList()
                }
              })
            }
          }
        })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids
        this.$confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delControl(ids)
        }).then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      }
    }
  }
</script>

<style scoped>

</style>
