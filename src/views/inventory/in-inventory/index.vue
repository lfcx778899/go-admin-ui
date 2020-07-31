<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="采购单号">
        <el-input v-model="queryParams.purchase_control_id" style="width: 200px"></el-input>
      </el-form-item>
      <el-form-item label="供应商">
        <el-select
          v-model="queryParams.supplier_id"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in inUseSupplier"
            :key="dict.id"
            :label="dict.supplier_name"
            :value="dict.supplier_id"
          />
        </el-select>
      </el-form-item>
      <!--<el-form-item label="产品类别">-->
      <!--<el-select-->
      <!--v-model="queryParams.product_type"-->
      <!--placeholder="产品类别"-->
      <!--clearable-->
      <!--size="small"-->
      <!--style="width: 240px"-->
      <!--&gt;-->
      <!--<el-option-->
      <!--v-for="dict in productTypeList"-->
      <!--:key="dict.dictValue"-->
      <!--:label="dict.dictLabel"-->
      <!--:value="dict.dictLabel"-->
      <!--/>-->
      <!--</el-select>-->
      <!--</el-form-item>-->
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

    <el-table v-loading="loading" :data="purchasecontrolList">
      <el-table-column label="采购单号" prop="purchase_control_id"/>
      <el-table-column label="采购时间" prop="created_at" width="200">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商" prop="supplier_name" width="120"/>
      <el-table-column label="采购数量" prop="totalpruchase_quantity" width="120"/>
      <el-table-column label="已入库数量" prop="storaged_total_quantity" width="120"/>
      <el-table-column label="采购金额" prop="totalamount_without_tax" width="120"/>
      <el-table-column label="已入库金额" prop="storaged_amount_without_tax" width="120"/>
      <el-table-column label="状态" prop="purchase_status" width="120">
        <template slot-scope="scope">
          <span>{{getStatusName(scope.row.purchase_status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleDetail(scope.row)"
          >详情</el-button>
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
  </div>
</template>

<script>
  import { getDicts } from '@/api/system/dict/data'
  import { getInUseSupplier } from '@/api/basic/supplier'
  import { getPurchaseControlPage } from '@/api/purchase/purchaseControl'

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
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        isEdit: false,
        // 类型数据字典
        typeOptions: [],

        // 查询参数
        queryParams: {
          purchase_status:'2,3,4',
          pageIndex: 1,
          pageSize: 10,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {},
        inUseSupplier:[],
        purchasecontrolList:[],
      }
    },
    created() {
      getDicts('goods_type').then(response => {
        this.productTypeList = response.data
      })
      getDicts('purchase_status').then(response => {
        this.orderStatusList = response.data
      })
      getInUseSupplier().then(resp => {
        this.inUseSupplier = resp.data.items
      })
      this.getList()

    },
    methods: {
      /** 查询参数列表 */
      getList() {
        this.loading = true
        getPurchaseControlPage(this.queryParams).then(response => {
            this.purchasecontrolList = response.data.items
            this.total = response.data.total
            this.loading = false
          }
        )
      },
      getStatusName(statusId){
        if(statusId ===1){
          return "新建"
        }
        if(statusId ===2){
          return "确认采购"
        }
        if(statusId ===3){
          return "已入库"
        }
        if(statusId ===4){
          return "部分入库"
        }
        if(statusId ===5){
          return "待付款"
        }
        if(statusId ===6){
          return "已付款"
        }
        return ""
      },
      handleDetail(row){
        sessionStorage.setItem('purchaseControlId', row.purchase_control_id)
        this.$router.push({ path: '/inventory/ininventory/detail' })
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
          purchaseControlId: undefined,
          purchaseStatus: undefined,
          supplierId: undefined,
          totalamountWithoutTax: undefined,
          contractAdress: undefined,
          purchaseOrderTime: undefined,
          paymentTime: undefined,
          storagedTotalQuantity: undefined,
          storagedAmountWithoutTax: undefined,
          storagedFinishedTime: undefined,
          paymentRelatedAdress: undefined,
          remark: undefined,
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
        this.dateRange = []
        this.queryParams = {
          purchase_status:'2,3,4',
            pageIndex: 1,
            pageSize: 10,
        }
        this.handleQuery()
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加PurchaseControl'
        this.isEdit = false
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const id = row.id || this.ids
        getPurchaseControl(id).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改PurchaseControl'
          this.isEdit = true
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.id !== undefined) {
              updatePurchaseControl(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addPurchaseControl(this.form).then(response => {
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
          return delPurchaseControl(Ids)
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
