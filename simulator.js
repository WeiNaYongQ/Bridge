// ======================
// 🌉 BRIDGE SIMULATOR LOGIC
// ======================

const LENGTH_TO_M = { 'm': 1, 'cm': 0.01, 'km': 1000, 'ft': 0.3048, 'in': 0.0254 };
const MASS_TO_KG = { 'kg': 1, 'lb': 0.45359237 };
const N_TO_LBF = 0.2248089431;

const els = {
  length: document.getElementById('length'),
  position: document.getElementById('position'),
  lengthUnit: document.getElementById('lengthUnit'),
  mass: document.getElementById('mass'),
  massUnit: document.getElementById('massUnit'),
  forceUnit: document.getElementById('forceUnit'),
  gravity: document.getElementById('gravity'),
  updateBtn: document.getElementById('updateBtn'),
  result: document.getElementById('result'),
  svg: document.getElementById('bridgeSvg'),
  panel: document.getElementById('controlPanel'),
  header: document.getElementById('panelHeader'),
  toggleBtn: document.getElementById('toggleBtn'),
  panelContent: document.getElementById('panelContent')
};

let isPanelDragging = false;
let panelOffsetX = 0, panelOffsetY = 0;

els.header.addEventListener('mousedown', startPanelDrag);
els.header.addEventListener('touchstart', e => {
  e.preventDefault();
  startPanelDrag(e.touches[0], true);
});

function startPanelDrag(e, isTouch = false) {
  isPanelDragging = true;
  const clientX = isTouch ? e.clientX : e.clientX;
  const clientY = isTouch ? e.clientY : e.clientY;
  const rect = els.panel.getBoundingClientRect();
  panelOffsetX = clientX - rect.left;
  panelOffsetY = clientY - rect.top;
  document.addEventListener('mousemove', dragPanel);
  document.addEventListener('mouseup', endPanelDrag);
  document.addEventListener('touchmove', touchDragPanel, { passive: false });
  document.addEventListener('touchend', endPanelDrag);
}

function dragPanel(e) { if (isPanelDragging) movePanel(e.clientX, e.clientY); }
function touchDragPanel(e) { if (isPanelDragging && e.touches.length) movePanel(e.touches[0].clientX, e.touches[0].clientY); }

function movePanel(clientX, clientY) {
  const x = clientX - panelOffsetX;
  const y = clientY - panelOffsetY;
  const maxX = window.innerWidth - els.panel.offsetWidth;
  const maxY = window.innerHeight - els.panel.offsetHeight;
  els.panel.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
  els.panel.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
}

function endPanelDrag() {
  isPanelDragging = false;
  document.removeEventListener('mousemove', dragPanel);
  document.removeEventListener('mouseup', endPanelDrag);
  document.removeEventListener('touchmove', touchDragPanel);
  document.removeEventListener('touchend', endPanelDrag);
}

let isMinimized = false;
els.toggleBtn.addEventListener('click', () => {
  isMinimized = !isMinimized;
  if (isMinimized) {
    els.panel.style.height = '42px';
    els.panelContent.style.display = 'none';
    els.toggleBtn.textContent = '+';
  } else {
    els.panel.style.height = 'auto';
    els.panelContent.style.display = 'block';
    els.toggleBtn.textContent = '−';
  }
});

els.updateBtn.addEventListener('click', fullUpdate);
window.onload = () => setTimeout(fullUpdate, 100);

function fullUpdate() {
  const L = parseFloat(els.length.value) || 50;
  const X = parseFloat(els.position.value) || 0;
  const M = parseFloat(els.mass.value) || 400;
  const G = parseFloat(els.gravity.value) || 10;
  if (L <= 0) els.length.value = 50;
  if (M < 0) els.mass.value = 400;
  if (G <= 0 || G > 100) els.gravity.value = 10;
  render();
}

