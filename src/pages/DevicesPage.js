import React, { useState } from 'react';
import { Button, Card, Modal, Input, Select, Table, Divider, Tag } from 'antd';

const { Option } = Select;
const DevicesPage = ({ controllers, onAddController, onDeleteController }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newController, setNewController] = useState({
    name: "",
    type: "ESP32",
    pins: [{ pin: "", type: "digital", mode: "output" }]
  });

  const handleAddPin = () => {
    setNewController({
      ...newController,
      pins: [...newController.pins, { pin: "", type: "digital", mode: "output" }]
    });
  };

  const handleAddController = () => {
    if (!newController.name || newController.pins.some(p => !p.pin)) {
      alert("Заполните все поля!");
      return;
    }
    onAddController(newController);
    setIsModalOpen(false);
    setNewController({
      name: "",
      type: "ESP32",
      pins: [{ pin: "", type: "digital", mode: "output" }]
    });
  };

  return (
    <div className='devices-page'>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Добавить микроконтроллер
      </Button>

      <Modal
        title="Новый микроконтроллер"
        open={isModalOpen}
        onOk={handleAddController}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Input
          placeholder="Название (ESP32 Кухня)"
          value={newController.name}
          onChange={(e) => setNewController({...newController, name: e.target.value})}
          style={{ marginBottom: 16 }}
        />
        
        <Select
          value={newController.type}
          onChange={(type) => setNewController({...newController, type})}
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Option value="ESP32">ESP32</Option>
          <Option value="Arduino">Arduino</Option>
          <Option value="Raspberry">Raspberry Pi</Option>
        </Select>

        <Divider orientation="left">Конфигурация пинов</Divider>
        {newController.pins.map((pin, index) => (
          <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <Input
              placeholder="Пин (D12, A0)"
              value={pin.pin}
              onChange={(e) => {
                const newPins = [...newController.pins];
                newPins[index].pin = e.target.value.toUpperCase();
                setNewController({...newController, pins: newPins});
              }}
              style={{ width: 120 }}
            />
            <Select
              value={pin.type}
              onChange={(type) => {
                const newPins = [...newController.pins];
                newPins[index].type = type;
                setNewController({...newController, pins: newPins});
              }}
              style={{ width: 120 }}
            >
              <Option value="digital">Цифровой</Option>
              <Option value="analog">Аналоговый</Option>
            </Select>
            <Select
              value={pin.mode}
              onChange={(mode) => {
                const newPins = [...newController.pins];
                newPins[index].mode = mode;
                setNewController({...newController, pins: newPins});
              }}
              style={{ width: 120 }}
            >
              <Option value="input">Input</Option>
              <Option value="output">Output</Option>
            </Select>
            <Button 
              danger 
              onClick={() => {
                const newPins = [...newController.pins];
                newPins.splice(index, 1);
                setNewController({...newController, pins: newPins});
              }}
            >
              Удалить
            </Button>
          </div>
        ))}
        <Button onClick={handleAddPin}>Добавить пин</Button>
      </Modal>

      <div style={{ marginTop: 20 }}>
        {controllers.map(controller => (
          <Card 
            key={controller.id} 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{controller.type}: {controller.name}</span>
                <Tag color={controller.status === "online" ? "green" : "red"} style={{ marginLeft: 10 }}>
                  {controller.status}
                </Tag>
              </div>
            }
            extra={
              <Button 
                danger 
                onClick={() => onDeleteController(controller.id)}
              >
                Удалить
              </Button>
            }
            style={{ marginBottom: 20 }}
          >
            <Table
              columns={[
                { title: 'Пин', dataIndex: 'pin' },
                { title: 'Тип', dataIndex: 'type' },
                { title: 'Режим', dataIndex: 'mode' },
                { 
                  title: 'Значение', 
                  dataIndex: 'value',
                  render: (value, record) => (
                    record.type === 'digital' 
                      ? (value ? 'HIGH' : 'LOW')
                      : value
                  )
                }
              ]}
              dataSource={controller.pins}
              size="small"
              pagination={false}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DevicesPage;