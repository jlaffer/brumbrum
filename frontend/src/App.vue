<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, createUser } from './api/index';
import type { User } from './types/index';
import { MenuOutlined, CalendarOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const currentUserId = ref<number | null>(null);
const users = ref<User[]>([]);
const drawerVisible = ref(false);

const fetchUsers = async () => {
  users.value = await getUsers();
  if (users.value.length === 0) {
    // Erstelle Standardbenutzer
    await createUser({ name: 'Nachbar A', email: 'a@example.com', color: '#1890ff' });
    await createUser({ name: 'Nachbar B', email: 'b@example.com', color: '#52c41a' });
    users.value = await getUsers();
  }

  // Validierung des gespeicherten Benutzers
  const saved = localStorage.getItem('brumbrum_user_id');
  if (saved) {
    const parsedId = parseInt(saved);
    if (users.value.some(u => u.id === parsedId)) {
      currentUserId.value = parsedId;
    } else if (users.value.length > 0) {
      currentUserId.value = users.value[0].id;
      localStorage.setItem('brumbrum_user_id', currentUserId.value.toString());
    }
  } else if (users.value.length > 0) {
    currentUserId.value = users.value[0].id;
    localStorage.setItem('brumbrum_user_id', currentUserId.value.toString());
  }
};

onMounted(fetchUsers);

const handleUserChange = (val: number) => {
  currentUserId.value = val;
  localStorage.setItem('brumbrum_user_id', val.toString());
};

const showDrawer = () => {
  drawerVisible.value = true;
};

const copyIcsUrl = () => {
  // const url = `${window.location.protocol}://${window.location.hostname}:${window.location.port}/calendar/ics`;
  const url = `${window.location.protocol}://${window.location.hostname}:3000/calendar/ics`;
  navigator.clipboard.writeText(url).then(() => {
    message.success('Kalender-URL kopiert!');
  }).catch(() => {
    message.error('Fehler beim Kopieren');
  });
};

const onClose = () => {
  drawerVisible.value = false;
};

</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#275b14',
      },
    }"
  >
    <a-layout style="min-height: 100vh">
    <div class="top-title-bar">
      BrumBrum am Berliner Ring
    </div>
    <a-layout-header class="header">
      <div class="logo">
        <img src="../public/brumbrum.png" width="110" alt="BrumBrum Logo" />
      </div>

      <a-menu
        theme="dark"
        mode="horizontal"
        :selectedKeys="[$route.name as string]"
        class="desktop-menu"
      >
        <a-menu-item key="dashboard">
          <router-link to="/">Dashboard</router-link>
        </a-menu-item>
        <a-menu-item key="cars">
          <router-link to="/cars">Fahrzeuge</router-link>
        </a-menu-item>
        <a-menu-item key="reservations">
          <router-link to="/reservations">Reservierungen</router-link>
        </a-menu-item>
        <a-menu-item key="my-cars">
          <router-link to="/my-cars">Meine Fahrzeuge</router-link>
        </a-menu-item>
        <a-menu-item key="neighbors">
          <router-link to="/neighbors">Nachbarn</router-link>
        </a-menu-item>
      </a-menu>

      <div class="header-right">
        <a-button
          ghost
          style="margin-right: 16px"
          @click="copyIcsUrl"
          title="Kalender-Link (ICS) kopieren"
        >
          <template #icon><CalendarOutlined /></template>
          <span class="ics-text">ICS Link</span>
        </a-button>
        <a-select
          v-model:value="currentUserId"
          style="width: 140px"
          @change="handleUserChange"
          class="user-select"
        >
          <a-select-option v-for="user in users" :key="user.id" :value="user.id">
            <a-space>
              <div :style="{ backgroundColor: user.color, width: '12px', height: '12px', borderRadius: '50%' }"></div>
              {{ user.name }}
            </a-space>
          </a-select-option>
        </a-select>
        <a-button class="mobile-menu-btn" type="text" @click="showDrawer">
          <template #icon><menu-outlined style="color: white; font-size: 20px" /></template>
        </a-button>
      </div>
    </a-layout-header>

    <a-drawer
      v-model:open="drawerVisible"
      title="BrumBrum Menü"
      placement="left"
      @close="onClose"
      :bodyStyle="{ padding: 0 }"
    >
      <a-menu
        mode="inline"
        :selectedKeys="[$route.name as string]"
        @click="drawerVisible = false"
      >
        <a-menu-item key="dashboard">
          <router-link to="/">Dashboard</router-link>
        </a-menu-item>
        <a-menu-item key="cars">
          <router-link to="/cars">Fahrzeuge</router-link>
        </a-menu-item>
        <a-menu-item key="reservations">
          <router-link to="/reservations">Reservierungen</router-link>
        </a-menu-item>
        <a-menu-item key="my-cars">
          <router-link to="/my-cars">Meine Fahrzeuge</router-link>
        </a-menu-item>
        <a-menu-item key="neighbors">
          <router-link to="/neighbors">Nachbarn</router-link>
        </a-menu-item>
      </a-menu>
    </a-drawer>

    <a-layout-content class="content">
      <div class="container">
        <router-view :currentUserId="currentUserId"></router-view>
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      BrumBrum Carsharing ©2026
    </a-layout-footer>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
.top-title-bar {
  background-color: #275b14;
  color: white;
  text-align: center;
  padding: 16px 0;
  font-size: 32px;
  font-family: 'Fascinate', cursive;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.logo {
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-right: 24px;
}
.desktop-menu {
  flex: 1;
  line-height: 64px;
}
.header-right {
  display: flex;
  align-items: center;
}
.mobile-menu-btn {
  display: none;
  margin-left: 16px;
}
.content {
  padding: 24px;
  background: #f0f2f5;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .top-title-bar {
    font-size: 24px;
    padding: 10px 0;
    letter-spacing: 2px;
  }
  .desktop-menu {
    display: none;
  }
  .mobile-menu-btn {
    display: block;
  }
  .header {
    padding: 0 16px;
  }
  .content {
    padding: 16px 8px;
  }
  .user-select {
    width: 100px !important;
  }
  .ics-text {
    display: none;
  }
}
</style>
