import { createRouter, createWebHistory } from 'vue-router'
import BoardListPage from '../pages/BoardListPage.vue'
import BoardDetailPage from '../pages/BoardDetailPage.vue'
import BoardWritePage from '../pages/BoardWritePage.vue'
import BoardEditPage from '../pages/BoardEditPage.vue'
import UserListPage from '../pages/UserListPage.vue'
import UserDetailPage from '../pages/UserDetailPage.vue'
import UserWritePage from '../pages/UserWritePage.vue'
import UserEditPage from '../pages/UserEditPage.vue'
import ComponentsPage from '../pages/ComponentsPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import { useAuth, waitForAuthRestore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: BoardListPage },
    {
      path: '/boards/new',
      component: BoardWritePage,
      meta: { requiresAuth: true },
    },
    { path: '/boards/:id', component: BoardDetailPage },
    {
      path: '/boards/:id/edit',
      component: BoardEditPage,
      meta: { requiresAuth: true },
    },
    { path: '/users', component: UserListPage },
    {
      path: '/users/new',
      component: UserWritePage,
      meta: { requiresAuth: true },
    },
    { path: '/users/:id', component: UserDetailPage },
    {
      path: '/users/:id/edit',
      component: UserEditPage,
      meta: { requiresAuth: true },
    },
    { path: '/components', component: ComponentsPage },
    { path: '/login', component: LoginPage },
    { path: '/signup', component: SignupPage },
    { path: '/:pathMatch(.*)*', component: NotFoundPage },
  ],
})

// 인증이 필요한 페이지 가드 (React 의 RequireAuth 대응).
// 비로그인 시 로그인 페이지로 보내고, 로그인 후 원래 가려던 경로로 돌아올 수 있도록
// redirect 쿼리에 현재 경로를 담는다.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return
  // 새로고침 직후라면 저장된 토큰의 복구(/auth/me)가 끝난 뒤에 인증 여부를 판단한다.
  await waitForAuthRestore()
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath }, replace: true }
  }
})

export default router
