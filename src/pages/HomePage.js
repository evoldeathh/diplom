import React, { useState } from 'react';
import Form from '../components/Form';
import Card from '../components/Card';

const HomePage = () => {
  const [scenes, setScenes] = useState([]);

  const addScene = (name) => {
    setScenes([...scenes, { name, status: 'ВКЛ/ВЫКЛ' }]);
  };

  const deleteScene = (index) => {
    setScenes(scenes.filter((_, i) => i !== index));
  };

  const configureScene = (index) => {
    // Логика для настройки сцены
    console.log(`Настройка сцены ${index}`);
  };

  return (
    <div>
      <h1>Наше название</h1>
      <Form onSubmit={addScene} />
      {scenes.map((scene, index) => (
        <Card
          key={index}
          title={scene.name}
          status={scene.status}
          onConfigure={() => configureScene(index)}
          onDelete={() => deleteScene(index)}
        />
      ))}
    </div>
  );
};

export default HomePage;
