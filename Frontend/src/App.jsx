import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import SubdomainStorePage from './pages/SubdomainStorePage'
import { isSubdomain } from './utils/subdomainHelper'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import { HelmetProvider } from 'react-helmet-async'

function App() {
  // Check if we're on a subdomain
  const onSubdomain = isSubdomain();

  return (
    <HelmetProvider>
      <ToastContainer position='top-center' autoClose={2300} />
      <BrowserRouter>
        {onSubdomain ? <SubdomainStorePage /> : <AppRoutes />}
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
