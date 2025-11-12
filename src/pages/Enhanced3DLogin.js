// src/components/Enhanced3DLogin.js
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

const LoginScene = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef();
  const formRef = useRef();
  const { camera } = useThree();

  // Анимация вращения камеры
  useFrame(() => {
    if (isSpinning && !isSubmitted) {
      camera.position.x = Math.sin(Date.now() * 0.001) * 5;
      camera.position.z = Math.cos(Date.now() * 0.001) * 5;
      camera.lookAt(0, 0, 0);
    }
  });

  // Обработка входа
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitted(true);
      setIsSpinning(false);
      
      // Анимация завершения входа
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoginSuccess(true);
      onLogin();
    } catch (err) {
      setError('Ошибка входа');
      setIsSubmitted(false);
      setIsSpinning(true);
    }
  };

  // Эффект лазерного луча при входе
  const LaserBeam = () => {
    const [progress, setProgress] = useState(0);
    
    useFrame(() => {
      if (isSubmitted && progress < 1) {
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

  // Система частиц
  const Particles = () => {
    const particles = useRef();
    const { size } = useThree();
    
    useEffect(() => {
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
      if (particles.current) {
        particles.current.geometry.attributes.position.array.forEach((v, i) => {
          if (i % 3 === 2) {
            particles.current.geometry.attributes.position.array[i] += 0.01;
            if (particles.current.geometry.attributes.position.array[i] > 5) {
              particles.current.geometry.attributes.position.array[i] = -5;
            }
          }
        });
        particles.current.geometry.attributes.position.needsUpdate = true;
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

  // Форма входа как 3D объект
  const LoginForm = () => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <Html distanceFactor={1.5} center>
        <div 
          ref={formRef}
          style={{
            backgroundColor: 'rgba(10, 15, 40, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(100, 150, 255, 0.5)',
            borderRadius: '15px',
            padding: '30px',
            width: '300px',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            boxShadow: isHovered ? 
              '0 0 30px rgba(100, 150, 255, 0.7)' : 
              '0 0 15px rgba(50, 100, 255, 0.5)',
            color: 'white'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ВХОД В СИСТЕМУ</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                border: '1px solid #4a6fa5',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'white'
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                border: '1px solid #4a6fa5',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'white'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '15px',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isSubmitted ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
          </form>
          {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
        </div>
      </Html>
    );
  };

  return (
    <group ref={containerRef}>
      {/* Основная анимация */}
      <group position={[0, 0, 0]}>
        {/* Центральный элемент */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <meshStandardMaterial 
            color="#0d47a1" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#003366"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Внутренний вращающийся элемент */}
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial 
            color="#1a237e" 
            metalness={0.95} 
            roughness={0.05}
            emissive="#0055ff"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Освещение */}
        <spotLight 
          position={[0, 2, 0]} 
          intensity={2} 
          color="#ffffff"
          castShadow
        />
        <pointLight 
          position={[0, 3, 0]} 
          intensity={3} 
          color="#0077ff"
        />
      </group>

      {/* Система частиц */}
      <Particles />
      
      {/* Лазерный луч при входе */}
      <LaserBeam />
      
      {/* 3D-форма входа */}
      <LoginForm />
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
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.5} />
        <Environment preset="city" />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} />
        <LoginScene onLogin={onLogin} />
      </Canvas>
    </div>
  );
};

export default Enhanced3DLogin;
