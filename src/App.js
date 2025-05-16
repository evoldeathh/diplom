import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout, notification } from 'antd';
import Dashboard from './pages/Dashboard';
import ViewDashboard from './pages/ViewDashboardpage';
import DevicesPage from './pages/DevicesPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const { Content } = Layout;

function App() {
  const [controllers, setControllers] = useState([
    {
      id: 1,
      name: "ESP32 Кухня",
      type: "ESP32",
      status: "online",
      pins: [
        { pin: "D12", type: "digital", mode: "output", value: 0 },
        { pin: "A0", type: "analog", mode: "input", value: 512 }
      ]
    }
  ]);

  const [dashboards, setDashboards] = useState([
    {
      id: 1,
      name: "Пример дашборда",
      widgets: [
        {
          id: 1,
          type: "switch",
          controllerId: 1,
          pin: "D12",
          position: { x: 50, y: 50 }
        },
        {
          id: 2,
          type: "slider",
          controllerId: 1,
          pin: "A0",
          position: { x: 200, y: 50 }
        }
      ]
    }
  ]);

  const addController = (controller) => {
    const newController = {
      ...controller,
      id: Date.now(),
      status: "online",
      pins: controller.pins.map(pin => ({
        ...pin,
        value: pin.type === "digital" ? 0 : 0
      }))
    };
    setControllers([...controllers, newController]);
  };

  const deleteController = (id) => {
    setControllers(controllers.filter(c => c.id !== id));
  };

  const updatePinValue = (controllerId, pin, value) => {
    setControllers(controllers.map(ctrl => 
      ctrl.id === controllerId
        ? {
            ...ctrl,
            pins: ctrl.pins.map(p => 
              p.pin === pin ? { ...p, value: value } : p
            )
          }
        : ctrl
    ));
  };

  const saveDashboard = async (dashboard) => {
    return new Promise((resolve) => {
      const newId = dashboard.id || Date.now();
      setDashboards(prev => {
        const updated = prev.some(d => d.id === newId)
          ? prev.map(d => d.id === newId ? dashboard : d)
          : [...prev, { ...dashboard, id: newId }];
        return updated;
      });
      resolve(newId);
    });
  };

  const deleteDashboard = (id) => {
    setDashboards(dashboards.filter(d => d.id !== id));
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Layout>
          <Sidebar />
          <Content style={{ padding: '24px', background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={
                <Dashboard
                  dashboards={dashboards}
                  controllers={controllers}
                  onSaveDashboard={saveDashboard}
                  onDeleteDashboard={deleteDashboard}
                />
              } />
              <Route path="/dashboard/:id/view" element={
                <ViewDashboard
                  dashboards={dashboards}
                  controllers={controllers}
                  onUpdatePin={updatePinValue}
                />
              } />
              <Route path="/devices" element={
                <DevicesPage
                  controllers={controllers}
                  onAddController={addController}
                  onDeleteController={deleteController}
                />
              } />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;