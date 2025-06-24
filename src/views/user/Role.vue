<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input placeholder="角色名称"></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button v-ripple>搜索</el-button>
        <el-button @click="showDialog('add')" v-ripple>新增角色</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:currentPage="handlePageChange"
      @update:pageSize="handlePageSizeChange"
    >
      <template #default>
        <el-table-column label="角色名称" prop="name" />
        <el-table-column label="描述" prop="description" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100px">
          <template #default="scope">
            <el-row>
              <button-more
                :list="[
                  { key: 'permission', label: '菜单权限' },
                  { key: 'edit', label: '编辑角色' },
                  { key: 'delete', label: '删除角色' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </el-row>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialog" title="菜单权限" width="30%">
      <div :style="{ maxHeight: '500px', overflowY: 'scroll' }">
        <el-tree
          :data="menuList"
          show-checkbox
          node-key="id"
          :default-expanded-keys="[1, 2, 3, 4, 5, 6, 7, 8]"
          :default-checked-keys="[1, 2, 3]"
          :props="defaultProps"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { RoleService } from '@/api/roleApi'
  import { ApiStatus } from '@/utils/http/status'
  import { onActivated, ref, computed, reactive } from 'vue'

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const menuList = computed(() => useMenuStore().getMenuList)

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    des: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  const handlePageChange = (val: number) => {
    currentPage.value = val
    fetchRoleList(searchName.value, val, pageSize.value)
  }
  const handlePageSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    fetchRoleList(searchName.value, 1, val)
  }

  const form = reactive({
    id: '',
    name: '',
    description: '',
    status: true
  })

  interface Role {
    id: string
    name: string
    des: string
    status: boolean
  }

  const tableData = ref<Role[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const searchName = ref('')

  const fetchRoleList = async (
    keyword?: string,
    page = currentPage.value,
    size = pageSize.value
  ) => {
    try {
      const res = await RoleService.getRoleList({
        params: {
          page,
          pageSize: size,
          ...(keyword ? { keyword } : {})
        }
      })
      if (res.code === ApiStatus.success) {
        tableData.value = res.data.list
        total.value = res.data.total || 0
      }
    } catch (error) {
      console.log(error)
      ElMessage.error('Failed to fetch role list, please try again later.')
    }
  }

  onActivated(() => {
    console.log('Role component activated !')
    fetchRoleList()
  })

  const dialogType = ref('add')

  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      form.id = row.id
      form.name = row.name
      form.description = row.description
      form.status = row.status === 1
    } else {
      form.id = ''
      form.name = ''
      form.description = ''
      form.status = true
    }
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
    if (item.key === 'permission') {
      showPermissionDialog()
    } else if (item.key === 'edit') {
      showDialog('edit', row)
    } else if (item.key === 'delete') {
      deleteRole(row.id)
    }
  }

  const showPermissionDialog = () => {
    permissionDialog.value = true
  }

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || ''
  }

  const deleteRole = (id: string) => {
    ElMessageBox.confirm('确定删除该角色吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        const res = await RoleService.deleteRole({
          params: {
            id: Number(id)
          }
        })
        if (res.code === ApiStatus.success) {
          ElMessage.success('删除角色成功')
          fetchRoleList()
        } else {
          ElMessage.error(res.message)
        }
      })
      .catch((error) => {
        console.error(error)
        ElMessage.error('删除失败')
      })
    // ElMessage.success('删除成功')
  }

  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        if (dialogType.value === 'add') {
          const res = await RoleService.addRole({
            body: JSON.stringify({
              name: form.name,
              description: form.description,
              status: form.status ? 1 : 0
            })
          })
          if (res.code === ApiStatus.success) {
            ElMessage.success('新增角色成功')
            dialogVisible.value = false
            formEl.resetFields()
            fetchRoleList()
          } else {
            ElMessage.error(res.message)
          }
        } else {
          const res = await RoleService.updateRole({
            body: JSON.stringify({
              id: form.id,
              name: form.name,
              description: form.description,
              status: form.status ? 1 : 0
            })
          })
          if (res.code === ApiStatus.success) {
            ElMessage.success('修改角色成功')
            dialogVisible.value = false
            formEl.resetFields()
            fetchRoleList()
          } else {
            ElMessage.error(res.message)
          }
        }
      }
    })
  }

  const formatDate = (date: string) => {
    return new Date(date)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-')
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
