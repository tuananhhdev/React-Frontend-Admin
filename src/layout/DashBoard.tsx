import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const DashBoard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <>
      <Layout className="min-h-screen">
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical">
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[location.pathname]}
              items={[
                {
                  key: "/",
                  icon: <ProductOutlined />,
                  label: <Link to={"/"}>Products</Link>,
                },
                // {
                //   key: "/admin",
                //     icon: <UserOutlined />,
                //     label: <Link to={"/admin"}>
                      
                //   </Link>
                // },
                // {
                //   key: "/admin",
                //   icon: <VideoCameraOutlined />,
                //   label: <Link to={"/admin"}>Quản lí phim</Link>,
                // },
                // {
                //   key: "/admin/add-movie",
                //   icon: <VideoCameraOutlined />,
                //   label: <Link to={"/admin/add-movie"}>Tạo phim</Link>,
                // },
                // {
                //   key: "/admin/manager-order",
                //   icon: <UploadOutlined />,
                //   label: (
                //     <Link to={"/admin/manager-order"}>Quản lí lịch đặt vé</Link>
                //   ),
                // },
              ]}
            />
          </div>
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default DashBoard;
