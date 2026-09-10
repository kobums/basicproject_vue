import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import './board.css'
import './components.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 앱 시작 시 저장된 토큰이 있으면 /auth/me 로 로그인 상태를 복구한다.
// (라우터 가드가 스토어를 쓰므로 router 보다 먼저 pinia 를 설치한다.)
useAuthStore().init()

app.use(router).mount('#app')
