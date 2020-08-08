<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="归属部门">
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="requestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="单号" align="center" prop="id" width="100"/>
      <el-table-column label="创建日期" align="center" width="180">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请组" align="center" prop="dept_name" width="100"/>
      <el-table-column label="申请人" align="center" prop="create_by_name" width="100"/>
      <el-table-column label="状态" align="center" prop="requestsStatus" width="100">
        <template slot-scope="scope">
          <span>{{getStatusName(scope.row.requests_status)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品类别" align="center" prop="product_type" width="100"/>
      <el-table-column label="产品名称" align="center" prop="product_name" width="100"/>
      <el-table-column label="出库数量" align="center" prop="requests_quantity" width="100"/>
      <el-table-column label="操作人" align="center" prop="update_By" width="100"/>
      <el-table-column label="操作日期" align="center" width="180">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.updated_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===2"
            size="small"
            type="primary"
            icon="el-icon-check"
            @click="handleAudit(scope.row)"
          >确认出库</el-button>
          <el-button v-if="scope.row.requests_status===2"
            size="small"
            type="warning"
            icon="el-icon-close"
            @click="handleReject(scope.row)"
          >拒绝出库</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入原因" />
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
  import { treeselect } from '@/api/system/dept'
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import { getPage, updateStatus, updateItem, deleteItem, createOut } from '@/api/inventory/out'
  import { getDicts } from '@/api/system/dict/data'
  import { getAll } from '@/api/basic/product'
  import {getAll as getAllLocation} from '@/api/basic/location';
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
      // 【请填写功能名称】表格数据
      requestsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        requests_statuss: '2,3,4',
        product_name:'',
        product_type:'',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      deptOptions:undefined,
      productTypeList:[],
      orderStatusList:[],
      productList:[],
      selectProductList:[],
      rejectId:'',
      locationList:[],
    };
  },
  created() {
    this.getTreeSelect();
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
    getAllLocation().then(response=>{
      this.locationList = response.data.items;
    })
    this.getList();
  },
  methods: {
    getTreeSelect() {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
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
      getPage(this.queryParams).then(response => {
        this.requestsList = response.data.items
        this.total = response.data.total
        this.loading = false
      })
    },
    getStatusName(statusId) {
      if (statusId === 2) {
        return '待出库'
      }
      if (statusId === 3) {
        return '已出库'
      }
      if (statusId === 4) {
        return '已拒绝'
      }
      return ''
    },
    changeProductName() {
      this.selectProductList = this.productList.filter(item => {
        return item.product_type === this.queryParams.product_type
      })
      this.queryParams.product_name = ''
    },
    handleAudit(row){
      this.$confirm('是否确认出库 ?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateStatus(row.id, { requests_status: 3 }).then(response => {
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
    handleReject(row){
      this.rejectId = row.id;
      this.open = true;
      this.title = "拒绝出库原因"
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.rejectId = ''
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        inventoryControlId: undefined,
        productId: undefined,
        supplierIds: undefined,
        requestsQuantity: undefined,
        requestsStatus: "0",
        remark: undefined,
        createBy: undefined,
        updateBy: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams = {
        pageIndex: 1,
          pageSize: 10,
          requests_statuss: '2,3,4',
      };
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRequests(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let updateData = {
            remark: String(this.form.remark),
          };
          updateItem(this.rejectId,updateData).then(resp=>{
            if (resp.code === 200) {
              updateStatus(this.rejectId, { requests_status: 4 }).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('操作成功')
                  this.cancel()
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              this.msgError(resp.msg)
            }
          })
        }
      });
    },
  }
}
</script>

<style scoped>

</style>
