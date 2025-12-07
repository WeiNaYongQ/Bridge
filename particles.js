// ======================
// 🎨 THEME MANAGER
// ======================
let currentTheme = 'deep';
let animationId = null; // Track current animation
let stellarStars = [];
let deepParticles = [];
let shootingStars = []; // optional enhancement

const themeBtn = document.getElementById('themeBtn');
const themeMenu = document.getElementById('themeMenu');
const themeOptions = document.querySelectorAll('.theme-option');

themeBtn.addEventListener('click', () => {
  themeMenu.style.display = themeMenu.style.display === 'block' ? 'none' : 'block';
});

themeOptions.forEach(option => {
  option.addEventListener('click', () => {
    const theme = option.getAttribute('data-theme');
    if (theme !== currentTheme) {
      themeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      currentTheme = theme;
      resetBackground();
      themeMenu.style.display = 'none';
    }
  });
});

document.addEventListener('click', (e) => {
  if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
    themeMenu.style.display = 'none';
  }
});

// ======================
// 🌌 BACKGROUND SYSTEM
// ======================
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
document.body.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
document.body.addEventListener('touchmove', (e) => {
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
}, { passive: false });

// --- Deep Space Theme ---
class DeepParticle {
  constructor() {
    this.reset();
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = Math.random() * 0.5 + 0.2;
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 180) {
      const force = (180 - distance) / 60;
      this.x += (dx / distance) * force * 4;
      this.y += (dy / distance) * force * 4;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > canvas.height + 20) { this.y = -20; this.x = Math.random() * canvas.width; }
    if (this.x < -20) this.x = canvas.width + 20;
    if (this.x > canvas.width + 20) this.x = -20;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- ✨ ULTRA-REALISTIC STELLAR GLOW THEME ---
class StellarStar {
  constructor() {
    this.reset();
    this.spin = 0;
    this.pulse = Math.random() * Math.PI * 2;
    this.twinkle = Math.random() > 0.85;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.depth = Math.random();
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.lineFade = 0;
  }
  
  reset() {
    this.origX = Math.random() * canvas.width;
    this.origY = Math.random() * canvas.height;
    this.x = this.origX;
    this.y = this.origY;
    
    // ✅ SAFETY: Clamp depth and size
    this.depth = Math.min(1, Math.max(0, this.depth));
    this.size = Math.min(3, Math.max(0.5, this.depth * 2 + 0.7)); // 0.5 to 3
    
    this.baseBrightness = this.depth * 0.6 + 0.3;
    this.brightness = this.baseBrightness;
    
    const colors = ['#ffffff', '#ffcc00', '#a0cfff', '#ff9aa2', '#d4b8ff'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    this.speed = 0.02 + this.depth * 0.03;
    this.vx = (Math.random() - 0.5) * this.speed;
    this.vy = (Math.random() - 0.5) * this.speed;
    
    // ✅ Recompute orbit radius AFTER size is known
    this.orbitRadius = this.depth * 8 + 1; // smaller orbits
  }
  
  update() {
    this.orbitAngle += this.speed * 0.3;
    const orbitX = Math.cos(this.orbitAngle) * this.orbitRadius;
    const orbitY = Math.sin(this.orbitAngle) * this.orbitRadius;
    
    this.origX += this.vx;
    this.origY += this.vy;
    
    // Keep in bounds
    if (this.origX < -30) this.origX = canvas.width + 30;
    if (this.origX > canvas.width + 30) this.origX = -30;
    if (this.origY < -30) this.origY = canvas.height + 30;
    if (this.origY > canvas.height + 30) this.origY = -30;
    
    this.pulse += 0.02;
    let pulseFactor = Math.sin(this.pulse) * 0.15;
    
    let twinkleFactor = 0;
    if (this.twinkle) {
      this.twinklePhase += 0.1;
      twinkleFactor = Math.sin(this.twinklePhase * 3) * 0.2;
      if (Math.random() < 0.002) this.twinkle = false;
    }
    
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 200) {
      const force = (200 - distance) / 200;
      const targetX = this.origX + orbitX;
      const targetY = this.origY + orbitY;
      this.x = targetX + (mouseX - targetX) * force * 0.4;
      this.y = targetY + (mouseY - targetY) * force * 0.4;
      this.brightness = Math.min(0.95, this.baseBrightness + 0.7 * force + pulseFactor + twinkleFactor); // cap at 0.95
      this.spin += force * 0.04;
      this.lineFade = Math.min(1, this.lineFade + 0.12);

      if (!this.twinkle && Math.random() < 0.1) {
        this.twinkle = true;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }
    } else {
      this.x = this.origX + orbitX;
      this.y = this.origY + orbitY;
      this.brightness = Math.max(0.1, this.baseBrightness + pulseFactor + twinkleFactor);
      this.spin *= 0.94;
      this.lineFade = Math.max(0, this.lineFade - 0.04);

      if (!this.twinkle && Math.random() < 0.0005) {
        this.twinkle = true;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }
    }
  }
  
