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
          icon="el-icon-upload2"
          size="mini"
          @click="handleUpload"
        >上传
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >下载
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="showList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="供应商编码" prop="supplier_id" width="250" />
      <el-table-column label="供应商名称" prop="supplier_name" width="150" />
      <el-table-column label="供应商地址" prop="supplier_adress" />
      <el-table-column label="联系人" prop="contact_name" width="100" />
      <el-table-column label="联系电话" prop="contact_phone" width="120" />
      <el-table-column label="联系QQ" prop="contact_qq" width="120" />
      <el-table-column label="状态" prop="supplier_status" width="120" >
        <template slot-scope="scope">
          <span>{{scope.row.supplier_status===0? "启用":"停用"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button v-if="scope.row.supplier_status===0"
            size="small"
            type="info"
            :icon="statusIcon(scope.row)"
            @click="handleStatusChange(scope.row)"
          >
            <span>停用</span>
          </el-button>
          <el-button v-if="scope.row.supplier_status===1"
            size="small"
            type="success"
            :icon="statusIcon(scope.row)"
            @click="handleStatusChange(scope.row)"
          >
            <span>启用</span>
          </el-button>
          <el-button
            size="small"
            type="warning"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getListData"
    />

    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="供应商名称" prop="supplier_name">
          <el-input v-model="form.supplier_name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="供应商地址" prop="supplier_adress">
          <el-input v-model="form.supplier_adress" placeholder="请输入供应商地址" />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="contact_name">
          <el-input v-model="form.contact_name" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contact_phone">
          <el-input v-model="form.contact_phone" placeholder="请输入联系人手机" />
        </el-form-item>
        <el-form-item label="联系人QQ" prop="contact_qq">
          <el-input v-model="form.contact_qq" placeholder="请输入联系人QQ" />
        </el-form-item>
        <el-form-item label="联系人邮箱" prop="contact_email">
          <el-input v-model="form.contact_email" placeholder="请输入联系人邮箱" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="选择文件" :visible.sync="showUpload" width="500px" :close-on-click-modal="false">
      <el-form ref="form" label-width="100px">
        <el-form-item label="选择文件" prop="remark">
          <el-upload
            :limit=1
            :auto-upload="false"
            accept=".xlsx"
            :action="UploadUrl()"
            :before-upload="beforeUploadFile"
            :on-change="fileChange"
            :on-exceed="exceedFile"
            :on-success="handleSuccess"
            :on-error="handleError"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadFile">确 定</el-button>
        <el-button @click="cancelUpload">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSupplierPage, create, deleteSupplier, updateSupplier, changeStatus,uploadSupplier ,exportSupplier} from '@/api/basic/supplier'
import {downLoadXls} from '@/utils/zipdownload'

export default {
  name: 'Index',
  data() {
    return {
      showList: [],
      queryParams: {
        supplier_name: '',
        contact_name: '',
        contact_phone: '',
        pageIndex: 1,
        pageSize: 10
      },
      loading: false,
      form: {},
      rules: {
        supplier_name: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
        supplier_adress: [{ required: true, message: '供应商地址不能为空', trigger: 'blur' }],
        contact_name: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
        // contact_phone: [{ required: true, message: '联系人手机不能为空', trigger: 'blur' }],
        // contact_qq: [{ required: true, message: '联系人QQ不能为空', trigger: 'blur' }],
        // contact_email: [{ required: true, message: '联系人邮箱不能为空', trigger: 'blur' }]
      },
      title: '',
      open: false,
      isEdit: false,
      total:0,
      showUpload:false,
      fileList:[],

    }
  },
  mounted() {
    this.getListData()
  },
  methods: {
    handleQuery() {
      this.getListData()
    },
    handleExport(){
      exportSupplier().then(resp=>{
        if (resp.code === 200) {
          let exportPath = resp.data.file_path;
          downLoadXls(exportPath);
        } else {
          this.msgError(resp.msg)
        }
      })
    },
    handleUpload(){
      this.showUpload = true;
    },
    cancelUpload(){
      this.fileList =[];
      this.showUpload = false;
    },
    UploadUrl(){
      return "";
    },
    uploadFile() {
      if (this.fileList.length === 0){
        this.msgError("请上传文件");
      } else {
        let form = new FormData();
        form.append('file', this.fileList[0]);

        uploadSupplier(form).then(resp=>{
          if (resp.code === 200) {
            this.msgSuccess('操作成功')
            this.cancelUpload();
            this.getListData()
          } else {
            this.msgError(resp.msg)
          }
        })
      }
    },
    exceedFile(files, fileList) {
      this.msgError("选择多个文件");
    },
    fileChange(file, fileList) {
      this.fileList.push(file.raw) ;
    },
    beforeUploadFile(file) {
      let extension = file.name.substring(file.name.lastIndexOf('.')+1);
      let size = file.size / 1024 / 1024;
      if(extension !== 'xlsx') {
        this.msgError("只能上传后缀是.xlsx的文件");
      }
      if(size > 4) {
        this.msgError("文件大小不得超过4M");
      }
    },
    // 文件上传成功时的钩子
    handleSuccess(res, file, fileList) {
      this.msgSuccess('文件上传成功')
    },
    // 文件上传失败时的钩子
    handleError(err, file, fileList) {
      this.msgError("文件上传失败");
    },
    statusIcon(row){
      return row.supplier_status===0? 'el-icon-close':'el-icon-check';
    },
    resetQuery() {
      this.queryParams ={ pageIndex: 1, pageSize: 10 }
      this.resetForm('queryForm')
      this.handleQuery()
    },
    getListData() {
      getSupplierPage(this.queryParams).then(res => {
        this.showList = res.data.items;
        this.total = res.data.total;
      })
    },
    handleStatusChange(row){
      const supplierId = row.id
      const supplierStatus = row.supplier_status;
      let queryMessage = supplierStatus===0? "是否确认停用供应商？":"是否确认启用供应商？";
      let updateData = {supplier_status:supplierStatus===0 ? 1 : 0 }
      this.$confirm(queryMessage, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeStatus(supplierId,updateData).then(res => {
          this.handleQuery()
          this.msgSuccess('操作成功')
        })
      })
    },
    handleDelete(row) {
      const supplierId = row.id
      this.$confirm('是否确认删除供应商"' + row.supplier_name + '"?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSupplier(supplierId).then(res => {
          console.log(res)
          this.handleQuery()
          this.msgSuccess('删除成功')
        })
      })
    },
    cancel() {
      this.open = false
      this.form={};
      this.handleQuery();
      // this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        supplierId: undefined,
        supplierName: undefined,
        supplierAdress: undefined,
        contactName: undefined,
        contactPhone: undefined,
        contactQq: undefined,
        contactEmail: undefined,
        supplierStatus: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
    },
    handleUpdate(row) {
      this.form = row
      this.open = true
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateSupplier(this.form.id,this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.cancel();
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            create(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.cancel();
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
