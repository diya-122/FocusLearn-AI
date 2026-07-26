import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── MATERIALS ─────────────────────────────────────────────────────────────────
function useMaterials(isDark) {
  return useMemo(() => {
    const white = new THREE.MeshPhongMaterial({ color: isDark ? '#e0ecff' : '#c8d8f0', shininess: 120 })
    const whiteDeep = new THREE.MeshPhongMaterial({ color: isDark ? '#b8cce0' : '#9ab0cc', shininess: 80 })
    const visor = new THREE.MeshPhongMaterial({ color: '#0a1520', shininess: 200, specular: '#334466' })
    const cyan = new THREE.MeshStandardMaterial({ color: '#00c8ff', emissive: '#00c8ff', emissiveIntensity: isDark ? 2.5 : 1.5, roughness: 0, metalness: 0 })
    const glowWhite = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#66ddff', emissiveIntensity: isDark ? 4 : 2.5, roughness: 0, metalness: 0 })
    const chrome = new THREE.MeshPhongMaterial({ color: isDark ? '#9aaabb' : '#7a8a9a', shininess: 200, specular: '#ffffff' })
    const darkChrome = new THREE.MeshPhongMaterial({ color: isDark ? '#3a4455' : '#2a3445', shininess: 120 })
    const blueRing = new THREE.MeshStandardMaterial({ color: '#0099dd', emissive: '#0066bb', emissiveIntensity: isDark ? 1.0 : 0.6, roughness: 0.3, metalness: 0.4 })
    return { white, whiteDeep, visor, cyan, glowWhite, chrome, darkChrome, blueRing }
  }, [isDark])
}

// ── HEAD ──────────────────────────────────────────────────────────────────────
function Head({ mouseRef, mat, action }) {
  const ref = useRef()

  useFrame((s) => {
    if (!ref.current) return
    let targetY = mouseRef.current.x * 0.3
    let targetX = -mouseRef.current.y * 0.15

    if (action === 'nod') {
      targetX = Math.sin(s.clock.elapsedTime * 12) * 0.4
    } else if (action === 'cheer') {
      targetX = -0.3 // look up
    }

    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, 0.12)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, 0.12)
  })

  return (
    <group ref={ref} position={[0, 0.88, 0]}>
      {/* Main round white helmet */}
      <mesh material={mat.white} castShadow>
        <sphereGeometry args={[0.36, 32, 32]} />
      </mesh>

      {/* Blue stripe band on top */}
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
        <torusGeometry args={[0.31, 0.022, 10, 48]} />
      </mesh>

      {/* 3 top slot vents */}
      {[-0.09, 0, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.34, 0.07]} rotation={[0.15, 0, 0]} material={mat.visor}>
          <boxGeometry args={[0.05, 0.022, 0.028]} />
        </mesh>
      ))}

      {/* Dark visor face */}
      <mesh position={[0, -0.01, 0.22]} material={mat.visor} scale={[1.2, 0.75, 0.35]}>
        <sphereGeometry args={[0.32, 28, 28]} />
      </mesh>
      {/* Visor cyan border */}
      <mesh position={[0, -0.01, 0.245]} material={mat.blueRing} scale={[1.2, 0.75, 1]}>
        <torusGeometry args={[0.295, 0.018, 10, 48]} />
      </mesh>

      {/* LEFT eye (Happy semi-circle) */}
      <mesh position={[-0.11, 0.05, 0.315]} rotation={[Math.PI / 2, 0, 0]} material={mat.cyan} scale={[1.3, 0.3, 1]}>
        <sphereGeometry args={[0.045, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      
      {/* RIGHT eye (Happy semi-circle) */}
      <mesh position={[0.11, 0.05, 0.315]} rotation={[Math.PI / 2, 0, 0]} material={mat.cyan} scale={[1.3, 0.3, 1]}>
        <sphereGeometry args={[0.045, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Smile (curved arc) */}
      <mesh position={[0, -0.07, 0.33]} rotation={[0, 0, Math.PI]} material={mat.cyan} scale={[1, 1, 0.5]}>
        <torusGeometry args={[0.045, 0.018, 12, 24, Math.PI]} />
      </mesh>

      {/* Eye glow */}
      <pointLight position={[0, 0.02, 0.4]} color="#00ccff" intensity={3} distance={0.8} />

      {/* Neck */}
      <mesh position={[0, -0.36, 0]} material={mat.chrome} castShadow>
        <cylinderGeometry args={[0.088, 0.1, 0.14, 16]} />
      </mesh>
      <mesh position={[0, -0.43, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
        <torusGeometry args={[0.094, 0.014, 8, 32]} />
      </mesh>
    </group>
  )
}

// ── TORSO ─────────────────────────────────────────────────────────────────────
function Torso({ mat }) {
  const glowRef = useRef()
  useFrame((s) => {
    if (glowRef.current) glowRef.current.intensity = 3 + Math.sin(s.clock.elapsedTime * 3.5) * 1.2
  })

  return (
    <group position={[0, 0.2, 0]}>
      {/* Main chest */}
      <mesh material={mat.white} castShadow receiveShadow scale={[1.18, 1.0, 0.86]}>
        <sphereGeometry args={[0.3, 28, 28]} />
      </mesh>
      {/* Lower belly */}
      <mesh position={[0, -0.2, 0.14]} material={mat.whiteDeep} scale={[0.9, 0.6, 0.6]}>
        <sphereGeometry args={[0.26, 16, 16]} />
      </mesh>

      {/* Chest glow ring */}
      <mesh position={[0, 0.07, 0.275]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
        <torusGeometry args={[0.078, 0.018, 12, 40]} />
      </mesh>
      <mesh position={[0, 0.07, 0.285]} material={mat.glowWhite}>
        <circleGeometry args={[0.06, 32]} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.07, 0.45]} color="#88eeff" intensity={3} distance={1.4} />

      <pointLight ref={glowRef} position={[0, 0.07, 0.45]} color="#88eeff" intensity={3} distance={1.4} />

      {/* Waist */}
      <mesh position={[0, -0.29, 0]} material={mat.chrome} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.1, 18]} />
      </mesh>
      {/* Hip */}
      <mesh position={[0, -0.4, 0]} material={mat.white} castShadow scale={[1.12, 0.55, 0.9]}>
        <sphereGeometry args={[0.24, 18, 18]} />
      </mesh>
    </group>
  )
}