  draw() {
    // ✅ SAFETY: Skip if size is invalid
    if (this.size <= 0 || this.size > 10 || isNaN(this.size)) return;
    if (isNaN(this.x) || isNaN(this.y)) return;
    
    const size = this.size;
    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, this.brightness)); // clamp alpha
    
    // Draw glow (max radius = 20px to avoid moon effect)
    const glowRadius = Math.min(20, size * 2);
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.min(5, size * 0.8), 0, Math.PI * 2);
    ctx.fill();

    // Spin trail
    if (Math.abs(this.spin) > 0.03) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.min(3, size * 0.5);
      ctx.globalAlpha = this.brightness * 0.4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.min(15, size * 1.8), this.spin, this.spin + Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  drawLineToMouse() {
    if (this.lineFade <= 0) return;
    
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 200 && distance > 0) {
      ctx.save();
      const gradient = ctx.createLinearGradient(this.x, this.y, mouseX, mouseY);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = this.lineFade * 0.6;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ✅ CRITICAL: Proper reset function
function resetBackground() {
  // Cancel any existing animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  // Clear all particle arrays
  deepParticles = [];
  stellarStars = [];
  shootingStars = []; // if you added it
  
  // ✅ FIX: Clear canvas AND fill with black to avoid white flash/moon
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Start new animation based on theme
  if (currentTheme === 'deep') {
    for (let i = 0; i < 100; i++) {
      deepParticles.push(new DeepParticle());
    }
    animateDeep();
  } else {
    for (let i = 0; i < 100; i++) {
      stellarStars.push(new StellarStar());
    }
    animateStellar();
  }
}

function animateDeep() {
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  deepParticles.forEach(p => {
    p.update();
    p.draw();
  });
  animationId = requestAnimationFrame(animateDeep);
}

function animateStellar() {
  // ✅ CRITICAL FIX: Clear canvas FIRST with solid dark background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // ✨ THEN add subtle animated nebula OVER the dark background
  const time = Date.now() * 0.0001;
  const grd = ctx.createRadialGradient(
    canvas.width * 0.5, canvas.height * 0.5, 0,
    canvas.width * 0.5, canvas.height * 0.5, Math.max(canvas.width, canvas.height) * 0.7
  );
  // Use very low alpha values to avoid brightness buildup
  grd.addColorStop(0, `rgba(15, 10, 30, ${0.05 + Math.sin(time) * 0.02})`);
  grd.addColorStop(0.6, `rgba(25, 15, 45, ${0.03 + Math.cos(time * 0.7) * 0.01})`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Now draw stars
  stellarStars.forEach(star => star.update());
  stellarStars.forEach(star => star.drawLineToMouse());
  stellarStars.forEach(star => star.draw());
  
  // Shooting stars (optional)
  if (Math.random() < 0.002) {
    shootingStars.push({
      x: -10,
      y: Math.random() * canvas.height,
      vx: 8 + Math.random() * 6,
      vy: (Math.random() - 0.5) * 2,
      life: 60,
      maxLife: 60
    });
  }
  
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life--;
    
    const alpha = s.life / s.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * alpha;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
    ctx.stroke();
    ctx.restore();
    
    if (s.life <= 0 || s.x > canvas.width + 20) {
      shootingStars.splice(i, 1);
    }
  }
  
  animationId = requestAnimationFrame(animateStellar);
}

// Initialize
resetBackground();
