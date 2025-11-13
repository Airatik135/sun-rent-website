// src/components/Enhanced3DLogin.js
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';

const LoginScene = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef();
  const formRef = useRef();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const { camera } = useThree();

  // Анимация вращения камеры
  useFrame(() => {
    if (isSpinning && !isLoggingIn && !loginSuccess) {
      camera.position.x = Math.sin(Date.now() * 0.001) * 5;
      camera.position.z = Math.cos(Date.now() * 0.001) * 5;
      camera.lookAt(0, 0, 0);
    }
  });

  // Обработка входа с Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    setError('');
    setIsLoggingIn(true);
    setIsSpinning(false);
    
    try {
      // Аутентификация через Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Анимация завершения входа
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoginSuccess(true);
      
      // Задержка перед переходом с анимацией приветствия
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLogin();
    } catch (err) {
      let errorMessage = 'Ошибка входа';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Пользователь с таким email не найден';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Неверный пароль';
      } else {
        errorMessage = 'Произошла ошибка при входе: ' + err.message;
      }
      
      setError(errorMessage);
      setIsLoggingIn(false);
      setIsSpinning(true);
      console.error("Ошибка входа:", err);
    }
  };

  // Эффект лазерного луча при входе
  const LaserBeam = () => {
    const [progress, setProgress] = useState(0);
    
    useFrame(() => {
      if (isLoggingIn && progress < 1) {
        setProgress(prev => Math.min(prev + 0.02, 1));
      }
    });
    
    if (progress === 0) return null;
    
    return (
      <group>
        {/* Лазерный луч */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, progress * 10, 32]} />
          <meshBasicMaterial color="#0077ff" transparent opacity={0.7} />
        </mesh>
        
        {/* Энергетическое кольцо */}
        <mesh position={[0, 0, progress * 5]}>
          <torusGeometry args={[0.8, 0.1, 16, 100]} />
          <meshBasicMaterial color="#0077ff" transparent opacity={0.8} />
        </mesh>
      </group>
    );
  };

  // Система частиц (исправленная версия)
  const Particles = () => {
    const particles = useRef();
    const { size } = useThree();
    
    useEffect(() => {
      if (!particles.current) return;
      
      const count = 150;
      const positions = new Float32Array(count * 3);
      
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }
      
      particles.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }, []);
    
    useFrame(() => {
      if (particles.current && 
          particles.current.geometry && 
          particles.current.geometry.attributes && 
          particles.current.geometry.attributes.position) {
        
        const positionAttribute = particles.current.geometry.attributes.position;
        
        for (let i = 0; i < positionAttribute.count; i++) {
          // Обновляем только Z-координату (i % 3 === 2)
          if (i % 3 === 2) {
            positionAttribute.setZ(i, positionAttribute.getZ(i) + 0.01);
            if (positionAttribute.getZ(i) > 5) {
              positionAttribute.setZ(i, -5);
            }
          }
        }
        
        positionAttribute.needsUpdate = true;
      }
    });
    
    return (
      <points ref={particles}>
        <bufferGeometry />
        <pointsMaterial 
          size={0.1} 
          color="#0077ff" 
          transparent 
          opacity={0.7} 
          sizeAttenuation={true} 
        />
      </points>
    );
  };

  // Анимация приветствия после входа
  const WelcomeAnimation = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("ДОБРО ПОЖАЛОВАТЬ");
    const [subMessage, setSubMessage] = useState("");
    
    useFrame(() => {
      if (loginSuccess && progress < 1) {
        setProgress(prev => Math.min(prev + 0.02, 1));
        
        // Анимация текста
        if (progress > 0.3) {
          setMessage("ДОБРО ПОЖАЛОВАТЬ");
        }
        if (progress > 0.5) {
          setSubMessage("Загрузка системы...");
        }
      }
    });
    
    if (!loginSuccess) return null;
    
    return (
      <group>
        {/* Пульсирующий фон */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshStandardMaterial 
            color="#001a4d" 
            transparent 
            opacity={0.8} 
            roughness={0.5}
          />
        </mesh>
        
        {/* Сияющий круг */}
        <mesh position={[0, 0, 0.5]}>
          <ringGeometry args={[2.5, 2.7, 32]} />
          <meshStandardMaterial 
            color="#0077ff" 
            emissive="#0055ff" 
            emissiveIntensity={0.8}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Текст приветствия */}
        <Html distanceFactor={0.8} center>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0, 100, 255, 0.7)',
            opacity: progress
          }}>
            {message}
            <div style={{
              fontSize: '1.2rem',
              marginTop: '20px',
              opacity: progress > 0.5 ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}>
              {subMessage}
            </div>
          </div>
        </Html>
        
        {/* Анимация пульсации */}
        {progress > 0.2 && (
          <mesh position={[0, 0, 1]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              color="#0077ff" 
              emissive="#0077ff" 
              emissiveIntensity={0.8 + Math.sin(Date.now() * 0.003) * 0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>
    );
  };

  // Форма входа как 3D объект
  const LoginForm = () => {
    const [isHovered, setIsHovered] = useState(false);

    // Предотвращаем событие blur для input полей
    const handleInputFocus = (e) => {
      // Для мобильных устройств предотвращаем автоматическую скролл-анимацию
      if ('ontouchstart' in window) {
        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };

    // Управление фокусом
    useEffect(() => {
      const handleTouchStart = (e) => {
        if (emailInputRef.current && emailInputRef.current.contains(e.target)) {
          setIsSpinning(false);
        } else if (passwordInputRef.current && passwordInputRef.current.contains(e.target)) {
          setIsSpinning(false);
        } else {
          setIsSpinning(true);
        }
      };

      document.addEventListener('touchstart', handleTouchStart);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }, []);

    return (
      <Html distanceFactor={1} center>
        <div 
          ref={formRef}
          style={{
            backgroundColor: 'rgba(10, 15, 40, 0.85)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(100, 150, 255, 0.7)',
            borderRadius: '20px',
            padding: '35px',
            width: '320px',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            boxShadow: isHovered ? 
              '0 0 40px rgba(100, 150, 255, 0.9)' : 
              '0 0 20px rgba(50, 100, 255, 0.7)',
            color: 'white'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '25px',
            fontSize: '24px',
            letterSpacing: '2px'
          }}>ВХОД В СИСТЕМУ</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleInputFocus}
              ref={emailInputRef}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #4a6fa5',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              ref={passwordInputRef}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #4a6fa5',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isLoggingIn ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
          </form>
          {error && <p style={{ 
            color: 'red', 
            marginTop: '15px', 
            fontSize: '14px',
            textAlign: 'center'
          }}>{error}</p>}
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '15px'
          }}>
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#88aaff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showPassword ? 'Скрыть' : 'Показать'} пароль
            </button>
          </div>
        </div>
      </Html>
    );
  };

  return (
    <group ref={containerRef}>
      {/* Основная анимация */}
      <group position={[0, 0, -5]}>
        {/* Дополнительные визуальные элементы */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={500}
              itemSize={3}
              array={new Float32Array(500 * 3).map(() => Math.random() * 10 - 22)}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.15} 
            color="#4a80ff" 
            transparent 
            opacity={0.6} 
            sizeAttenuation={true} 
          />
        </points>
      </group>

      {/* Система частиц */}
      <Particles />
      
      {/* Лазерный луч при входе */}
      {isLoggingIn && !loginSuccess && <LaserBeam />}
      
      {/* Анимация приветствия после входа */}
      {loginSuccess && <WelcomeAnimation />}
      
      {/* 3D-форма входа */}
      {!loginSuccess && <LoginForm />}
    </group>
  );
};

const Enhanced3DLogin = ({ onLogin }) => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'linear-gradient(135deg, #00001a 0%, #000033 100%)',
      overflow: 'hidden',
      zIndex: 1
    }}>
      <Canvas 
        camera={{ position: [1, 1], fov: 15 }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 3, 0]} intensity={2} color="#0077ff" />
        <spotLight 
          position={[0, 2, 0]} 
          intensity={2} 
          color="#ffffff"
          castShadow
        />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} />
        <LoginScene onLogin={onLogin} />
      </Canvas>
    </div>
  );
};

export default Enhanced3DLogin;
