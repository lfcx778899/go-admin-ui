<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="状态">
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
          size="mini"
          :disabled="multiple"
          @click="handleAudit"
        >审批通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-close"
          size="mini"
          :disabled="multiple"
          @click="handleReject"
        >取消采购</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="purchaserequestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="申请时间" prop="created_at" width="200" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.created_at)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门名称" prop="dept_name"/>
      <el-table-column label="申请人" prop="create_by_name" width="120" />
      <el-table-column label="状态" prop="requests_status" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品类别" prop="product_type"/>
      <el-table-column label="产品名称" prop="product_name"/>
      <el-table-column label="申请数量" prop="requests_quantity"/>
      <el-table-column label="规格" prop="product_specifications" width="150"/>
      <el-table-column label="单位" prop="product_units"  width="150"/>
      <el-table-column label="备注" prop="remark"/>
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="360">
        <template slot-scope="scope">
          <el-button v-if="scope.row.requests_status===2"
            size="small"
            type="primary"
            icon="el-icon-check"
            @click="handleSingleAudit(scope.row)"
          >审批通过</el-button>
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button v-if="scope.row.requests_status===2"
            size="small"
            type="warning"
            icon="el-icon-close"
            @click="handleSingleReject(scope.row)"
          >取消采购</el-button>
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
  import {getDeptList} from '@/api/system/dept'
  import { treeselect } from '@/api/system/dept'
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import {getDicts} from "@/api/system/dict/data";
  import {getAll} from "@/api/basic/product";
  import {getApprovals,create,deleteItem,updateItem,updateStatus} from '@/api/purchase/apply';
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
      productList:[],
      selectProductList:[],
      purchaserequestsList:[],
      productTypeList:[],
      // 查询参数
      queryParams: {
        requests_statuss:"2,3,4",
        pageIndex: 1,
        pageSize: 10,
      },
      statusList:[],
      orderStatusList:[
        {dictLabel: "已提交", dictValue: "2"},
        {dictLabel: "已审批", dictValue: "3"},
        {dictLabel: "取消采购", dictValue: "4"}
  ],
      rules: {},
      selectRows:[],
      deptOptions: undefined,
    }
  },
  created() {
    this.getTreeselect();
    getDicts('goods_type').then(response => {
      this.productTypeList = response.data
    })
    getAll().then(response=>{
      this.productList = response.data.items;
      this.selectProductList = this.productList;
    });
    // getDicts('purchase_status').then(response => {
    //   this.orderStatusList = response.data
    // })
    this.getList();
  },
  methods:{
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    changeProductName(){
      this.selectProductList = this.productList.filter(item=>{
        return item.product_type ===this.queryParams.product_type;
      })
      this.queryParams.product_name = undefined;
    },
    handleSelectionChange(selection) {
      this.selectRows = selection;
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
    getList(){
      this.loading = true
      if(this.queryParams.requests_status){
        this.queryParams.requests_statuss=this.queryParams.requests_status;
      }else{
        this.queryParams.requests_statuss='2,3,4';
      }
      getApprovals(this.queryParams).then(response => {
          let tempList =[];
          if(response.data&&response.data.items&&response.data.items.length>0){
            response.data.items.forEach(item=>{
              this.orderStatusList.forEach(si=>{
                if(si.dictValue===String(item.requests_status)){
                  tempList.push({...item,statusName:si.dictLabel});
                }
              })
            })
          }
          this.purchaserequestsList = tempList;
          this.total = response.data.total;
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
        requests_statuss: '2,3,4',
        pageIndex: 1,
        pageSize: 10
      }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAudit(){
      let ids =[];
      this.selectRows.forEach(item=>{
        if(item.requests_status === 2){
          ids.push(item.id)
        }
      })
      if(ids.length>0){
        this.$confirm('是否确认审批通过' + ids.length + '条采购申请?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let idStr = ids.join(',');
          updateStatus(idStr, { requests_status: 3 }).then(response => {
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
    handleReject(){
      let ids =[];
      this.selectRows.forEach(item=>{
        if(item.requests_status === 2){
          ids.push(item.id)
        }
      })
      if(ids.length>0){
        this.$confirm('是否确认取消' + ids.length + '条采购申请?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let idStr = ids.join(',');
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
      }else{
        this.msgInfo('没有选择可以操作的数据')
      }
    },
    handleSingleAudit(row){
      this.$confirm('是否确认审批通过 ?', '警告', {
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
    handleSingleReject(row){
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
    handleDetail(row){
      sessionStorage.setItem("purchaseRequestId",row.id);
      this.$router.push({path:'/purchase/approval/detail'})
    },
  }
}
</script>

<style scoped>

</style>
