import { PHASES, PHASE1_COLORS, SYMBOL_MAP, PARTICLE_TARGETS } from '../utils/constants';
import { createRange } from '../utils/helpers';
import ParticleSystem from './ParticleSystem';

const FACE_TRANSFORMS = {
  front: { rotation: [0, 0, 0], position: [0, 0, 0.58] },
  back: { rotation: [0, Math.PI, 0], position: [0, 0, -0.58] },
  left: { rotation: [0, Math.PI / 2, 0], position: [-0.58, 0, 0] },
  right: { rotation: [0, -Math.PI / 2, 0], position: [0.58, 0, 0] },
  top: { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.58, 0] },
  bottom: { rotation: [Math.PI / 2, 0, 0], position: [0, -0.58, 0] },
};

const GRID_SIZE_PHASE1 = 2;
const GRID_SIZE_PHASE2 = 3;

export default class CubePhysics {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.THREE = window.THREE;
    if (!this.THREE) {
      console.warn('Three.js not found. GameCanvas inactive.');
      return;
    }
    this.scene = new this.THREE.Scene();
    this.clock = new this.THREE.Clock();
    this.camera = new this.THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 5);
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.rootGroup = new this.THREE.Group();
    this.scene.add(this.rootGroup);
    this.raycaster = new this.THREE.Raycaster();
    this.pointer = new this.THREE.Vector2();
    this.clickTargets = [];
    this.phase3FaceGroups = new Map();
    this.symbolMaterials = new Map();
    this.draggingFace = false;
    this.phase = 1;
    this.phaseState = null;
    this.phase3Selection = null;
    this.phase3RotationAccumulator = 0;
    this.lastPointer = null;
    this.coreCube = null;
    this.controls = null;
    this.particles = new ParticleSystem(this.scene);
    this.backgrounds = {
      1: new this.THREE.Color('#0a0a0f'),
      2: new this.THREE.Color('#1a2f5f'),
      3: new this.THREE.Color('#0a0a1a'),
    };
    this.animationFrame = null;
    this.initLights();
    this.initControls();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  bindEvents() {
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('resize', this.handleResize);
  }

  unbindEvents() {
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('resize', this.handleResize);
  }

  initLights() {
    const ambient = new this.THREE.AmbientLight('#ffffff', 0.9);
    this.scene.add(ambient);
    const dir1 = new this.THREE.DirectionalLight('#f5f5f5', 0.8);
    dir1.position.set(3, 5, 4);
    this.scene.add(dir1);
    const dir2 = new this.THREE.DirectionalLight('#99c1ff', 0.6);
    dir2.position.set(-4, -3, -2);
    this.scene.add(dir2);
  }

  initControls() {
    if (!this.THREE?.OrbitControls) {
      console.warn('OrbitControls missing. Camera controls disabled.');
      return;
    }
    this.controls = new this.THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.6;
    this.controls.maxDistance = 7;
    this.controls.target.set(0, 0, 0);
    this.controls.addEventListener('start', () => this.callbacks.onInteraction?.());
  }

  getIntersections(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.clickTargets, true);
  }

  handlePointerDown = (event) => {
    if (!this.renderer) return;
    const intersects = this.getIntersections(event);
    console.log('Click detected! Intersects:', intersects.length, 'Click targets:', this.clickTargets.length);
    if (intersects.length) {
      const target = intersects[0].object.userData;
      console.log('Target userData:', target);
      if (!target) return;
      if (target.type === 'cell') {
        console.log('Cell clicked:', target);
        this.callbacks.onCellInteract?.(target);
        this.callbacks.onInteraction?.();
        return;
      }
      if (target.type === 'face-select') {
        this.phase3Selection = target.face;
        this.phase3RotationAccumulator = 0;
        this.draggingFace = true;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.highlightPhase3Face(target.face);
        this.callbacks.onFaceSelect?.(target.face);
        this.callbacks.onInteraction?.();
        return;
      }
    }
    this.draggingFace = false;
    this.lastPointer = null;
  };

  handlePointerMove = (event) => {
    if (this.phase !== 3 || !this.draggingFace || !this.phase3Selection || !this.lastPointer) return;
    const deltaX = (event.clientX - this.lastPointer.x) * 0.005;
    this.phase3RotationAccumulator += deltaX;
    if (Math.abs(this.phase3RotationAccumulator) > Math.PI / 12) {
      const direction = this.phase3RotationAccumulator > 0 ? 1 : -1;
      this.callbacks.onPhase3Rotate?.(this.phase3Selection, direction);
      this.phase3RotationAccumulator = 0;
    }
    const group = this.phase3FaceGroups.get(this.phase3Selection);
    if (group) {
      group.rotation.z += deltaX * 1.2;
    }
    this.lastPointer = { x: event.clientX, y: event.clientY };
  };

  handlePointerUp = () => {
    this.draggingFace = false;
    this.lastPointer = null;
  };

  handleResize = () => {
    if (!this.renderer) return;
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };

  setPhase(phase = 1, state = null) {
    this.phase = phase;
    this.phaseState = state;
    if (this.coreCube) {
      this.coreCube.geometry.dispose();
      this.coreCube.material.dispose();
      this.coreCube = null;
    }
    this.rootGroup.clear();
    this.clickTargets = [];
    this.phase3FaceGroups.clear();
    this.phase3Selection = null;
    this.scene.background = this.backgrounds[phase] || null;
    if (phase !== 3) {
      this.buildCoreCube();
    }
    if (phase === 1) {
      this.buildPhase1(state);
    } else if (phase === 2) {
      this.buildPhase2(state);
    } else {
      this.buildPhase3(state);
    }
    const particleColor = PHASES[phase - 1]?.particleColor || '#ffffff';
    this.particles.configure(phase, PARTICLE_TARGETS[phase], particleColor);
    if (state) {
      this.updatePhaseState(state);
    }
    this.updateControlBounds();
  }

  buildPhase1(state) {
    if (!state?.faces) return;
    Object.entries(state.faces).forEach(([faceKey, cells]) => {
      const group = this.createFaceGroup(faceKey);
      const cellSize = 1 / GRID_SIZE_PHASE1;
      cells.forEach((color, index) => {
        const cellMesh = this.createCellMesh(color);
        const row = Math.floor(index / GRID_SIZE_PHASE1);
        const col = index % GRID_SIZE_PHASE1;
        const offset = (GRID_SIZE_PHASE1 - 1) / 2;
        cellMesh.position.set((col - offset) * cellSize, (offset - row) * cellSize, 0.01);
        cellMesh.scale.set(cellSize * 0.95, cellSize * 0.95, 1);
        cellMesh.userData = { type: 'cell', face: faceKey, index };
        group.add(cellMesh);
        this.clickTargets.push(cellMesh);
      });
      this.rootGroup.add(group);
    });
  }

  buildPhase2(state) {
    if (!state?.faces) return;
    Object.entries(state.faces).forEach(([faceKey, cells]) => {
      const group = this.createFaceGroup(faceKey);
      const cellSize = 1 / GRID_SIZE_PHASE2;
      cells.forEach((symbolId, index) => {
        const baseMesh = this.createCellMesh('#2a2a2f');
        const row = Math.floor(index / GRID_SIZE_PHASE2);
        const col = index % GRID_SIZE_PHASE2;
        const offset = (GRID_SIZE_PHASE2 - 1) / 2;
        baseMesh.position.set((col - offset) * cellSize, (offset - row) * cellSize, 0.02);
        baseMesh.scale.set(cellSize * 0.9, cellSize * 0.9, 1);
        baseMesh.userData = { type: 'cell', face: faceKey, index };
        const sprite = this.createSymbolSprite(symbolId);
        sprite.position.set(0, 0, 0.02);
        baseMesh.add(sprite);
        group.add(baseMesh);
        this.clickTargets.push(baseMesh);
      });
      this.rootGroup.add(group);
    });
  }

  buildPhase3(state) {
    if (!state?.faces) return;
    state.faces.forEach((face) => {
      const geometry = new this.THREE.PlaneGeometry(1.3, 1.3, 2, 2);
      const material = new this.THREE.MeshStandardMaterial({
        color: '#111827',
        transparent: true,
        opacity: 0.75,
        emissive: face.aligned ? '#00BFFF' : '#222',
      });
      const mesh = new this.THREE.Mesh(geometry, material);
      mesh.userData = { type: 'face-select', face: face.key };
      const group = new this.THREE.Group();
      group.add(mesh);
      this.addConstellation(group, face);
      group.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: face.orbitSpeed,
        radius: face.orbitRadius,
        faceKey: face.key,
      };
      this.phase3FaceGroups.set(face.key, group);
      this.clickTargets.push(mesh);
      this.rootGroup.add(group);
    });
  }

  addConstellation(group, face) {
    const material = new this.THREE.LineBasicMaterial({ color: '#ffffff' });
    const points = face.pattern.map(([x, y]) => new this.THREE.Vector3(x, y, 0.05));
    const geometry = new this.THREE.BufferGeometry().setFromPoints(points);
    const line = new this.THREE.Line(geometry, material);
    group.add(line);
    face.pattern.forEach(([x, y]) => {
      const dot = new this.THREE.Mesh(
        new this.THREE.SphereGeometry(0.03, 8, 8),
        new this.THREE.MeshBasicMaterial({ color: '#ffffff' }),
      );
      dot.position.set(x, y, 0.06);
      group.add(dot);
    });
  }

  createSymbolSprite(symbolId) {
    const cacheKey = `symbol-${symbolId}`;
    if (this.symbolMaterials.has(cacheKey)) {
      const cachedMaterial = this.symbolMaterials.get(cacheKey);
      return new this.THREE.Sprite(cachedMaterial);
    }
    const glyph = SYMBOL_MAP[symbolId]?.glyph || '?';
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#FFD700';
    ctx.font = '70px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, 64, 72);
    const texture = new this.THREE.CanvasTexture(canvas);
    const material = new this.THREE.SpriteMaterial({ map: texture, transparent: true });
    this.symbolMaterials.set(cacheKey, material);
    const sprite = new this.THREE.Sprite(material);
    sprite.scale.set(0.35, 0.35, 0.35);
    return sprite;
  }

  createFaceGroup(faceKey) {
    const group = new this.THREE.Group();
    group.name = `face-${faceKey}`;
    const transform = FACE_TRANSFORMS[faceKey];
    if (transform) {
      group.rotation.set(...transform.rotation);
      group.position.set(...transform.position);
    }
    return group;
  }

  buildCoreCube() {
    if (this.coreCube) {
      this.coreCube.geometry.dispose();
      this.coreCube.material.dispose();
      this.coreCube = null;
    }
    const geometry = new this.THREE.BoxGeometry(1.12, 1.12, 1.12);
    const material = new this.THREE.MeshStandardMaterial({
      color: '#1b1c29',
      metalness: 0.35,
      roughness: 0.55,
      transparent: true,
      opacity: 0.92,
    });
    this.coreCube = new this.THREE.Mesh(geometry, material);
    this.rootGroup.add(this.coreCube);
  }

  updateControlBounds() {
    if (!this.controls) return;
    if (this.phase === 3) {
      this.controls.minDistance = 3.5;
      this.controls.maxDistance = 10;
    } else {
      this.controls.minDistance = 2.4;
      this.controls.maxDistance = 6.5;
    }
    this.controls.target.set(0, 0, 0);
  }

  createCellMesh(color) {
    const geometry = new this.THREE.PlaneGeometry(1, 1);
    const material = new this.THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.5,
      transparent: true,
      opacity: 0.95,
      side: this.THREE.DoubleSide,
    });
    return new this.THREE.Mesh(geometry, material);
  }

  updatePhaseState(phaseState) {
    this.phaseState = phaseState;
    if (this.phase === 1) this.updatePhase1Materials();
    if (this.phase === 2) this.updatePhase2Materials();
    if (this.phase === 3) this.updatePhase3Materials();
  }

  updatePhase1Materials() {
    Object.entries(this.phaseState.faces).forEach(([faceKey, cells]) => {
      const group = this.rootGroup.children.find((child) => child.name === `face-${faceKey}`) || null;
      if (!group) {
        const newGroup = this.createFaceGroup(faceKey);
        newGroup.name = `face-${faceKey}`;
        this.rootGroup.add(newGroup);
      }
      const cellMeshes = [];
      this.rootGroup.children.forEach((child) => {
        if (child.children?.length) {
          child.children.forEach((mesh) => {
            if (mesh.userData?.face === faceKey) {
              cellMeshes.push(mesh);
            }
          });
        }
      });
      cells.forEach((color, idx) => {
        const mesh = cellMeshes[idx];
        if (mesh?.material) {
          mesh.material.color.set(color);
        }
      });
    });
  }

  updatePhase2Materials() {
    Object.entries(this.phaseState.faces).forEach(([faceKey, cells]) => {
      const cellMeshes = [];
      this.rootGroup.children.forEach((child) => {
        child.children?.forEach((mesh) => {
          if (mesh.userData?.face === faceKey) {
            cellMeshes.push(mesh);
          }
        });
      });
    cells.forEach((symbolId, idx) => {
      const mesh = cellMeshes[idx];
      if (mesh) {
        mesh.material.color.set('#2a2a2f');
        mesh.children
          .filter((child) => child.type === 'Sprite')
          .forEach((spriteChild) => mesh.remove(spriteChild));
        const sprite = this.createSymbolSprite(symbolId);
        sprite.position.set(0, 0, 0.02);
        mesh.add(sprite);
      }
    });
  });
}

  updatePhase3Materials() {
    this.phaseState.faces.forEach((face) => {
      const group = this.phase3FaceGroups.get(face.key);
      if (!group) return;
      const mesh = group.children.find((child) => child.isMesh);
      if (mesh) {
        mesh.material.emissive.set(face.aligned ? '#00BFFF' : '#222');
      }
    });
  }

  highlightPhase3Face(faceKey) {
    this.phase3FaceGroups.forEach((group, key) => {
      const mesh = group.children.find((child) => child.isMesh);
      if (mesh) {
        mesh.material.opacity = key === faceKey ? 1 : 0.65;
      }
    });
  }

  animate() {
    if (!this.renderer) return;
    this.animationFrame = requestAnimationFrame(this.animate);
    this.controls?.update();
    if (this.phase === 3) {
      this.phase3FaceGroups.forEach((group) => {
        group.userData.angle += group.userData.speed * 0.01;
        group.position.x = Math.cos(group.userData.angle) * group.userData.radius;
        group.position.z = Math.sin(group.userData.angle) * group.userData.radius;
        group.rotation.y += 0.001;
      });
    }
    this.particles.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.unbindEvents();
    cancelAnimationFrame(this.animationFrame);
    this.particles.dispose();
    this.controls?.dispose?.();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
