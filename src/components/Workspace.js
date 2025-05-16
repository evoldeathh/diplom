import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import DraggableWidget from './DraggableWidget';
import SliderWidget from './SliderWidget';
import SwitchWidget from './SwitchWidget';

const Workspace = ({ 
  widgets, 
  controllers, 
  onMoveWidget, 
  onConfigure,
  onWidgetChange 
}) => {
  const workspaceRef = useRef(null);

  const [, drop] = useDrop({
    accept: 'widget',
    drop(item, monitor) {
      if (!workspaceRef.current) return;
      
      // Получаем координаты относительно workspace
      const offset = monitor.getClientOffset();
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      
      // Вычисляем позицию с учетом прокрутки
      const position = {
        x: offset.x - workspaceRect.left + workspaceRef.current.scrollLeft,
        y: offset.y - workspaceRect.top + workspaceRef.current.scrollTop
      };

      if (item.id) {
        onMoveWidget(item.id, position);
      }
    }
  });

  return (
    <div 
      ref={(node) => {
        drop(node);
        workspaceRef.current = node;
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        border: '1px dashed #ccc',
        backgroundColor: '#fafafa',
        overflow: 'auto'
      }}
    >
      {widgets.map(widget => {
        const controller = controllers.find(c => c.id === widget.controllerId);
        const pin = controller?.pins.find(p => p.pin === widget.pin);
        
        return (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            type={widget.type}
            position={widget.position || { x: 50, y: 50 }}
            onMove={(id, pos) => onMoveWidget(id, pos)}
            onClick={() => onConfigure(widget.id)}
            containerRef={workspaceRef} // Передаем ссылку на контейнер
          >
            {widget.type === 'slider' ? (
              <SliderWidget
                device={{ 
                  ...pin,
                  name: controller ? `${controller.name} (${pin.pin})` : 'Не привязано',
                  current_value: widget.value
                }}
                onChange={(value) => onWidgetChange(widget.id, value)}
              />
            ) : (
              <SwitchWidget
                device={{ 
                  ...pin,
                  name: controller ? `${controller.name} (${pin.pin})` : 'Не привязано',
                  current_value: widget.value ? 'ON' : 'OFF'
                }}
                onChange={(value) => onWidgetChange(widget.id, value === 'ON' ? 1 : 0)}
              />
            )}
          </DraggableWidget>
        );
      })}
    </div>
  );
};

export default Workspace;