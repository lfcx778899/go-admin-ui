<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="库存id" prop="inventoryControlId">
        <el-input
          v-model="queryParams.inventoryControlId"
          placeholder="请输入库存id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品id" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品id" prop="supplierIds">
        <el-input
          v-model="queryParams.supplierIds"
          placeholder="请输入产品id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请数量" prop="requestsQuantity">
        <el-input
          v-model="queryParams.requestsQuantity"
          placeholder="请输入申请数量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="采购状态" prop="requestsStatus">
        <el-select v-model="queryParams.requestsStatus" placeholder="请选择采购状态" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="采购状态" prop="updateBy">
        <el-input
          v-model="queryParams.updateBy"
          placeholder="请输入采购状态"
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
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="multiple"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="requestsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="领用单号" align="center" prop="id" />
      <el-table-column label="领用日期" align="center" prop="inventoryControlId" />
      <el-table-column label="产品类别" align="center" prop="productId" />
      <el-table-column label="产品名称" align="center" prop="supplierIds" />
      <el-table-column label="申请数量" align="center" prop="requestsQuantity" />
      <el-table-column label="采购状态" align="center" prop="requestsStatus" />
      <el-table-column label="申请人" align="center" prop="remark" />
      <el-table-column label="备注" align="center" prop="updateBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:requests:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:requests:remove']"
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="product_id"  >
          <el-select
            v-model="form.product_id"
            placeholder="请选择产品"
            clearable
            size="small"
            style="width: 360px"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.product_name"
              :value="product.product_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请数量" prop="requests_quantity">
          <el-input-number :min="0" :step="1" v-model="form.requests_quantity" placeholder="请输入申请数量" />
        </el-form-item>
        <el-form-item label="备注" prop="remark"  >
          <el-input v-model="form.remark" placeholder="请填写备注"  style="width: 360px"/>
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
  import {getPage,updateStatus,updateItem,deleteItem,createOut} from '@/api/inventory/out'
  import { getDicts } from '@/api/system/dict/data';
  import {getAll} from '@/api/basic/product'
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
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    getDicts('goods_type').then(response => {
      this.productTypeList = response.data
    })
    getAll().then(response=>{
      this.productList = response.data.items;
      this.selectProductList = this.productList;
    })
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getPage(this.queryParams).then(response => {
        this.requestsList = response.data.items
        this.total = response.data.total
        this.loading = false
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
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
      this.queryParams.pageIndex = 1;
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加领用申请";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRequests(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改领用申请";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateRequests(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            createOut(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delRequests(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function() {});
    },
  }
}
</script>

<style scoped>

</style>
