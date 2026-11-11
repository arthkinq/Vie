import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#920003',
          colorLink: '#6F0D0E',
          colorText: '#2D1014',
          colorBgContainer: '#F7EBD4',
          colorBgLayout: '#2D1014',
          colorBorder: '#FECE79',
          fontFamily: "'Roboto Slab', serif",
        },

        components: {
          Button: {
            colorPrimary: '#F7EBD4',
            colorPrimaryHover: '#FFF9AD',
            colorPrimaryActive: '#FECE79',

            primaryColor: '#2D1014',
            primaryShadow: 'none',

            defaultBg: '#F7EBD4',
            defaultColor: '#2D1014',
            defaultBorderColor: '#6F0D0E',

            defaultHoverBg: '#FFF9AD',
            defaultHoverColor: '#2D1014',
            defaultHoverBorderColor: '#6F0D0E',

            borderRadius: 24,
            fontFamily: "'Roboto Serif', serif",
            fontWeight: 700,
          },
        },
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </StrictMode>,
)
