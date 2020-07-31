<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="状态" prop="requests_statuss">
        <el-select
          v-model="queryParams.requests_status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in orderStatusList"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="产品类别">
        <el-select
          v-model="queryParams.product_type"
          placeholder="产品类别"
          clearable
          size="small"
          style="width: 240px"
          @change="changeProductName"
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
        <el-select
          v-model="queryParams.product_name"
          placeholder="产品名称"
          clearable
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
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="multiple"
          @click="handleApplyOrder"
        >提交
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="requestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="领用单号" align="center" prop="id"/>
      <el-table-column label="领用日期" align="center">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品类别" align="center" prop="product_type"/>
      <el-table-column label="产品名称" align="center" prop="product_name"/>
      <el-table-column label="申请数量" align="center" prop="requests_quantity"/>
      <el-table-column label="采购状态" align="center">
        <template slot-scope="scope">
          <span>{{getStatusName(scope.row.requests_status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" align="center" prop="create_by_name"/>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===1"
                     size="small"
                     type="primary"
                     icon="el-icon-edit"
                     @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button v-if="scope.row.requests_status===1"
                     size="small"
                     type="warning"
                     icon="el-icon-delete"
                     @click="handleDelete(scope.row)"
          >删除
          </el-button>
          <el-button v-if="scope.row.requests_status===3"
                     size="small"
                     type="warning"
                     icon="el-icon-delete"
                     @click="handleReceive(scope.row)"
          >确认收货
          </el-button>
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品类别">
          <el-select
            v-model="form.product_type"
            placeholder="产品类别"
            clearable
            size="small"
            style="width: 360px"
            @change="changeAddProductType"
            :disabled="ifEdit"
          >
            <el-option
              v-for="dict in productTypeList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictLabel"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称" prop="product_id">
          <el-select
            v-model="form.product_id"
            placeholder="请选择产品"
            clearable
            size="small"
            style="width: 360px"
            :disabled="ifEdit"
          >
            <el-option
              v-for="product in selectProductList"
              :key="product.id"
              :label="product.product_name"
              :value="product.product_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请数量" prop="requests_quantity">
          <el-input-number :min="0" :step="1" v-model="form.requests_quantity" placeholder="请输入申请数量" style="width: 360px"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请填写备注" style="width: 360px"/>
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
  import { getPage, updateStatus, updateItem, deleteItem, createOut } from '@/api/inventory/out'
  import { getDicts } from '@/api/system/dict/data'
  import { getAll } from '@/api/basic/product'

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
        requestsList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          requests_statuss: '1,2,3,4,5',
          product_name:'',
          product_type:'',
          pageIndex: 1,
          pageSize: 10
        },
        // 表单参数
        form: {
          product_id: '',
          product_type:'',
        },
        // 表单校验
        rules: {},
        selectProductList: [],
        productTypeList: [],
        orderStatusList: [],
        selectRows:[],
        ifEdit:false,
      }
    },
    created() {
      getDicts('goods_type').then(response => {
        this.productTypeList = response.data
      })
      getDicts('receive_status').then(response => {
        this.orderStatusList = response.data
      })
      getAll().then(response => {
        this.productList = response.data.items
        this.selectProductList = this.productList
      })
      this.getList()
    },
    methods: {
      getList() {
        this.loading = true
        getPage(this.queryParams).then(response => {
          this.requestsList = response.data.items
          this.total = response.data.total
          this.loading = false
        })
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      changeProductName() {
        this.selectProductList = this.productList.filter(item => {
          return item.product_type === this.queryParams.product_type
        })
        this.queryParams.product_name = ''
      },
      changeAddProductType() {
        this.selectProductList = this.productList.filter(item => {
          return item.product_type === this.form.product_type
        })
        this.form.product_id = ''
      },
      getStatusName(statusId) {
        if (statusId === 1) {
          return '新建'
        }
        if (statusId === 2) {
          return '已提交'
        }
        if (statusId === 3) {
          return '已出库'
        }
        if (statusId === 4) {
          return '已拒绝'
        }
        if (statusId === 5) {
          return '已完成'
        }
        return ''
      },
      handleApplyOrder(){
        let ids =[];
        this.selectRows.forEach(item=>{
          if(item.requests_status === 1){
            ids.push(item.id)
          }
        })
        if(ids.length>0){
          this.$confirm('是否确认提交' + ids.length + '条申请?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let idStr = ids.join(',');
            updateStatus(idStr, { requests_status: 2 }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        }else{
          this.msgInfo('没有选择可以操作的数据')
        }
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          inventoryControlId: undefined,
          productId: undefined,
          supplierIds: undefined,
          requestsQuantity: undefined,
          remark: undefined,
          createBy: undefined,
          updateBy: undefined,
          createdAt: undefined,
          updatedAt: undefined
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageIndex = 1
        if(this.queryParams.requests_status){
          this.queryParams.requests_statuss = this.queryParams.requests_status
        }
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.queryParams = {
          requests_statuss: '1,2,3,4,5',
            pageIndex: 1,
            pageSize: 10
        }
        this.handleQuery()
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.selectRows = selection;
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加领用申请'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const id = row.id || this.ids
        this.form = row;
        this.open = true;
        this.ifEdit = true;
        this.title = '修改领用申请'
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              let updateData = {
                product_id: String(this.form.product_id),
                remark: String(this.form.remark),
                requests_quantity: this.form.requests_quantity
              }
              updateItem(this.form.id,updateData).then(response=>{
                if (response.code === 200) {
                  this.msgSuccess('操作成功')
                  this.open = false
                  this.ifEdit = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              let createData = {
                product_id: String(this.form.product_id),
                remark: String(this.form.remark),
                requests_quantity: this.form.requests_quantity
              }
              createOut(createData).then(response => {
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
        const ids = row.id || this.ids
        this.$confirm('是否确认删除领用申请?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteItem(row.id).then(resp => {
            if (resp.code === 200) {
              this.msgSuccess('删除成功')
              this.getList()
            } else {
              this.msgError(resp.msg)
            }
          })
        })
      },
      handleReceive(row){
        this.$confirm('是否确认收货?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, { requests_status: 5 }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
