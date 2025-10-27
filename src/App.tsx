import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Layout
import RootLayout from './app/layout.jsx'

// Pages
import HomePage from './app/page.jsx'
import SignInPage from './app/account/signin/page.jsx'
import SignUpPage from './app/account/signup/page.jsx'
import MerchantsPage from './app/merchants/page.jsx'
import MobileAppsPage from './app/mobile-apps/page.jsx'
import TransactionsPage from './app/transactions/page.jsx'
import SupportPage from './app/support/page.jsx'
import NotFound from './components/NotFound.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RootLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merchants" element={<MerchantsPage />} />
            <Route path="/mobile-apps" element={<MobileAppsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/account/signin" element={<SignInPage />} />
            <Route path="/account/signup" element={<SignUpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RootLayout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App

