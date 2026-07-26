import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── MATERIALS ─────────────────────────────────────────────────────────────────
function useMaterials() {
  return useMemo(() => {
    const white = new THREE.MeshPhongMaterial({ color: '#e0ecff', shininess: 120 })
    const whiteDeep = new THREE.MeshPhongMaterial({ color: '#b8cce0', shininess: 80 })
    const visor = new THREE.MeshPhongMaterial({ color: '#0a1520', shininess: 200, specular: '#334466' })
    const cyan = new THREE.MeshStandardMaterial({ color: '#00c8ff', emissive: '#00c8ff', emissiveIntensity: 2.5, roughness: 0, metalness: 0 })
    const glowWhite = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#66ddff', emissiveIntensity: 4, roughness: 0, metalness: 0 })
    const chrome = new THREE.MeshPhongMaterial({ color: '#9aaabb', shininess: 200, specular: '#ffffff' })
    const darkChrome = new THREE.MeshPhongMaterial({ color: '#3a4455', shininess: 120 })
    const blueRing = new THREE.MeshStandardMaterial({ color: '#0099dd', emissive: '#0066bb', emissiveIntensity: 1.0, roughness: 0.3, metalness: 0.4 })
    return { white, whiteDeep, visor, cyan, glowWhite, chrome, darkChrome, blueRing }
  }, [])
}

// ── HEAD ──────────────────────────────────────────────────────────────────────
function Head({ mouseRef, mat }) {
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouseRef.current.x * 0.3, 0.06)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouseRef.current.y * 0.15, 0.06)
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

      {/* Dark visor face — flattened sphere slice */}
      <mesh position={[0, -0.01, 0.22]} material={mat.visor} scale={[1, 0.78, 0.35]}>
        <sphereGeometry args={[0.32, 28, 28]} />
      </mesh>

      {/* Cyan visor border ring */}
      <mesh position={[0, -0.01, 0.245]} rotation={[0, 0, 0]} material={mat.blueRing} scale={[1, 0.78, 1]}>
        <torusGeometry args={[0.295, 0.018, 10, 48]} />
      </mesh>

      {/* LEFT eye — glowing cyan pill */}
      <mesh position={[-0.09, 0.04, 0.305]} rotation={[0, 0, Math.PI / 2]} material={mat.cyan}>
        <cylinderGeometry args={[0.032, 0.032, 0.11, 16]} />
      </mesh>
      <mesh position={[-0.09, 0.04, 0.305]} material={mat.cyan}>
        <sphereGeometry args={[0.032, 12, 12]} />
      </mesh>
      <mesh position={[-0.09, 0.04, 0.305]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={2.5} />
      </mesh>

      {/* RIGHT eye */}
      <mesh position={[0.09, 0.04, 0.305]} rotation={[0, 0, Math.PI / 2]} material={mat.cyan}>
        <cylinderGeometry args={[0.032, 0.032, 0.11, 16]} />
      </mesh>

      {/* Smile — 3 small cyan dots */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, -0.1 + (i === 1 ? -0.012 : 0), 0.306]} material={mat.cyan}>
          <sphereGeometry args={[0.016, 10, 10]} />
        </mesh>
      ))}

      {/* Eye glow light */}
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
    if (glowRef.current) glowRef.current.intensity = 3 + Math.sin(s.clock.elapsedTime * 1.8) * 1
  })

  return (
    <group position={[0, 0.2, 0]}>
      {/* Main chest */}
      <mesh material={mat.white} castShadow receiveShadow scale={[1.18, 1.0, 0.86]}>
        <sphereGeometry args={[0.3, 28, 28]} />
      </mesh>

      {/* Lower belly panel */}
      <mesh position={[0, -0.2, 0.14]} material={mat.whiteDeep} scale={[0.9, 0.6, 0.6]}>
        <sphereGeometry args={[0.26, 16, 16]} />
      </mesh>

      {/* Chest glow ring — outer blue */}
      <mesh position={[0, 0.07, 0.275]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
        <torusGeometry args={[0.078, 0.018, 12, 40]} />
      </mesh>
      {/* Chest glow center — white */}
      <mesh position={[0, 0.07, 0.285]} material={mat.glowWhite}>
        <circleGeometry args={[0.06, 32]} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.07, 0.45]} color="#88eeff" intensity={3} distance={1.4} />

      {/* Shoulder connector rings */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.33, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} material={mat.blueRing}>
          <torusGeometry args={[0.068, 0.015, 8, 28]} />
        </mesh>
      ))}

      {/* Waist chrome band */}
      <mesh position={[0, -0.29, 0]} material={mat.chrome} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.1, 18]} />
      </mesh>

      {/* Hip base */}
      <mesh position={[0, -0.4, 0]} material={mat.white} castShadow scale={[1.12, 0.55, 0.9]}>
        <sphereGeometry args={[0.24, 18, 18]} />
      </mesh>
    </group>
  )
}