// ── ARM ───────────────────────────────────────────────────────────────────────
function Arm({ side, mouseRef, mat, action }) {
  const upperRef = useRef()
  const foreRef = useRef()
  const thumbRef = useRef()
  const sign = side === 'right' ? 1 : -1
  const x = sign * 0.42 // Shifted inwards to attach seamlessly to torso

  useFrame((s) => {
    const t = s.clock.elapsedTime
    
    // Default idle swinging
    let targetUpperX = Math.sin(t * 2.2 + (side === 'right' ? 0 : Math.PI)) * 0.22
    let targetUpperZ = sign * 0.12
    let targetForeX = 0.12 + Math.sin(t * 2.2 + 0.4) * 0.15
    let targetThumbZ = side === 'right' ? -0.55 : 0.55
    let targetThumbX = 0

    // Action overrides
    if (action === 'wave' && side === 'right') {
      targetUpperX = 0
      targetUpperZ = sign * 2.2 // arm high up
      targetForeX = Math.sin(t * 15) * 0.5 // waving back and forth
    } else if (action === 'thumbsUp' && side === 'right') {
      targetUpperX = -1.2 // point forward/up
      targetUpperZ = sign * 0.2
      targetForeX = -1.8 // bend elbow up
      targetThumbX = -1.2 // point thumb up relative to hand
      targetThumbZ = 0
    } else if (action === 'cheer') {
      targetUpperX = -0.2
      targetUpperZ = sign * 2.4 // both arms high up
      targetForeX = -0.5 + Math.sin(t * 10) * 0.2 // shaking fists
    }

    if (upperRef.current) {
      upperRef.current.rotation.x = THREE.MathUtils.lerp(upperRef.current.rotation.x, targetUpperX, 0.15)
      upperRef.current.rotation.z = THREE.MathUtils.lerp(upperRef.current.rotation.z, targetUpperZ, 0.15)
    }
    if (foreRef.current) {
      foreRef.current.rotation.x = THREE.MathUtils.lerp(foreRef.current.rotation.x, targetForeX, 0.15)
    }
    if (thumbRef.current) {
      thumbRef.current.rotation.x = THREE.MathUtils.lerp(thumbRef.current.rotation.x, targetThumbX, 0.2)
      thumbRef.current.rotation.z = THREE.MathUtils.lerp(thumbRef.current.rotation.z, targetThumbZ, 0.2)
    }
  })

  return (
    <group position={[x, 0.25, 0]}>
      <group ref={upperRef}>
        {/* Shoulder sphere */}
        <mesh position={[0, 0, 0]} material={mat.white} castShadow>
          <sphereGeometry args={[0.13, 24, 24]} />
        </mesh>
        
        {/* Upper arm cylinder */}
        <mesh position={[0, -0.17, 0]} material={mat.white} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.34, 24]} />
        </mesh>
        
        {/* Elbow sphere (blends with arm for continuous look) */}
        <mesh position={[0, -0.34, 0]} material={mat.white} castShadow>
          <sphereGeometry args={[0.11, 24, 24]} />
        </mesh>

        {/* Forearm (pivots from elbow) */}
        <group ref={foreRef} position={[0, -0.34, 0]}>
          <mesh position={[0, -0.16, 0]} material={mat.white} castShadow>
            <cylinderGeometry args={[0.11, 0.10, 0.32, 24]} />
          </mesh>
          
          {/* Hand/Wrist sphere */}
          <mesh position={[0, -0.32, 0]} material={mat.white} castShadow scale={[1.05, 0.9, 1]}>
            <sphereGeometry args={[0.10, 24, 24]} />
          </mesh>

          {/* 4 fingers */}
          {[-0.045, -0.015, 0.015, 0.045].map((fx, i) => (
            <mesh key={i} position={[fx, -0.42, 0.02]} material={mat.darkChrome} castShadow>
              <cylinderGeometry args={[0.015, 0.012, 0.07, 8]} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh
            ref={thumbRef}
            position={[side === 'right' ? 0.075 : -0.075, -0.37, 0.02]}
            material={mat.darkChrome}
          >
            <cylinderGeometry args={[0.015, 0.012, 0.06, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ── LEG ───────────────────────────────────────────────────────────────────────
function Leg({ side, mat, action }) {
  const upperRef = useRef()
  const lowerRef = useRef()
  const x = side === 'right' ? 0.13 : -0.13

  useFrame((s) => {
    const t = s.clock.elapsedTime
    let targetUpperX = Math.sin(t * 2.2 + (side === 'right' ? Math.PI : 0)) * 0.18
    let targetLowerX = Math.max(0, -targetUpperX) * 0.5

    if (action === 'cheer') {
      targetUpperX = side === 'right' ? -0.15 : -0.15; // slight squat
      targetLowerX = 0.3;
    }

    if (upperRef.current) upperRef.current.rotation.x = THREE.MathUtils.lerp(upperRef.current.rotation.x, targetUpperX, 0.15)
    if (lowerRef.current) lowerRef.current.rotation.x = THREE.MathUtils.lerp(lowerRef.current.rotation.x, targetLowerX, 0.15)
  })

  return (
    <group position={[x, -0.28, 0]}>
      <mesh material={mat.chrome} castShadow>
        <sphereGeometry args={[0.072, 14, 14]} />
      </mesh>

      <group ref={upperRef}>
        <mesh position={[0, -0.2, 0]} material={mat.white} castShadow>
          <cylinderGeometry args={[0.105, 0.1, 0.32, 16]} />
        </mesh>
        <mesh position={[0, -0.04, 0]} material={mat.white}>
          <sphereGeometry args={[0.106, 14, 14]} />
        </mesh>
        <mesh position={[0, -0.36, 0]} material={mat.white}>
          <sphereGeometry args={[0.1, 14, 14]} />
        </mesh>

        {/* Knee */}
        <mesh position={[0, -0.44, 0]} material={mat.chrome} castShadow>
          <sphereGeometry args={[0.078, 14, 14]} />
        </mesh>

        <group ref={lowerRef} position={[0, -0.44, 0]}>
          <mesh position={[0, -0.24, 0]} material={mat.white} castShadow scale={[1.15, 1, 1.05]}>
            <cylinderGeometry args={[0.115, 0.125, 0.36, 16]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={mat.white} scale={[1.15, 1, 1.05]}>
            <sphereGeometry args={[0.115, 14, 14]} />
          </mesh>
          <mesh position={[0, -0.42, 0]} material={mat.white} scale={[1.15, 1, 1.05]}>
            <sphereGeometry args={[0.115, 14, 14]} />
          </mesh>

          {/* Boot base */}
          <mesh position={[0, -0.52, 0.02]} material={mat.white} castShadow scale={[1.5, 0.42, 1.65]}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
          {/* Blue ring */}
          <mesh position={[0, -0.54, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
            <torusGeometry args={[0.135, 0.018, 8, 36]} />
          </mesh>
          {/* Sole */}
          <mesh position={[0, -0.6, 0.02]} material={mat.darkChrome}>
            <cylinderGeometry args={[0.13, 0.11, 0.028, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ── GROUND ────────────────────────────────────────────────────────────────────
export function GroundReflection({ isDark }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, 0]} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial color={isDark ? '#050c18' : '#111c2e'} metalness={0.85} roughness={0.2} />
    </mesh>
  )
}

// ── PARTICLES ─────────────────────────────────────────────────────────────────
export function Particles({ isDark }) {
  const count = 60
  const meshRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1
    }
    return pos
  }, [])

  const speeds = useMemo(() => Array.from({ length: count }, () => Math.random() * 0.35 + 0.15), [])

  useFrame(() => {
    if (!meshRef.current) return
    const attr = meshRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      attr.array[i * 3 + 1] += speeds[i] * 0.003
      if (attr.array[i * 3 + 1] > 4) attr.array[i * 3 + 1] = -4
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={isDark ? '#44bbff' : '#0077cc'} size={0.016} transparent opacity={isDark ? 0.4 : 0.5} sizeAttenuation />
    </points>
  )
}

// ── MAIN ROBOT ────────────────────────────────────────────────────────────────
export function Robot({ mouseRef, isDark }) {
  const groupRef = useRef()
  const mat = useMaterials(isDark)
  const BASE_Y = -0.05
  const [action, setAction] = useState('idle')

  const actions = ['wave', 'thumbsUp', 'cheer', 'nod']

  const handleClick = (e) => {
    e.stopPropagation() // Prevent click from passing through
    // Pick a random action that isn't the current one (if current isn't idle)
    let nextAction = actions[Math.floor(Math.random() * actions.length)]
    if (action !== 'idle' && nextAction === action) {
      nextAction = actions[(actions.indexOf(action) + 1) % actions.length]
    }
    
    setAction(nextAction)
  }

  // Reset to idle after animation finishes
  useEffect(() => {
    if (action !== 'idle') {
      const timer = setTimeout(() => setAction('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [action])

  useFrame((s) => {
    if (!groupRef.current) return
    const t = s.clock.elapsedTime
    
    let targetY = BASE_Y + Math.sin(t * 1.4) * 0.09 // default float
    
    if (action === 'cheer') {
      targetY += Math.abs(Math.sin(t * 10)) * 0.2 // jumping up and down
    }

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.2)
    groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.07
  })

  return (
    <group 
      ref={groupRef} 
      position={[0, BASE_Y, 0]}
      onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <Head mouseRef={mouseRef} mat={mat} action={action} />
      <Torso mat={mat} action={action} />
      <Arm side="right" mouseRef={mouseRef} mat={mat} action={action} />
      <Arm side="left"  mouseRef={mouseRef} mat={mat} action={action} />
      <Leg side="right" mat={mat} action={action} />
      <Leg side="left"  mat={mat} action={action} />
    </group>
  )
}
