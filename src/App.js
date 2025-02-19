import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScenarioPage from './pages/ScenarioPage';
import DevicesPage from './pages/DevicesPage';
import NotFound from './pages/NotFound';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Функция для обработки входа
  const handleLogin = (email, password) => {
    console.log('Вход:', email, password);
    setIsLoggedIn(true);
  };

  // Функция для обработки регистрации
  const handleRegister = (email, password) => {
    console.log('Регистрация:', email, password);
    setIsLoggedIn(true); // После регистрации автоматически входим в систему
  };

  // Функция для выхода
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Главная страница — это страница авторизации */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/home" />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />

        {/* Страница регистрации */}
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/home" />
            ) : (
              <RegistrationForm onRegister={handleRegister} />
            )
          }
        />

        {/* Защищенные маршруты */}
        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/scenarios"
          element={
            isLoggedIn ? (
              <ScenarioPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/devices"
          element={
            isLoggedIn ? (
              <DevicesPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Страница 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;