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
        >新增
        </el-button>
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
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="500px">
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
        <el-form-item label="联系人手机" prop="contact_phone">
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
  </div>
</template>

<script>
import { getSupplierPage, create, deleteSupplier, updateSupplier, changeStatus } from '@/api/basic/supplier'

export default {
  name: 'Index',
  data() {
    return {
      showList: [
        {
          'contact_email': 'string',
          'contact_name': 'string',
          'contact_phone': 'string',
          'contact_qq': 'string',
          'create_by': 'string',
          'create_sub_company_id': 'string',
          'id': 0,
          'remark': 'string',
          'supplier_adress': 'string',
          'supplier_id': 'string',
          'supplier_name': 'string',
          'supplier_status': 0,
          'update_by': 'string'
        }
      ],
      queryParams: {
        supplier_name: '',
        contact_name: '',
        contact_phone: '',
        page_index: 1,
        page_size: 20
      },
      loading: false,
      form: {},
      rules: {
        supplierName: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
        supplierAdress: [{ required: true, message: '供应商地址不能为空', trigger: 'blur' }],
        contactName: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '联系人手机不能为空', trigger: 'blur' }],
        contactQq: [{ required: true, message: '联系人QQ不能为空', trigger: 'blur' }],
        contactEmail: [{ required: true, message: '联系人邮箱不能为空', trigger: 'blur' }]

      },
      title: '',
      open: false,
      isEdit: false
    }
  },
  mounted() {
    this.getListData()
  },
  methods: {
    handleQuery() {
      this.queryParams = { page_index: 1, page_size: 20 }
      this.getListData()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    getListData() {
      getSupplierPage(this.queryParams).then(res => {
        console.log(res)
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
      this.reset()
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
            updateSupplierInformation(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.handleQuery()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            create(this.form).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.handleQuery()
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
