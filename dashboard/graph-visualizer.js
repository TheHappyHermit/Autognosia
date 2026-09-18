/**
 * Autognosia Command Deck — Interactive Knowledge Graph Visualizer
 * 
 * High-performance 60fps HTML5 Canvas Force-Directed Graph.
 * Zero external dependencies (100% offline & homelab friendly).
 * Features:
 * - Physics simulation: Coulomb repulsion, Hooke spring attraction, center gravity, damping.
 * - Interactive: Drag nodes, pan canvas, mousewheel zoom, hover tooltips.
 * - Multi-tier color coding: Active Wiki (Cyan), Oracle Brain (Purple), Facts (Emerald).
 * - Click inspection: Opens document preview drawer.
 */

export class GraphVisualizer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      repulsion: 1200,
      springLength: 80,
      springCoeff: 0.04,
      gravity: 0.02,
      damping: 0.88,
      onNodeClick: null
    }, options);

    this.nodes = [];
    this.links = [];
    this.nodeMap = new Map();

    // Viewport transform
    this.scale = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;

    // Interaction state
    this.isDragging = false;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.hoveredNode = null;
    this.animId = null;

    this.initCanvasSize();
    this.bindEvents();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 600;
    this.height = Math.max(rect.height || 420, 380);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;
  }

  setData(data) {
    if (!data || !data.nodes) return;
    this.nodes = [];
    this.links = [];
    this.nodeMap.clear();

    const cx = 0;
    const cy = 0;

    data.nodes.forEach((n, idx) => {
      const angle = (idx / data.nodes.length) * Math.PI * 2;
      const radius = 60 + Math.random() * 120;
      const node = {
        id: n.id,
        label: n.label || n.id,
        tier: n.tier || 'active-wiki',
        epistemic: n.epistemic || 'heuristic',
        path: n.path || '',
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.tier === 'oracle' ? 7 : 8,
        color: this.getNodeColor(n)
      };
      this.nodes.push(node);
      this.nodeMap.set(node.id, node);
    });

    (data.links || []).forEach(l => {
      const source = this.nodeMap.get(l.source);
      const target = this.nodeMap.get(l.target);
      if (source && target && source !== target) {
        this.links.push({
          source,
          target,
          relation: l.relation || 'relates_to'
        });
      }
    });

    this.startSimulation();
  }

  getNodeColor(node) {
    if (node.epistemic === 'fact') return '#10b981'; // emerald
    if (node.tier === 'oracle') return '#a855f7';    // purple
    return '#06b6d4';                                // cyan
  }

  startSimulation() {
    if (this.animId) cancelAnimationFrame(this.animId);
    let iterations = 0;

    const tick = () => {
      this.updatePhysics();
      this.render();
      iterations++;
      const totalEnergy = this.nodes.reduce((acc, n) => acc + Math.hypot(n.vx, n.vy), 0);
      if (totalEnergy > 0.05 || this.draggedNode || iterations < 200) {
        this.animId = requestAnimationFrame(tick);
      }
    };
    this.animId = requestAnimationFrame(tick);
  }

  updatePhysics() {
    const { repulsion, springLength, springCoeff, gravity, damping } = this.options;
    const len = this.nodes.length;

    // 1. Repulsion between all node pairs
    for (let i = 0; i < len; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < len; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x || (Math.random() - 0.5);
        const dy = n2.y - n1.y || (Math.random() - 0.5);
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);
        if (dist < 350) {
          const force = repulsion / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 2. Spring attraction along links
    this.links.forEach(link => {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = (dist - springLength) * springCoeff;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      link.source.vx += fx;
      link.source.vy += fy;
      link.target.vx -= fx;
      link.target.vy -= fy;
    });

    // 3. Center gravity & integrate velocity
    this.nodes.forEach(n => {
      if (n === this.draggedNode) return;
      n.vx -= n.x * gravity;
      n.vy -= n.y * gravity;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
    });
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // Draw Links
    ctx.lineWidth = 1 / this.scale;
    this.links.forEach(l => {
      const isConnectedToHover = this.hoveredNode && (l.source === this.hoveredNode || l.target === this.hoveredNode);
      ctx.strokeStyle = isConnectedToHover ? 'rgba(6, 182, 212, 0.7)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = isConnectedToHover ? 2 / this.scale : 1 / this.scale;
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.stroke();
    });

    // Draw Nodes
    this.nodes.forEach(n => {
      const isHovered = n === this.hoveredNode;
      const r = isHovered ? n.radius + 3 : n.radius;

      if (isHovered || n.epistemic === 'fact') {
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isHovered ? 12 : 6;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5 / this.scale;
      ctx.stroke();

      if (this.scale > 0.6 || isHovered) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${isHovered ? 'bold ' : ''}${Math.max(10, 11 / this.scale)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + r + 12 / this.scale);
      }
    });

    ctx.restore();
  }

  toWorldCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale
    };
  }

  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist <= n.radius + 6) return n;
    }
    return null;
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', e => {
      const coords = this.toWorldCoords(e.clientX, e.clientY);
      const clicked = this.findNodeAt(coords.x, coords.y);
      if (clicked) {
        this.draggedNode = clicked;
        this.isDragging = true;
      } else {
        this.isPanning = true;
        this.panStartX = e.clientX - this.offsetX;
        this.panStartY = e.clientY - this.offsetY;
      }
      this.startSimulation();
    });

    window.addEventListener('mousemove', e => {
      if (this.isDragging && this.draggedNode) {
        const coords = this.toWorldCoords(e.clientX, e.clientY);
        this.draggedNode.x = coords.x;
        this.draggedNode.y = coords.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        this.startSimulation();
      } else if (this.isPanning) {
        this.offsetX = e.clientX - this.panStartX;
        this.offsetY = e.clientY - this.panStartY;
        this.render();
      } else {
        const coords = this.toWorldCoords(e.clientX, e.clientY);
        const node = this.findNodeAt(coords.x, coords.y);
        if (node !== this.hoveredNode) {
          this.hoveredNode = node;
          this.canvas.style.cursor = node ? 'pointer' : 'default';
          this.render();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging && this.draggedNode) {
        this.draggedNode = null;
        this.isDragging = false;
      }
      this.isPanning = false;
    });

    this.canvas.addEventListener('click', e => {
      const coords = this.toWorldCoords(e.clientX, e.clientY);
      const clicked = this.findNodeAt(coords.x, coords.y);
      if (clicked && typeof this.options.onNodeClick === 'function') {
        this.options.onNodeClick(clicked);
      }
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.offsetX = mouseX - (mouseX - this.offsetX) * zoomFactor;
      this.offsetY = mouseY - (mouseY - this.offsetY) * zoomFactor;
      this.scale = Math.min(Math.max(this.scale * zoomFactor, 0.2), 3.5);
      this.render();
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });
  }

  resetView() {
    this.scale = 1.0;
    this.offsetX = this.width / 2;
    this.offsetY = this.height / 2;
    this.render();
  }

  resetZoom() {
    this.resetView();
  }
}
