import React from 'react';
import { Slider, Card, Tag } from 'antd';

const SliderWidget = ({ value = 50, onChange, device }) => {
  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Card 
      title={
        <div>
          Слайдер
          <Tag 
            color={device?.name === 'Не привязано' ? 'red' : 'green'} 
            style={{ marginLeft: 8 }}
          >
            {device?.name}
          </Tag>
        </div>
      } 
      size="small"
      style={{ width: 280 }}
    >
      <div style={{ padding: '0 10px' }}>
        <Slider
          min={0}
          max={100}
          value={value}
          onChange={handleChange}
        />
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          Текущее значение: {value}
        </div>
      </div>
    </Card>
  );
};

export default SliderWidget;