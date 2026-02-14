import './App.css'
import { ElectionProvider } from '@/components/ElectionContext'
import { MainLayout } from '@/layouts/MainLayout'

function App() {
  return (
    <ElectionProvider>
      <MainLayout />
    </ElectionProvider>
  )
}

export default App
