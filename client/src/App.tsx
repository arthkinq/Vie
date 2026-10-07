import { Layout, Menu } from 'antd'
import { Link, Route, Routes } from 'react-router'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import './index.css'

const { Header, Content } = Layout

export default function App() {
  return (
    <Layout className="layout">
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          items={[
            { key: 'home', label: <Link to="/">Главная</Link> },
            { key: 'catalog', label: <Link to="/catalog">Каталог</Link> },
          ]}
        />
      </Header>
      <Content className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
        </Routes>
      </Content>
    </Layout>
  )
}
