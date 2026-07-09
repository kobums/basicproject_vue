import { createApp } from 'vue'
import './index.css'
import './board.css'
import './components.css'
import App from './App.vue'
import router from './router'
import { initAuth } from './stores/auth'

// 앱 시작 시 저장된 토큰이 있으면 /auth/me 로 로그인 상태를 복구한다.
initAuth()

createApp(App).use(router).mount('#app')
