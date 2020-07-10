<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="归属部门" prop="deptId">
        <treeselect
          v-model="queryParams.dept_name"
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
        >审批通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleApplyOrder"
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
      <el-table-column label="申请组" prop="create_by_name" width="120" />
      <el-table-column label="申请人" prop="create_by_name" width="120" />
      <el-table-column label="状态" prop="requests_status" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.statusName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品类别" prop="product_type" width="100" />
      <el-table-column label="产品名称" prop="product_name" width="120" />
      <el-table-column label="申请数量" prop="requests_quantity" width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="360">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >审批通过</el-button>
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
  import {getpage,create,deleteItem,updateItem,updateStatus} from '@/api/purchase/apply';
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
        pageIndex: 1,
        pageSize: 10,
      },
      statusList:[],
      orderStatusList:[],
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
    })
  },
  methods:{
    getTreeselect() {
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
  }
}
</script>

<style scoped>

</style>
