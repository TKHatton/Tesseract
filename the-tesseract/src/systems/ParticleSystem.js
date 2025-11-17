export default class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.THREE = window.THREE;
    this.geometry = new this.THREE.BufferGeometry();
    this.material = new this.THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.points = new this.THREE.Points(this.geometry, this.material);
    this.points.name = 'ParticleSystem';
    this.scene.add(this.points);
    this.clock = new this.THREE.Clock();
    this.behavior = 1;
  }

  configure(phase = 1, count = 500, color = '#ffffff') {
    this.behavior = phase;
    this.material.color.set(color);
    this.count = count;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }
    this.geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    this.speeds = speeds;
  }

  update() {
    const delta = this.clock.getDelta();
    if (!this.geometry.attributes.position) return;
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i += 1) {
      const speed = this.speeds[i];
      const drift = speed * delta;
      if (this.behavior === 1) {
        positions[i * 3 + 0] += (Math.sin(drift + i) * 0.05) % 0.003;
        positions[i * 3 + 1] += (Math.cos(drift + i) * 0.05) % 0.003;
      } else if (this.behavior === 2) {
        positions[i * 3 + 0] += Math.sin(drift * 8 + i) * 0.002;
        positions[i * 3 + 1] += Math.cos(drift * 5 + i) * 0.002;
        positions[i * 3 + 2] += Math.sin(drift * 3 + i) * 0.002;
      } else {
        positions[i * 3 + 0] += Math.sin(drift * 12 + i) * 0.004;
        positions[i * 3 + 1] += Math.cos(drift * 7 + i) * 0.004;
        positions[i * 3 + 2] = Math.sin(drift * 14 + i) * 0.004;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