// ── SHOULDER JOINT ────────────────────────────────────────────────────────────
function ShoulderJoint({ side, mat }) {
  const x = side === 'right' ? 0.46 : -0.46
  return (
    <group position={[x, 0.3, 0]}>
      <mesh material={mat.chrome} castShadow>
        <sphereGeometry args={[0.075, 16, 16]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mat.blueRing}>
        <torusGeometry args={[0.075, 0.013, 8, 28]} />
      </mesh>
    </group>
  )
}

// ── ARM ───────────────────────────────────────────────────────────────────────
function Arm({ side, mouseRef, mat }) {
  const upperRef = useRef()
  const foreRef = useRef()
  const sign = side === 'right' ? 1 : -1
  const x = side === 'right' ? 0.54 : -0.54

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const swing = Math.sin(t * 0.9 + (side === 'right' ? 0 : Math.PI)) * 0.1
    if (upperRef.current) {
      upperRef.current.rotation.x = swing
      upperRef.current.rotation.z = THREE.MathUtils.lerp(upperRef.current.rotation.z, sign * 0.12, 0.05)
    }
    if (foreRef.current) foreRef.current.rotation.x = 0.12 + Math.sin(t * 0.9 + 0.4) * 0.07
  })

  return (
    <group position={[x, 0.2, 0]}>
      <group ref={upperRef}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} material={mat.white} castShadow scale={[0.9, 1, 0.85]}>
          <cylinderGeometry args={[0.09, 0.085, 0.28, 16]} />
        </mesh>
        {/* Upper arm top cap */}
        <mesh position={[0, -0.01, 0]} material={mat.white}>
          <sphereGeometry args={[0.09, 14, 14]} />
        </mesh>
        {/* Upper arm bottom cap */}
        <mesh position={[0, -0.29, 0]} material={mat.white}>
          <sphereGeometry args={[0.085, 14, 14]} />
        </mesh>

        {/* Elbow chrome joint */}
        <mesh position={[0, -0.36, 0]} material={mat.chrome} castShadow>
          <sphereGeometry args={[0.068, 14, 14]} />
        </mesh>
        <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
          <torusGeometry args={[0.068, 0.012, 8, 24]} />
        </mesh>

        {/* Forearm */}
        <group ref={foreRef} position={[0, -0.36, 0]}>
          <mesh position={[0, -0.16, 0]} material={mat.white} castShadow scale={[0.84, 1, 0.82]}>
            <cylinderGeometry args={[0.08, 0.075, 0.28, 14]} />
          </mesh>
          <mesh position={[0, -0.02, 0]} material={mat.white}>
            <sphereGeometry args={[0.08, 12, 12]} />
          </mesh>
          <mesh position={[0, -0.30, 0]} material={mat.white}>
            <sphereGeometry args={[0.075, 12, 12]} />
          </mesh>

          {/* Wrist */}
          <mesh position={[0, -0.36, 0]} material={mat.chrome}>
            <cylinderGeometry args={[0.056, 0.06, 0.055, 14]} />
          </mesh>

          {/* Hand */}
          <mesh position={[0, -0.46, 0]} material={mat.white} castShadow scale={[1.05, 0.82, 0.9]}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>

          {/* 4 fingers */}
          {[-0.034, -0.011, 0.011, 0.034].map((fx, i) => (
            <mesh key={i} position={[fx, -0.56, 0.01]} material={mat.darkChrome} castShadow>
              <cylinderGeometry args={[0.012, 0.01, 0.06, 8]} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh
            position={[side === 'right' ? 0.055 : -0.055, -0.51, 0.01]}
            rotation={[0, 0, side === 'right' ? -0.55 : 0.55]}
            material={mat.darkChrome}
          >
            <cylinderGeometry args={[0.012, 0.01, 0.048, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ── LEG ───────────────────────────────────────────────────────────────────────
function Leg({ side, mat }) {
  const upperRef = useRef()
  const lowerRef = useRef()
  const x = side === 'right' ? 0.13 : -0.13

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const swing = Math.sin(t * 0.9 + (side === 'right' ? Math.PI : 0)) * 0.08
    if (upperRef.current) upperRef.current.rotation.x = swing
    if (lowerRef.current) lowerRef.current.rotation.x = Math.max(0, -swing) * 0.3
  })

  return (
    <group position={[x, -0.28, 0]}>
      {/* Hip ball */}
      <mesh material={mat.chrome} castShadow>
        <sphereGeometry args={[0.072, 14, 14]} />
      </mesh>

      <group ref={upperRef}>
        {/* Upper leg */}
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
          {/* Lower leg — wider boot shape */}
          <mesh position={[0, -0.24, 0]} material={mat.white} castShadow scale={[1.15, 1, 1.05]}>
            <cylinderGeometry args={[0.115, 0.125, 0.36, 16]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={mat.white} scale={[1.15, 1, 1.05]}>
            <sphereGeometry args={[0.115, 14, 14]} />
          </mesh>
          <mesh position={[0, -0.42, 0]} material={mat.white} scale={[1.15, 1, 1.05]}>
            <sphereGeometry args={[0.115, 14, 14]} />
          </mesh>

          {/* Boot base wide flat */}
          <mesh position={[0, -0.52, 0.02]} material={mat.white} castShadow scale={[1.5, 0.42, 1.65]}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>

          {/* Blue ring at boot base */}
          <mesh position={[0, -0.54, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={mat.blueRing}>
            <torusGeometry args={[0.135, 0.018, 8, 36]} />
          </mesh>

          {/* Dark sole */}
          <mesh position={[0, -0.6, 0.02]} material={mat.darkChrome}>
            <cylinderGeometry args={[0.13, 0.11, 0.028, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ── GROUND ────────────────────────────────────────────────────────────────────
export function GroundReflection() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, 0]} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial color="#050c18" metalness={0.85} roughness={0.2} />
    </mesh>
  )
}

// ── PARTICLES ─────────────────────────────────────────────────────────────────
export function Particles() {
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

  const speeds = useMemo(() => Array.from({ length: count }, () => Math.random() * 0.15 + 0.05), [])

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
      <pointsMaterial color="#44bbff" size={0.016} transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

// ── MAIN ROBOT ────────────────────────────────────────────────────────────────
export function Robot({ mouseRef }) {
  const groupRef = useRef()
  const mat = useMaterials()
  const BASE_Y = -0.05

  useFrame((s) => {
    if (!groupRef.current) return
    const t = s.clock.elapsedTime
    groupRef.current.position.y = BASE_Y + Math.sin(t * 0.6) * 0.06
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.04
  })

  return (
    <group ref={groupRef} position={[0, BASE_Y, 0]}>
      <Head mouseRef={mouseRef} mat={mat} />
      <Torso mat={mat} />
      <ShoulderJoint side="right" mat={mat} />
      <ShoulderJoint side="left" mat={mat} />
      <Arm side="right" mouseRef={mouseRef} mat={mat} />
      <Arm side="left" mouseRef={mouseRef} mat={mat} />
      <Leg side="right" mat={mat} />
      <Leg side="left" mat={mat} />
    </group>
  )
}
