import { defineConfig } from 'vite'
// เปลี่ยนการ import เป็นตัว oxc
import react from '@vitejs/plugin-react-oxc' 

export default defineConfig({
  plugins: [react()],
  // หากมี optimizeDeps.rollupOptions หรือ esbuild อยู่ในนี้ ให้ลบออกหรือเปลี่ยนเป็น rolldown
})