<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-input placeholder="部门名称"></el-input>
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
        <el-table-column prop="date" label="日期" />

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
            <button-table type="delete" @click="deleteDepartment" />
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
    entityId: 4,
    name: '',
    sort: 1,
    parentId: 0,
    status: true
  })
  interface Department {
    id: number
    name: string
    sort: number
    status: number
    createTime?: string
    updateTime?: string
    date?: string
  }

  let tableData = reactive<Department[]>([])

  onMounted(() => {
    console.log('Department component is now mounted !')
    const fetchDepartmentList = async () => {
      try {
        const response = await EntityService.getDepartmentList({
          params: {
            page: 1,
            pageSize: 10
          }
          // Merge pagination parameters into options.params
        })
        if (response.code === ApiStatus.success) {
          console.log('Department list fetched successfully:', response.data)
          console.log(response.data.list)
          // 清空数组
          // tableData.length=0
          // tableData.push(...response.data.list)
          // Assuming response.data is an array of department objects
          // You can now use this data to populate your UI or perform other operations
        } else {
          ElMessage.error(response.message)
        }
      } catch (error) {
        console.log(error)
        ElMessage.error('Failed to fetch department list, please try again later.')
      }
    }
    fetchDepartmentList()
  })

  tableData = reactive<Department[]>([
    {
      id: 1,
      date: '2016-05-02 11:11:11',
      name: '人力资源部11111111',
      status: 0,
      sort: 1
    },
    {
      id: 2,
      date: '2016-05-04',
      name: '公关部',
      status: 1,
      sort: 2
    },
    {
      id: 3,
      date: '2016-05-01',
      name: '市场部',
      status: 1,
      sort: 3,
      children: [
        {
          id: 31,
          date: '2016-05-01',
          name: '王小虎',
          status: 1,
          sort: 1
        },
        {
          id: 32,
          date: '2016-05-01',
          name: '王小虎',
          status: 0,
          sort: 2
        }
      ]
    },
    {
      id: 4,
      date: '2016-05-03',
      name: '财务部',
      status: 1,
      sort: 4
    },
    {
      id: 5,
      date: '2016-05-03',
      name: '广告部',
      status: 1,
      sort: 5
    },
    {
      id: 6,
      date: '2016-05-03',
      name: '营销部',
      status: 1,
      sort: 5
    },
    {
      id: 7,
      date: '2016-05-03',
      name: '开发部',
      status: 1,
      sort: 5
    },
    {
      id: 8,
      date: '2016-05-03',
      name: '测试部',
      status: 1,
      sort: 5
    },
    {
      id: 9,
      date: '2016-05-03',
      name: '安全监察部',
      status: 0,
      sort: 5
    },
    {
      id: 10,
      date: '2016-05-03',
      name: '设计部',
      status: 1,
      sort: 5
    },
    {
      id: 11,
      date: '2016-05-03',
      name: '监事会',
      status: 1,
      sort: 5
    },
    {
      id: 12,
      date: '2016-05-03',
      name: '董事会',
      status: 1,
      sort: 5
    }
  ])

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
    formData.sort = 1
    formData.status = true
  }

  const showDialog = (type: string, row?: any) => {
    dialogType.value = type
    dialogVisible.value = true

    if (type === 'edit' && row) {
      formData.name = row.name
      formData.sort = row.sort.toString()
      formData.status = row.status === 1
    } else {
      resetForm()
    }
  }

  const deleteDepartment = () => {
    ElMessageBox.confirm('确定要删除该部门吗？', '删除部门', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      console.log('删除部门')
    })
  }

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        // const params = {
        //   ...formData,
        //   status: formData.status ? 1 : 0
        // }
        try {
          const res = await EntityService.addDepartment({
            body: JSON.stringify({
              entityId: formData.entityId,
              name: formData.name,
              sort: formData.sort,
              parentId: formData.parentId,
              status: formData.status ? 1 : 0
            })
          })
          if (res.code === ApiStatus.success) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
            dialogVisible.value = false
          } else {
            ElMessage.error(res.message)
          }
        } catch (error) {
          console.log(error)
          ElMessage.error('新增部门失败，请稍后重试')
          dialogVisible.value = false
        }
        // ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
        // dialogVisible.value = false
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
