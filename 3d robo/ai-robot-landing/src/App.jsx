import { useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Robot, GroundReflection, Particles } from './RobotScene'
import BrainfuckRain from './BrainfuckRain'
import './landing.css'

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.06} color="#111118" />
      <directionalLight
        position={[-3, 5, 3]}
        intensity={4.5}
        color="#cce0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
        shadow-bias={-0.001}
      />
      <directionalLight position={[4, 2, -3]} intensity={1.2} color="#2255ff" />
      <directionalLight position={[0, 1, 5]} intensity={0.3} color="#ffffff" />
      <pointLight position={[0, -1.2, 0.8]} color="#3399ff" intensity={0.8} distance={3.5} />
      <fog attach="fog" args={['#080d1a', 10, 28]} />
    </>
  )
}

export default function App() {
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
    mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }, [])

  return (
    <div
      className="app-root"
      onMouseMove={handleMouseMove}
    >
      {/* Brainfuck rain — behind everything */}
      <BrainfuckRain />

      {/* 3D Canvas — right half */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 3.8], fov: 46, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        className="robot-canvas"
      >
        <Lighting />
        <Environment preset="city" />
        <Robot mouseRef={mouseRef} />
        <GroundReflection />
        <Particles />
      </Canvas>

      {/* Landing UI overlay — left half */}
      <div className="landing-ui">
        <nav className="landing-nav">
          <span className="nav-logo">FocusLearn<span className="nav-dot">.</span></span>
          <div className="nav-links">
            <a href="#">Features</a>
            <a href="#">How it works</a>
            <a href="#">Pricing</a>
            <a href="#">Docs</a>
          </div>
          <button className="btn-nav-cta">Get Started</button>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI Learning Platform
          </div>

          <h1 className="hero-title">
            Stay <span className="text-teal">Focused.</span><br />
            Learn <span className="text-yellow">Smarter.</span>
          </h1>

          <p className="hero-desc">
            Real-time attention monitoring and adaptive learning
            to deliver exceptional outcomes. Designed for
            students who face focus and attention-related challenges.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Learn More</button>
            <button className="btn-secondary">Watch Demo →</button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">98<span className="text-teal">%</span></span>
              <span className="stat-label">Focus accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">2x<span className="text-yellow">+</span></span>
              <span className="stat-label">Better retention</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">10k<span className="text-teal">+</span></span>
              <span className="stat-label">Active learners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edge vignette */}
      <div className="vignette" />
    </div>
  )
}
