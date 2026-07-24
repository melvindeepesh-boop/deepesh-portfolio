import * as THREE from 'three';

export function initThreeScene() {
  const container = document.getElementById('canvas-3d-container');
  if (!container) return null;

  let animationFrameId = null;

  // 1. Setup Scene, Camera, and Renderer
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Theme colors integration
  let isLightTheme = document.documentElement.classList.contains('light');
  
  function getColors() {
    return {
      primary: isLightTheme ? 0x3b82f6 : 0x6366f1, // Blue / Indigo
      secondary: isLightTheme ? 0x8b5cf6 : 0xa855f7, // Purple
      accent: isLightTheme ? 0x0891b2 : 0x06b6d4, // Cyan
      wireframe: isLightTheme ? 0xe2e8f0 : 0x1e293b,
      lightBeams: isLightTheme ? 0x93c5fd : 0x818cf8,
      dna: isLightTheme ? 0x60a5fa : 0xa5b4fc,
      particles: isLightTheme ? 0xcbd5e1 : 0x334155
    };
  }

  let colors = getColors();

  // 2. Interactive Mouse Parallax Tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  
  window.addEventListener('mousemove', (event) => {
    // Normalize coordinates (-1 to 1)
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Group to contain everything so we can rotate/tilt it based on mouse
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);


  // ==========================================================================
  // OBJECT A: Holographic AI Brain (Particle Cloud)
  // ==========================================================================
  const brainParticlesCount = 800;
  const brainGeometry = new THREE.BufferGeometry();
  const brainPositions = new Float32Array(brainParticlesCount * 3);
  const brainColors = new Float32Array(brainParticlesCount * 3);

  const color1 = new THREE.Color(colors.primary);
  const color2 = new THREE.Color(colors.secondary);
  const colorAccent = new THREE.Color(colors.accent);

  for (let i = 0; i < brainParticlesCount; i++) {
    // Form double lobe structure mathematically
    const lobeSide = Math.random() > 0.5 ? 1 : -1;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    
    // Scale radii for organic cerebral shape
    const rX = 2.4 * Math.sin(theta) * Math.cos(phi);
    const rY = 2.9 * Math.cos(theta);
    const rZ = 1.9 * Math.sin(theta) * Math.sin(phi);

    let x = rX + (0.35 * lobeSide); // hemisphere split spacing
    let y = rY + (Math.sin(rX * 4) * 0.1); // Add folds/gyri
    let z = rZ + (Math.cos(rY * 4) * 0.1);

    // Cerebellar and brainstem structures
    if (Math.random() > 0.8) {
      y = -3.2 - Math.random() * 1.5;
      x = (Math.random() - 0.5) * 0.8;
      z = (Math.random() - 0.5) * 0.8;
    }

    brainPositions[i * 3] = x;
    brainPositions[i * 3 + 1] = y;
    brainPositions[i * 3 + 2] = z;

    // Blend Colors
    const blendColor = Math.random();
    let finalColor;
    if (blendColor < 0.4) {
      finalColor = color1.clone().lerp(color2, Math.random());
    } else if (blendColor < 0.8) {
      finalColor = color2.clone().lerp(colorAccent, Math.random());
    } else {
      finalColor = colorAccent;
    }

    brainColors[i * 3] = finalColor.r;
    brainColors[i * 3 + 1] = finalColor.g;
    brainColors[i * 3 + 2] = finalColor.b;
  }

  brainGeometry.setAttribute('position', new THREE.BufferAttribute(brainPositions, 3));
  brainGeometry.setAttribute('color', new THREE.BufferAttribute(brainColors, 3));

  // Glowing point shader texture using Canvas
  function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }

  const brainMaterial = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    map: createCircleTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const brainPoints = new THREE.Points(brainGeometry, brainMaterial);
  brainPoints.position.set(-3.5, 1, 0); // Position to left side of hero content
  mainGroup.add(brainPoints);


  // ==========================================================================
  // OBJECT B: Neural Network (Connected Nodes)
  // ==========================================================================
  const networkGroup = new THREE.Group();
  networkGroup.position.set(4, -3, -2); // Lower right quadrant background
  mainGroup.add(networkGroup);

  const nodeCount = 50;
  const nodes = [];
  const nodeGeometry = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(nodeCount * 3);

  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 8;
    const z = (Math.random() - 0.5) * 8;

    nodes.push({
      x, y, z,
      targetX: x, targetY: y, targetZ: z,
      vx: (Math.random() - 0.5) * 0.015,
      vy: (Math.random() - 0.5) * 0.015,
      vz: (Math.random() - 0.5) * 0.015
    });

    nodePositions[i * 3] = x;
    nodePositions[i * 3 + 1] = y;
    nodePositions[i * 3 + 2] = z;
  }

  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  const nodePointsMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: colors.accent,
    transparent: true,
    opacity: 0.8,
    map: createCircleTexture(),
    blending: THREE.AdditiveBlending
  });

  const nodePoints = new THREE.Points(nodeGeometry, nodePointsMaterial);
  networkGroup.add(nodePoints);

  // Node connection lines
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors.primary,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });

  let networkLines = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
  networkGroup.add(networkLines);


  // ==========================================================================
  // OBJECT C: Rotating Digital DNA Helix
  // ==========================================================================
  const dnaGroup = new THREE.Group();
  dnaGroup.position.set(0, 0, -5); // Set slightly deeper in scene
  mainGroup.add(dnaGroup);

  const dnaPointsCount = 80;
  const helixGeometry1 = new THREE.BufferGeometry();
  const helixGeometry2 = new THREE.BufferGeometry();
  const pos1 = new Float32Array(dnaPointsCount * 3);
  const pos2 = new Float32Array(dnaPointsCount * 3);
  const lineIndices = [];
  const connectionPositions = [];

  const helixRadius = 1.3;
  const helixHeight = 12;
  const helixRotations = 4.5;

  for (let i = 0; i < dnaPointsCount; i++) {
    const t = (i / dnaPointsCount) * Math.PI * 2 * helixRotations;
    const y = (i / dnaPointsCount) * helixHeight - (helixHeight / 2);

    // Strand 1
    pos1[i * 3] = helixRadius * Math.cos(t);
    pos1[i * 3 + 1] = y;
    pos1[i * 3 + 2] = helixRadius * Math.sin(t);

    // Strand 2 (180 deg offset)
    pos2[i * 3] = helixRadius * Math.cos(t + Math.PI);
    pos2[i * 3 + 1] = y;
    pos2[i * 3 + 2] = helixRadius * Math.sin(t + Math.PI);
  }

  helixGeometry1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
  helixGeometry2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));

  const strandMaterial = new THREE.PointsMaterial({
    size: 0.14,
    color: colors.secondary,
    transparent: true,
    opacity: 0.9,
    map: createCircleTexture()
  });

  const strandPoints1 = new THREE.Points(helixGeometry1, strandMaterial);
  const strandPoints2 = new THREE.Points(helixGeometry2, strandMaterial);
  dnaGroup.add(strandPoints1);
  dnaGroup.add(strandPoints2);

  // DNA links (rungs)
  const rungLinesGeometry = new THREE.BufferGeometry();
  const rungLinePositions = new Float32Array(dnaPointsCount * 6);
  for (let i = 0; i < dnaPointsCount; i++) {
    rungLinePositions[i * 6] = pos1[i * 3];
    rungLinePositions[i * 6 + 1] = pos1[i * 3 + 1];
    rungLinePositions[i * 6 + 2] = pos1[i * 3 + 2];

    rungLinePositions[i * 6 + 3] = pos2[i * 3];
    rungLinePositions[i * 6 + 4] = pos2[i * 3 + 1];
    rungLinePositions[i * 6 + 5] = pos2[i * 3 + 2];
  }

  rungLinesGeometry.setAttribute('position', new THREE.BufferAttribute(rungLinePositions, 3));
  const rungMaterial = new THREE.LineBasicMaterial({
    color: colors.dna,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const dnaRungs = new THREE.LineSegments(rungLinesGeometry, rungMaterial);
  dnaGroup.add(dnaRungs);

  dnaGroup.rotation.z = Math.PI / 6; // Tilt DNA helix beautifully
  dnaGroup.position.set(-6, -4, -3);


  // ==========================================================================
  // OBJECT D: Holographic Torus Rings
  // ==========================================================================
  const ringGroup = new THREE.Group();
  ringGroup.position.copy(brainPoints.position); // Orbit around brain
  mainGroup.add(ringGroup);

  const torusGeometry1 = new THREE.TorusGeometry(3.6, 0.015, 8, 48);
  const torusGeometry2 = new THREE.TorusGeometry(4.2, 0.01, 8, 40);
  
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: colors.accent,
    transparent: true,
    opacity: 0.22,
    wireframe: true
  });
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: colors.secondary,
    transparent: true,
    opacity: 0.15,
    wireframe: true
  });

  const ring1 = new THREE.Mesh(torusGeometry1, ringMat1);
  const ring2 = new THREE.Mesh(torusGeometry2, ringMat2);
  
  ring1.rotation.x = Math.PI / 2;
  ring2.rotation.y = Math.PI / 3;

  ringGroup.add(ring1);
  ringGroup.add(ring2);


  // ==========================================================================
  // OBJECT E: Floating AI Chips
  // ==========================================================================
  const chipGroup = new THREE.Group();
  mainGroup.add(chipGroup);

  const chipGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.1);
  const chipMaterial = new THREE.MeshBasicMaterial({
    color: colors.wireframe,
    transparent: true,
    opacity: 0.1,
    wireframe: true
  });

  const chips = [];
  for (let i = 0; i < 4; i++) {
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10 - 2,
      (Math.random() - 0.5) * 4 - 3
    );
    chip.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    // Add floating speed data
    chips.push({
      mesh: chip,
      rotSpeedX: Math.random() * 0.005,
      rotSpeedY: Math.random() * 0.005,
      floatSpeed: Math.random() * 0.002 + 0.001,
      seed: Math.random() * 100
    });
    chipGroup.add(chip);
  }


  // ==========================================================================
  // OBJECT F: Floating Light Beams & Binary Particles
  // ==========================================================================
  const beamsGroup = new THREE.Group();
  mainGroup.add(beamsGroup);

  const beamGeometry = new THREE.CylinderGeometry(0.02, 0.08, 12, 4, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: colors.lightBeams,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending
  });

  const beams = [];
  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 8 - 4
    );
    beam.rotation.z = (Math.random() - 0.5) * 0.15;
    beams.push(beam);
    beamsGroup.add(beam);
  }

  // Floating background binary particles
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 24;
    particlePos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.06,
    color: colors.particles,
    transparent: true,
    opacity: 0.35,
    map: createCircleTexture()
  });
  const backgroundParticles = new THREE.Points(particleGeo, particleMat);
  mainGroup.add(backgroundParticles);


  // ==========================================================================
  // 3. Animation Loop & Performance Tuning
  // ==========================================================================
  let isVisible = true;
  
  // Use IntersectionObserver to stop loop when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.01 });
  
  observer.observe(container);

  let clock = new THREE.Clock();

  function tick() {
    if (!isVisible) {
      animationFrameId = requestAnimationFrame(tick);
      return;
    }

    const elapsedTime = clock.getElapsedTime();

    // Rotate brain
    brainPoints.rotation.y = elapsedTime * 0.08;
    brainPoints.rotation.z = Math.sin(elapsedTime * 0.04) * 0.05;

    // Rotate torus rings (at different rates)
    ring1.rotation.z = elapsedTime * 0.15;
    ring2.rotation.x = elapsedTime * 0.12;

    // DNA rotates on axis
    dnaGroup.rotation.y = elapsedTime * 0.2;

    // Update chips float/rotation
    chips.forEach(c => {
      c.mesh.rotation.x += c.rotSpeedX;
      c.mesh.rotation.y += c.rotSpeedY;
      c.mesh.position.y += Math.sin(elapsedTime * 0.8 + c.seed) * c.floatSpeed;
    });

    // Animate light beams drifting horizontally
    beams.forEach((b, idx) => {
      b.position.y += Math.sin(elapsedTime * 0.3 + idx) * 0.003;
    });

    // Update Neural Network connections dynamically
    updateNeuralNetwork(elapsedTime);

    // Smooth Mouse Camera Parallax (Physics easing)
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    
    mainGroup.rotation.y = mouse.x * 0.12;
    mainGroup.rotation.x = -mouse.y * 0.12;

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(tick);
  }

  function updateNeuralNetwork(time) {
    const pos = nodeGeometry.attributes.position.array;
    const connectionArray = [];

    // Drift nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
      nodes[i].z += nodes[i].vz;

      // Restrain within boundaries
      if (Math.abs(nodes[i].x) > 4) nodes[i].vx *= -1;
      if (Math.abs(nodes[i].y) > 4) nodes[i].vy *= -1;
      if (Math.abs(nodes[i].z) > 4) nodes[i].vz *= -1;

      pos[i * 3] = nodes[i].x;
      pos[i * 3 + 1] = nodes[i].y;
      pos[i * 3 + 2] = nodes[i].z;
    }
    nodeGeometry.attributes.position.needsUpdate = true;

    // Connect node lines dynamically
    for (let i = 0; i < nodeCount; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodeCount; j++) {
        if (connections >= 2) break; // limit connections per node for lightness
        
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.hypot(dx, dy, dz);

        if (dist < 2.5) {
          connectionArray.push(nodes[i].x, nodes[i].y, nodes[i].z);
          connectionArray.push(nodes[j].x, nodes[j].y, nodes[j].z);
          connections++;
        }
      }
    }

    const connectionPositions = new Float32Array(connectionArray);
    networkLines.geometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3));
    networkLines.geometry.attributes.position.needsUpdate = true;
  }

  tick();

  // Resize Handler
  function handleResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener('resize', handleResize);

  // Theme change updates
  window.updateThreeTheme = () => {
    isLightTheme = document.documentElement.classList.contains('light');
    colors = getColors();

    nodePointsMaterial.color.setHex(colors.accent);
    lineMaterial.color.setHex(colors.primary);
    strandMaterial.color.setHex(colors.secondary);
    rungMaterial.color.setHex(colors.dna);
    ringMat1.color.setHex(colors.accent);
    ringMat2.color.setHex(colors.secondary);
    chipMaterial.color.setHex(colors.wireframe);
    beamMaterial.color.setHex(colors.lightBeams);
    particleMat.color.setHex(colors.particles);

    // Update brain colors
    const colorArray = brainGeometry.attributes.color.array;
    const color1 = new THREE.Color(colors.primary);
    const color2 = new THREE.Color(colors.secondary);
    const colorAccent = new THREE.Color(colors.accent);

    for (let i = 0; i < brainParticlesCount; i++) {
      const blendColor = Math.random();
      let finalColor;
      if (blendColor < 0.4) {
        finalColor = color1.clone().lerp(color2, Math.random());
      } else if (blendColor < 0.8) {
        finalColor = color2.clone().lerp(colorAccent, Math.random());
      } else {
        finalColor = colorAccent;
      }
      colorArray[i * 3] = finalColor.r;
      colorArray[i * 3 + 1] = finalColor.g;
      colorArray[i * 3 + 2] = finalColor.b;
    }
    brainGeometry.attributes.color.needsUpdate = true;
  };

  // Clean-up capability
  return {
    destroy: () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
