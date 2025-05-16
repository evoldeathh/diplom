import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Input, Card, Modal, Select, Space, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EmptyDashboard from '../components/EmptyDashboard';
import WidgetPalette from '../components/WidgetPalette';
import Workspace from '../components/Workspace';

const { Content } = Layout;
const { Option } = Select;

const Dashboard = ({ 
  dashboards, 
  controllers, 
  onSaveDashboard, 
  onDeleteDashboard 
}) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState('Новый дашборд');
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [localControllers, setLocalControllers] = useState(controllers);

  // Инициализация локальных состояний
  useEffect(() => {
    if (editingDashboard) {
      setDashboardName(editingDashboard.name);
      setWidgets(editingDashboard.widgets);
    } else {
      setDashboardName('Новый дашборд');
      setWidgets([]);
    }
  }, [editingDashboard]);

  const availablePins = localControllers.flatMap(controller => 
    controller.pins.map(pin => ({
      controllerId: controller.id,
      controllerName: controller.name,
      pin: pin.pin,
      type: pin.type,
      mode: pin.mode,
      value: pin.value,
      label: `${controller.name} (${pin.pin})`
    }))
  );

  const handleAddWidget = (type) => {
    const newWidget = {
      id: Date.now(),
      type,
      position: { x: 50, y: 50 },
      controllerId: null,
      pin: null,
      deviceName: 'Не привязано',
      value: type === 'switch' ? false : 50 // Добавляем начальное значение
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget.id);
    setIsPinModalOpen(true);
  };

  const handlePinSelect = () => {
    if (!selectedPin) return;
    
    const [controllerId, pin] = selectedPin.split('|');
    const controller = localControllers.find(c => c.id === controllerId);
    const pinData = controller?.pins.find(p => p.pin === pin);

    if (!controller || !pinData) return;

    setWidgets(widgets.map(w => 
      w.id === selectedWidget 
        ? { 
            ...w, 
            controllerId, 
            pin,
            deviceName: `${controller.name} (${pin})`,
            value: pinData.value
          } 
        : w
    ));
    
    setIsPinModalOpen(false);
    setSelectedPin(null);
  };

  // Обработчик изменения значения виджета
  const handleWidgetChange = (widgetId, value) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Обновляем значение виджета
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, value } : w
    ));

    // Если виджет привязан к устройству, обновляем и устройство
    if (widget.controllerId && widget.pin) {
      setLocalControllers(prev => 
        prev.map(controller => 
          controller.id === widget.controllerId
            ? {
                ...controller,
                pins: controller.pins.map(p => 
                  p.pin === widget.pin ? { ...p, value } : p
                )
              }
            : controller
        )
      );
    }
  };

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      notification.error({
        message: 'Ошибка',
        description: 'Введите название дашборда'
      });
      return;
    }

    const validatedWidgets = widgets.map(w => ({
      ...w,
      position: w.position || { x: 50, y: 50 },
      deviceName: w.deviceName || 'Не привязано'
    }));

    if (validatedWidgets.length === 0) {
      notification.error({
        message: 'Ошибка',
        description: 'Добавьте хотя бы один виджет'
      });
      return;
    }

    const newDashboard = {
      id: editingDashboard?.id || Date.now(),
      name: dashboardName,
      widgets: validatedWidgets
    };

    try {
      const savedId = await onSaveDashboard(newDashboard);
      setIsCreating(false);
      setEditingDashboard(null);
      navigate(`/dashboard/${savedId}/view`);
    } catch (error) {
      notification.error({
        message: 'Ошибка',
        description: 'Не удалось сохранить дашборд'
      });
    }
  };

  return (
    <Layout className='dashboard-layout'>
      <Content className='dashboard-content'>
        {!isCreating ? (
          <>
            {dashboards.length === 0 ? (
              <EmptyDashboard onCreateDashboard={() => setIsCreating(true)} />
            ) : (
              <>
                <div className='dashboard-header'>
                  <h1>Мои дашборды</h1>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingDashboard(null);
                      setIsCreating(true);
                    }}
                  >
                    Создать дашборд
                  </Button>
                </div>
                
                <div className='dashboard-grid'>
                  {dashboards.map(dashboard => (
                    <Card
                      key={dashboard.id}
                      className='dashboard-card'
                      title={dashboard.name}
                      actions={[
                        <Button 
                          type="text" 
                          onClick={() => {
                            setEditingDashboard(dashboard);
                            setIsCreating(true);
                          }}
                        >
                          Редактировать
                        </Button>,
                        <Button 
                          type="text" 
                          danger 
                          onClick={() => onDeleteDashboard(dashboard.id)}
                        >
                          Удалить
                        </Button>,
                        <Button 
                          type="text"
                          onClick={() => navigate(`/dashboard/${dashboard.id}/view`)}
                        >
                          Просмотр
                        </Button>
                      ]}
                    >
                      <p>Виджетов: {dashboard.widgets.length}</p>
                      <p>Устройств: {
                        new Set(dashboard.widgets
                          .filter(w => w.controllerId)
                          .map(w => w.controllerId))
                        .size
                      }</p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className='dashboard-editor-header'>
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className='dashboard-name-input'
                placeholder="Название дашборда"
              />
              <Space>
                <Button onClick={() => {
                  setIsCreating(false);
                  setEditingDashboard(null);
                }}>
                  Отмена
                </Button>
                <Button type="primary" onClick={handleSaveDashboard}>
                  Сохранить дашборд
                </Button>
              </Space>
            </div>

            <div className='dashboard-editor'>
              <WidgetPalette onAddWidget={handleAddWidget} />
              <Workspace 
                widgets={widgets} 
                controllers={localControllers}
                onMoveWidget={(id, newPos) => 
                  setWidgets(widgets.map(w => 
                    w.id === id ? { ...w, position: newPos } : w
                  ))
                }
                onConfigure={(id) => {
                  setSelectedWidget(id);
                  setIsPinModalOpen(true);
                }}
                onWidgetChange={handleWidgetChange} // Добавляем новый пропс
              />
            </div>

            <Modal
              title="Привязка к пину устройства"
              open={isPinModalOpen}
              onCancel={() => {
                setIsPinModalOpen(false);
                setSelectedPin(null);
              }}
              footer={[
                <Button key="cancel" onClick={() => setIsPinModalOpen(false)}>
                  Отмена
                </Button>,
                <Button 
                  key="submit" 
                  type="primary" 
                  onClick={handlePinSelect}
                  disabled={!selectedPin}
                >
                  Привязать
                </Button>
              ]}
            >
              <Select
                placeholder="Выберите пин устройства"
                style={{ width: '100%' }}
                onChange={setSelectedPin}
                value={selectedPin}
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availablePins
                  .filter(pin => {
                    const widget = widgets.find(w => w.id === selectedWidget);
                    if (!widget) return false;
                    
                    if (widget.type === 'switch') {
                      return pin.type === 'digital' && pin.mode === 'output';
                    }
                    else if (widget.type === 'slider') {
                      return pin.type === 'analog' && pin.mode === 'output';
                    }
                    return pin.mode === 'input';
                  })
                  .map(pin => (
                    <Option 
                      key={`${pin.controllerId}|${pin.pin}`} 
                      value={`${pin.controllerId}|${pin.pin}`}
                    >
                      {`${pin.controllerName} - ${pin.pin} (${pin.type}, ${pin.mode}, Текущее значение: ${pin.value})`}
                    </Option>
                  ))}
              </Select>
            </Modal>
          </DndProvider>
        )}
      </Content>
    </Layout>
  );
};

export default Dashboard;