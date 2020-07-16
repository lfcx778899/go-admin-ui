<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="归属部门" prop="deptId">
        <treeselect
          v-model="queryParams.dept_id"
          :options="deptOptions"
          :normalizer="normalizer"
          placeholder="请选择归属部门"
          style="width: 240px"
        />
      </el-form-item>
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
      <el-form-item label="供应商名称">
        <el-select
          v-model="queryParams.supplier_id"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in inUseSupplier"
            :key="dict.id"
            :label="dict.supplier_name"
            :value="dict.supplier_id"
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
          icon="el-icon-check"
          size="small"
          @click="handleQuotation"
        >创建询价单
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-d-arrow-right"
          size="small"
          @click="handleAllCreate"
        >全部询价
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-close"
          size="small"
          @click="handleCreatePurchaseControl"
        >生成采购单
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="purchaserequestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>

      <el-table-column label="申请时间" prop="created_at" width="200">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门名称" prop="dept_name" width="120"/>
      <el-table-column label="产品类别" prop="product_type"  width="120"/>
      <el-table-column label="产品名称" prop="product_name"  width="120"/>
      <el-table-column label="申请数量" prop="requests_quantity" width="120"/>
      <el-table-column label="供应商" prop="supplier_names"/>
      <el-table-column label="状态" prop="requests_status" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存数量" prop="inventory_quantity" width="120"/>
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="360">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===3"
                     size="small"
                     type="warning"
                     icon="el-icon-close"
                     @click="handleSingleReject(scope.row)"
          >取消采购
          </el-button>
          <el-button v-if="scope.row.requests_status===3"
                     size="small"
                     type="primary"
                     icon="el-icon-check"
                     @click="handleCheckSupplier(scope.row)"
          >确认
          </el-button>
          <el-button v-if="scope.row.requests_status===3 || scope.row.requests_status===5"
                     size="small"
                     type="success"
                     icon="el-icon-view"
                     @click="handleDetail(scope.row)"
          >修改供应商
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

  </div>
</template>

<script>
  import { getDeptList } from '@/api/system/dept'
  import { treeselect } from '@/api/system/dept'
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import { getDicts } from '@/api/system/dict/data'
  import { getAll } from '@/api/basic/product'
  import { getApprovals, create, deleteItem, updateItem, updateStatus } from '@/api/purchase/apply'
  import { getInUseSupplier } from '@/api/basic/supplier'
  import { createQuotationControl, createAll } from '@/api/purchase/quotationControl'
  import { createPurchaseControl } from '@/api/purchase/purchaseControl'

  export default {
    name: 'Index',
    components: { Treeselect },
    data() {
      return {
        // 遮罩层
        loading: false,
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
        productList: [],
        selectProductList: [],
        purchaserequestsList: [],
        productTypeList: [],
        // 查询参数
        queryParams: {
          requests_statuss: '3,4,5,6',
          pageIndex: 1,
          pageSize: 10
        },
        statusList: [],
        orderStatusList: [],
        rules: {},
        selectRows: [],
        inUseSupplier: [],
        deptOptions: undefined
      }
    },
    created() {
      this.getTreeselect()
      getDicts('goods_type').then(response => {
        this.productTypeList = response.data
      })
      getAll().then(response => {
        this.productList = response.data.items
        this.selectProductList = this.productList
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
      getTreeselect() {
        treeselect().then(response => {
          this.deptOptions = response.data
        })
      },
      changeProductName() {
        this.selectProductList = this.productList.filter(item => {
          return item.product_type === this.queryParams.product_type
        })
        this.queryParams.product_name = undefined
      },
      handleSelectionChange(selection) {
        this.selectRows = selection
        this.ids = selection.map(item => item.id)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.deptId,
          label: node.deptName,
          children: node.children
        }
      },
      getList() {
        this.loading = true
        getApprovals(this.queryParams).then(response => {
            let tempList = []
            if (response.data && response.data.items && response.data.items.length > 0) {
              response.data.items.forEach(item => {
                this.orderStatusList.forEach(si => {
                  if (si.dictValue === String(item.requests_status)) {
                    tempList.push({ ...item, statusName: si.dictLabel })
                  }
                })
              })
            }
            this.purchaserequestsList = tempList
            this.total = response.data.total
            this.loading = false
          }
        )
      },
      handleQuery() {
        this.queryParams.pageIndex = 1
        this.getList()
      },
      resetQuery() {
        this.queryParams = {
          requests_statuss: '3,4,5,6',
          pageIndex: 1,
          pageSize: 10
        }
        this.resetForm('queryForm')
        this.handleQuery()
      },
      handleReject() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 2) {
            ids.push(item.id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认取消' + ids.length + '条采购申请?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let idStr = ids.join(',')
            updateStatus(idStr, { requests_status: 4 }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      },
      handleCheckSupplier(row) {
        let supplierIds = row.supplier_ids
        if (supplierIds.indexOf(',') > -1) {
          this.msgError('可选供应商超过一个，不能进行确认')
          return false
        }
        updateStatus(row.id, { requests_status: 6 }).then(response => {
          if (response.code === 200) {
            this.msgSuccess('操作成功')
            this.open = false
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      },
      handleSingleReject(row) {
        this.$confirm('是否确认取消采购 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, { requests_status: 4 }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      },
      handleDetail(row) {
        sessionStorage.setItem('purchaseRequestId', row.id)
        this.$router.push({ path: '/purchase/before-pur/detail' })
      },
      handleAllCreate() {
        this.$confirm('是否确认全部询价 ?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const createData = {
            remark: ''
          }
          createAll(createData).then(response => {
            if (response.code === 200) {
              this.msgSuccess('操作成功')
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        })
      },
      handleCreatePurchaseControl() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 6) {
            ids.push(item.purchase_request_id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认生成采购单?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            createPurchaseControl({ purchase_request_ids: ids }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      },
      handleQuotation() {
        let ids = []
        this.selectRows.forEach(item => {
          if (item.requests_status === 3) {
            ids.push(item.purchase_request_id)
          }
        })
        if (ids.length > 0) {
          this.$confirm('是否确认生成询价单?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            createQuotationControl({ purchase_request_ids: ids }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('操作成功')
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          })
        } else {
          this.msgInfo('没有选择可以操作的数据')
        }
      }
    }
  }
</script>

<style scoped>

</style>
