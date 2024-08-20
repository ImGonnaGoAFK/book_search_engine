// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     open: true,
//     proxy: {
//       '/graphql': {
//         target: 'https://localhost:3001',
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/graphql': {
        target: 'https://book-search-engine-0ofb.onrender.com',
        changeOrigin: true,
        secure: true, // Set this to true if your production server uses HTTPS
      }
    }
  }
})
