<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="库位简称" prop="location_name">
        <el-input
          v-model="queryParams.location_name"
          placeholder="请输入库位简称"
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
    </el-row>

    <el-table v-loading="loading" :data="locationList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="库位简称" align="center" prop="location_name" />
      <el-table-column label="详细地址" align="center" prop="location_adress" />
      <el-table-column label="说明" align="center" prop="location_remark" />
      <!--<el-table-column label="库位说明" align="center" prop="remark" />-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="small"
            type="warning"
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="库位简称" prop="location_name">
          <el-input v-model="form.location_name" placeholder="请输入库位简称" />
        </el-form-item>
        <el-form-item label="详细地址" prop="location_adress">
          <el-input v-model="form.location_adress"  placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="库位说明" prop="location_remark">
          <el-input v-model="form.location_remark" placeholder="请输入库位说明" />
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
  import {getLocationPage,create,deleteLocation,updateLocation} from '@/api/basic/location';
  export default {
    name: 'index',
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
        locationList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageIndex: 1,
          pageSize: 10,
          location_name:''
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          location_name:[{ required: true, message: '库位简称不能为空', trigger: 'blur' }],
        },
        ifEdit:false,
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询【请填写功能名称】列表 */
      getList() {
        this.loading = true;
        getLocationPage(this.queryParams).then(response => {
          this.locationList = response.data.items;
          this.total = response.data.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.ifEdit = false;
        this.form = {};
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          location_name: undefined,
          location_adress: undefined,
          location_remark: undefined,
          remark: undefined,
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
        this.queryParams = {
          pageIndex: 1,
            pageSize: 10,
            location_name:''
        };
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
        this.ifEdit = false;
        this.title = "添加库位";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        this.form = row;
        this.open = true;
        this.ifEdit = true;
        this.title = "修改库位";
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateLocation(this.form.id,this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.ifEdit = false;
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              });
            } else {
              create(this.form).then(response => {
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
        this.$confirm('是否确认删除?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(()=>{
          deleteLocation(row.id).then(resp=>{
            if (resp.code === 200) {
              this.msgSuccess('删除成功')
              this.getList()
            } else {
              this.msgError(resp.msg)
            }
          })
        });
      },
    }
  }
</script>

<style scoped>

</style>
