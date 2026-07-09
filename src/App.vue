<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from './stores/auth'
import ToastStack from './components/ToastStack.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.replace('/')
}
</script>

<template>
  <nav class="topnav">
    <span class="brand">basicproject</span>
    <div class="topnav-links">
      <!-- "/" 는 모든 경로의 접두사라 exact 매칭일 때만 active 를 준다 -->
      <RouterLink to="/" exact-active-class="active">게시판</RouterLink>
      <RouterLink to="/users" active-class="active">회원</RouterLink>
      <RouterLink to="/components" active-class="active">컴포넌트</RouterLink>
    </div>
    <div class="topnav-auth">
      <template v-if="isAuthenticated">
        <span class="topnav-user">{{ user?.name ?? user?.email }}</span>
        <button type="button" class="btn btn-sm" @click="handleLogout">
          로그아웃
        </button>
      </template>
      <template v-else>
        <RouterLink to="/login" active-class="active">로그인</RouterLink>
        <RouterLink to="/signup" active-class="active">회원가입</RouterLink>
      </template>
    </div>
  </nav>

  <main class="container">
    <RouterView />
  </main>

  <ToastStack />
  <LoadingOverlay />
</template>
