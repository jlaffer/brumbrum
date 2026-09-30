<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getUsers, createUser, updateUser, deleteUser, socket } from '../api/index';
import type { User } from '../types/index';
import { message, Modal } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';

const users = ref<User[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const editingUser = ref<Partial<User> | null>(null);
const formState = ref({
  name: '',
  email: '',
  phoneNumber: '',
  whatsappApiKey: '',
  color: '#1890ff'
});

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Telefon', dataIndex: 'phoneNumber', key: 'phoneNumber' },
  { title: 'Farbe', dataIndex: 'color', key: 'color' },
  { title: 'Aktion', key: 'action' },
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    users.value = await getUsers();
  } catch (error) {
    message.error('Fehler beim Laden der Nachbarn');
  } finally {
    loading.value = false;
  }
};

const showModal = (user?: User) => {
  if (user) {
    editingUser.value = user;
    formState.value = { 
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      whatsappApiKey: user.whatsappApiKey || '',
      color: user.color 
    };
  } else {
    editingUser.value = null;
    formState.value = { name: '', email: '', phoneNumber: '', whatsappApiKey: '', color: '#1890ff' };
  }
  modalVisible.value = true;
};

const handleOk = async () => {
  try {
    if (editingUser.value?.id) {
      await updateUser(editingUser.value.id, formState.value);
      message.success('Nachbar aktualisiert');
    } else {
      await createUser(formState.value);
      message.success('Nachbar hinzugefügt');
    }
    modalVisible.value = false;
    fetchUsers();
  } catch (error) {
    message.error('Fehler beim Speichern');
  }
};

const confirmDelete = (id: number) => {
  Modal.confirm({
    title: 'Möchten Sie diesen Nachbarn wirklich löschen?',
    content: 'Dies kann nicht rückgängig gemacht werden.',
    okText: 'Ja, löschen',
    okType: 'danger',
    cancelText: 'Abbrechen',
    onOk: async () => {
      try {
        await deleteUser(id);
        message.success('Nachbar gelöscht');
        fetchUsers();
      } catch (error) {
        message.error('Fehler beim Löschen');
      }
    },
  });
};

onMounted(() => {
  fetchUsers();
  socket.on('userUpdate', fetchUsers);
});

onUnmounted(() => {
  socket.off('userUpdate', fetchUsers);
});
</script>

<template>
  <div>
    <div class="header">
      <h2>Nachbarn verwalten</h2>
      <a-button type="primary" @click="showModal()">
        <template #icon><PlusOutlined /></template>
        Nachbar hinzufügen
      </a-button>
    </div>

    <a-table :dataSource="users" :columns="columns" :loading="loading" rowKey="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'color'">
          <div :style="{ backgroundColor: record.color, width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #d9d9d9' }"></div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" @click="showModal(record)">
              <template #icon><EditOutlined /></template>
            </a-button>
            <a-button size="small" danger @click="confirmDelete(record.id)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalVisible"
      :title="editingUser ? 'Nachbar bearbeiten' : 'Neuer Nachbar'"
      @ok="handleOk"
      okText="Speichern"
      cancelText="Abbrechen"
    >
      <a-form layout="vertical" :model="formState">
        <a-form-item label="Name" required>
          <a-input v-model:value="formState.name" placeholder="Name des Nachbarn" />
        </a-form-item>
        <a-form-item label="Email" required>
          <a-input v-model:value="formState.email" placeholder="email@beispiel.de" />
        </a-form-item>
        <a-form-item label="Telefon (für WhatsApp)">
          <a-input v-model:value="formState.phoneNumber" placeholder="+49 123 456789" />
        </a-form-item>
        <a-form-item label="CallMeBot API Key">
          <a-input v-model:value="formState.whatsappApiKey" placeholder="Dein API Key von CallMeBot" />
          <small style="color: #888">Sende "I allow callmebot to send me messages" an +34 644 20 47 85 um einen Key zu erhalten.</small>
        </a-form-item>
        <a-form-item label="Farbe">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="color" v-model="formState.color" style="width: 50px; height: 32px; padding: 0; border: 1px solid #d9d9d9; border-radius: 4px;" />
            <a-input v-model:value="formState.color" style="width: 100px" />
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>
