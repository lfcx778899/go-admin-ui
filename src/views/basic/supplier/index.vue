<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true">
      <el-form-item label="名称">
        <el-input
          v-model="queryParams.supplier_name"
          placeholder="请输入供应商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input
          v-model="queryParams.contact_name"
          placeholder="请输入联系人名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input
          v-model="queryParams.contact_phone"
          placeholder="请输入联系电话"
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
          v-permisaction="['system:sysrole:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="showList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="供应商编码" prop="supplier_id" width="120" />
      <el-table-column label="供应商名称" prop="supplier_name" width="150" />
      <el-table-column label="供应商地址" prop="supplier_adress" width="150" />
      <el-table-column label="联系人" prop="contact_name" width="100" />
      <el-table-column label="联系电话" prop="contact_phone" width="120" />
      <el-table-column label="联系QQ" prop="contact_qq" width="120" />
      <el-table-column label="状态" prop="supplier_status" width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {getSupplierPage, create, deleteSupplier} from '@/api/basic/supplier';
export default {
  name: 'Index',
  data(){
    return {
      showList:[
        {
          "contact_email": "string",
          "contact_name": "string",
          "contact_phone": "string",
          "contact_qq": "string",
          "create_by": "string",
          "create_sub_company_id": "string",
          "id": 0,
          "remark": "string",
          "supplier_adress": "string",
          "supplier_id": "string",
          "supplier_name": "string",
          "supplier_status": 0,
          "update_by": "string"
        }
      ],
      queryParams:{
        supplier_name:'',
        contact_name:'',
        contact_phone:'',
        page_index:1,
        page_size:20
      },
      loading:false,
    }
  },
  methods:{
    handleQuery(){
      this.queryParams = {page_index:1,page_size:20};
      this.getListData();
    },
    resetQuery(){
      this.resetForm('queryForm');
      this.handleQuery()
    },
    getListData(){
      getSupplierPage(this.queryParams).then(res=>{
        console.log(res);
      })
    },
    handleDelete(row){
      const supplierId = row.id;
      this.$confirm('是否确认删除供应商"' + row.supplier_name+ '"?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        deleteSupplier(supplierId).then(res=>{
          console.log(res);
          this.handleQuery();
          this.msgSuccess('删除成功');
        });
      })
    },

  },
  mounted() {
    this.getListData();
  }
}
</script>

<style scoped>

</style>
