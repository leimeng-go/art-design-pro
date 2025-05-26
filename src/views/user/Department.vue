<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-input v-model="searchName" placeholder="部门名称"></el-input>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8" class="el-col2">
        <el-button v-ripple>搜索</el-button>
        <el-button @click="showDialog('add')" v-ripple>新增部门</el-button>
      </el-col>
    </el-row>

    <art-table :data="tableData">
      <template #default>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="sort" label="排序" sortable />
        <!-- <el-table-column prop="date" label="日期" /> -->
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="更新时间" />

        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150px">
          <template #default="scope">
            <button-table type="edit" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" @click="deleteDepartment(scope.row.id)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
      width="30%"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="60px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="formData.sort" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parent_id">
          <el-select v-model="formData.parentId" placeholder="请选择上级部门">
            <el-option label="请选择上级部门" value="" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { EntityService } from '@/api/entityApi'
  import { ApiStatus } from '@/utils/http/status'

  const dialogType = ref('add')
  const dialogVisible = ref(false)

  const formData = reactive({
    id: undefined,
    entityId: 4,
    name: '',
    sort: '1',
    parentId: 0,
    status: true
  })

  const searchName = ref('')

  interface Department {
    id: number
    name: string
    sort: number
    status: number
    createTime?: string
    updateTime?: string
    date?: string
    children?: Department[]
  }

  let tableData = ref<Department[]>([])

  const fetchDepartmentList = async (name?: string) => {
    try {
      const response = await EntityService.getDepartmentList({
        params: {
          page: 1,
          pageSize: 10,
          ...(name ? { name } : {})
        }
      })
      if (response.code === ApiStatus.success) {
        console.log('Department list fetched successfully:', response.data)
        console.log('response.data.list: ', response.data.list)
        tableData.value = response.data.list
      } else {
        ElMessage.error(response.message)
      }
    } catch (error) {
      console.log(error)
      ElMessage.error('Failed to fetch department list, please try again later.')
    }
  }

  // const searchDepartment = () => {
  // fetchDepartmentList(searchName.value)
  // }

  onMounted(() => {
    console.log('Department component is now mounted !')
    fetchDepartmentList()
  })

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [
      { required: true, message: '请输入排序号', trigger: 'blur' },
      { pattern: /^[0-9]*$/, message: '请输入数字', trigger: 'blur' }
    ]
  })

  const resetForm = () => {
    formData.name = ''
    formData.entityId = 4
    formData.sort = '1'
    formData.status = true
  }

  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true

    if (type === 'edit' && row) {
      formData.id = row.id
      formData.name = row.name
      formData.sort = row.sort.toString()
      formData.status = row.status === 1
      formData.parentId = row.parentId
    } else {
      resetForm()
    }
  }

  const deleteDepartment = (id: string) => {
    ElMessageBox.confirm('确定要删除该部门吗？', '删除部门', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      const res = await EntityService.deleteDepartment({
        params: {
          id: Number(id)
        }
      })
      if (res.code === ApiStatus.success) {
        ElMessage.success('删除部门成功')
        fetchDepartmentList()
      } else {
        ElMessage.error(res.message)
      }
    })
    console.log('删除部门')
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          let res
          if (dialogType.value === 'add') {
            res = await EntityService.addDepartment({
              body: JSON.stringify({
                entityId: Number(formData.entityId),
                name: formData.name,
                sort: Number(formData.sort),
                parentId: Number(formData.parentId ? formData.parentId : 0),
                status: Number(formData.status)
              })
            })
          } else {
            console.log('formData update data: ', formData)
            res = await EntityService.updateDepartment({
              body: JSON.stringify({
                id: formData.id,
                entityId: Number(formData.entityId),
                name: formData.name,
                sort: Number(formData.sort),
                parentId: Number(formData.parentId ? formData.parentId : 0),
                status: Number(formData.status)
              })
            })
          }
          if (res.code === ApiStatus.success) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
            dialogVisible.value = false
            fetchDepartmentList()
          } else {
            ElMessage.error(res.message)
            fetchDepartmentList()
          }
        } catch (error) {
          console.log('' + error)
          ElMessage.error(
            dialogType.value === 'add' ? '新增部门失败，请稍后重试' : '编辑部门失败，请稍后重试'
          )
          dialogVisible.value = false
        }
      }
    })
  }
</script>

<style lang="scss" scoped>
  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }
</style>