function render() {
  const lenUnit = els.lengthUnit.value;
  const massUnit = els.massUnit.value;
  const forceUnit = els.forceUnit.value;

  const L_input = parseFloat(els.length.value) || 50;
  const X_input = parseFloat(els.position.value) || 0;
  const M_input = parseFloat(els.mass.value) || 400;
  const G_input = parseFloat(els.gravity.value) || 10;

  const L_m = L_input * LENGTH_TO_M[lenUnit];
  let x_m = X_input * LENGTH_TO_M[lenUnit];
  x_m = Math.max(0, Math.min(x_m, L_m));
  const m_kg = M_input * MASS_TO_KG[massUnit];
  const g = G_input;

  const W_N = m_kg * g;
  const R_left_N = W_N * (L_m - x_m) / L_m;
  const R_right_N = W_N * x_m / L_m;

  let R1, R2, sym;
  if (forceUnit === 'lbf') {
    R1 = Math.round(R_left_N * N_TO_LBF);
    R2 = Math.round(R_right_N * N_TO_LBF);
    sym = 'lbf';
  } else {
    R1 = Math.round(R_left_N);
    R2 = Math.round(R_right_N);
    sym = 'N';
  }

  els.result.innerHTML = `Left: ${R1} ${sym} | Right: ${R2} ${sym}`;

  els.svg.innerHTML = '';
  const width = 800, height = 500, margin = 120;
  const beamY = height - 160, supportY = height - 120;
  const scaleX = (width - 2 * margin) / L_m;
  const leftX = margin;
  const rightX = margin + L_m * scaleX;
  const loadX = margin + x_m * scaleX;
  const maxForce = Math.max(W_N, R_left_N, R_right_N, 1);
  const arrowScale = 160 / maxForce;

  const beam = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  beam.setAttribute("x", leftX);
  beam.setAttribute("y", beamY);
  beam.setAttribute("width", Math.max(1, L_m * scaleX));
  beam.setAttribute("height", 12);
  beam.setAttribute("fill", "#cbd5e1");
  beam.setAttribute("rx", 4);
  els.svg.appendChild(beam);

  drawSupport(leftX, beamY, supportY);
  drawSupport(rightX, beamY, supportY);

  const weight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  weight.setAttribute("cx", loadX);
  weight.setAttribute("cy", beamY - 36);
  weight.setAttribute("r", 18);
  weight.setAttribute("fill", "#f87171");
  weight.setAttribute("id", "weightHandle");
  weight.setAttribute("cursor", "grab");
  els.svg.appendChild(weight);
  addText(loadX, beamY - 36, "W", "#0f172a", "15px", "bold");

  drawArrow(loadX, beamY + 12, beamY + 12 + W_N * arrowScale, "#f87171", true);
  drawArrow(leftX, beamY, beamY - R_left_N * arrowScale, "#60a5fa", false);
  drawArrow(rightX, beamY, beamY - R_right_N * arrowScale, "#60a5fa", false);

  addText(leftX, beamY - R_left_N * arrowScale - 24, `R₁ = ${R1} ${sym}`, "#60a5fa", "15px");
  addText(rightX, beamY - R_right_N * arrowScale - 24, `R₂ = ${R2} ${sym}`, "#60a5fa", "15px");

  const unitSym = { 'm':'m', 'cm':'cm', 'km':'km', 'ft':'ft', 'in':'in' }[lenUnit];
  const x_disp = (x_m / LENGTH_TO_M[lenUnit]).toFixed(getPrecision(x_m / LENGTH_TO_M[lenUnit]));
  const r_disp = ((L_m - x_m) / LENGTH_TO_M[lenUnit]).toFixed(getPrecision((L_m - x_m) / LENGTH_TO_M[lenUnit]));
  const t_disp = (L_m / LENGTH_TO_M[lenUnit]).toFixed(getPrecision(L_m / LENGTH_TO_M[lenUnit]));

  const dimY = height - 60;
  if (x_m > 0) drawDimension(leftX, loadX, dimY - 24, `${x_disp} ${unitSym}`, "#fbbf24");
  if (x_m < L_m) drawDimension(loadX, rightX, dimY - 24, `${r_disp} ${unitSym}`, "#f472b6");
  drawDimension(leftX, rightX, dimY, `${t_disp} ${unitSym}`, "#94a3b8");

  weight.addEventListener('mousedown', startDrag);
  weight.addEventListener('touchstart', e => {
    e.preventDefault();
    startDrag(e.touches[0], true);
  });
}

function getPrecision(val) {
  if (val >= 100) return 0;
  if (val >= 10) return 1;
  if (val >= 1) return 2;
  return 3;
}

let isDragging = false;
let offsetX = 0;

function startDrag(e, isTouch = false) {
  isDragging = true;
  const clientX = isTouch ? e.clientX : e.clientX;
  const cx = parseFloat(document.getElementById('weightHandle').getAttribute('cx'));
  offsetX = clientX - cx;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', touchDrag, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function drag(e) { if (isDragging) updatePosition(e.clientX); }
function touchDrag(e) { if (isDragging && e.touches.length) updatePosition(e.touches[0].clientX); }

function updatePosition(clientX) {
  const L_input = parseFloat(els.length.value) || 50;
  const L_m = L_input * LENGTH_TO_M[els.lengthUnit.value];
  const rect = els.svg.getBoundingClientRect();
  const pixelX = clientX - rect.left - offsetX;
  const margin = 120;
  const scaleX = (800 - 2 * margin) / L_m;
  const minPx = margin;
  const maxPx = margin + L_m * scaleX;
  let x_m = (Math.max(minPx, Math.min(maxPx, pixelX)) - margin) / scaleX;
  x_m = Math.round(x_m * 1000) / 1000;
  x_m = Math.max(0, Math.min(x_m, L_m));
  const factor = LENGTH_TO_M[els.lengthUnit.value];
  els.position.value = (x_m / factor).toFixed(getPrecision(x_m / factor));
  render();
}

function endDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', touchDrag);
  document.removeEventListener('touchend', endDrag);
}

function drawSupport(x, topY, baseY) {
  const tri = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  tri.setAttribute("points", `${x - 22},${baseY} ${x},${topY} ${x + 22},${baseY}`);
  tri.setAttribute("fill", "#94a3b8");
  els.svg.appendChild(tri);
}

function drawArrow(x, y1, y2, color, isDown) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "2.8");
  els.svg.appendChild(line);
  const h = 11;
  const points = isDown
    ? `${x},${y2} ${x - h},${y2 - h} ${x + h},${y2 - h}`
    : `${x},${y2} ${x - h},${y2 + h} ${x + h},${y2 + h}`;
  const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  head.setAttribute("points", points);
  head.setAttribute("fill", color);
  els.svg.appendChild(head);
}

function drawDimension(x1, x2, y, label, color = "#94a3b8") {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "1.8");
  els.svg.appendChild(line);
  const t = (x) => {
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", y - 7);
    tick.setAttribute("x2", x);
    tick.setAttribute("y2", y + 7);
    tick.setAttribute("stroke", "#94a3b8");
    tick.setAttribute("stroke-width", "2");
    els.svg.appendChild(tick);
  };
  t(x1); t(x2);
  addText((x1 + x2) / 2, y - 12, label, color, "15px");
}

function addText(x, y, text, fill, size, weight = "normal") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
  el.setAttribute("x", x);
  el.setAttribute("y", y);
  el.setAttribute("text-anchor", "middle");
  el.setAttribute("fill", fill);
  el.setAttribute("font-size", size);
  el.setAttribute("font-weight", weight);
  el.setAttribute("font-family", "Arial, sans-serif");
  el.textContent = text;
  els.svg.appendChild(el);
}
