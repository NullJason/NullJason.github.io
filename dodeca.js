/* Configuration */
const cfg = {
    dodeSize: 800,
    spinSpeed: 0.006,
    spinDamping: 0.08,
    rotationDirection: 1,
    popInScrollTrigger: 120,
    collapseThreshold: 160,
    collapseHysteresis: 220, // how far from bottom to wait to reverse (prevents flicker)
    popInDuration: 400,
    liquidFillMs: 220,
    liquidDrainMs: 260,
    dragSensitivity: 0.0075, // pixels -> radians
    frictionPerMs: 0.0013, // friction coefficient per ms for inertia
    minVelocityStop: 0.00002,
    menuLinks: [
        { href: "webProjects.html", label: "Games" },
        { href: "webProjects.html", label: "Visualizers"},
        { href: "webProjects.html", label: "Others/Extras" },
        { href: "#contact", label: "Contact" },
    ]
};

/* DOM refs */
const overlay = document.getElementById('overlay');
const threeContainer = document.getElementById('three-container');
const box = document.getElementById('box');
const liquid = document.getElementById('liquid');
const boxContent = document.getElementById('boxContent');
const ctxMenu = document.getElementById('ctxMenu');

threeContainer.style.setProperty('--dode-size', cfg.dodeSize + 'px');

/* Three.js scene */
let scene, camera, renderer, dodeMesh;

/* rotation targets and inertia */
let targetRotX = 0, targetRotY = 0;
let lastWindowScroll = window.scrollY;
let poppedIn = false, collapsed = false, collapseInProgress = false, reversing = false;

/* drag state */
let isDragging = false;
let dragStart = { x: 0, y: 0, rotX: 0, rotY: 0, t: 0 };
let velocity = { x: 0, y: 0 }; // rad/ms
let inertiaRAF = null;
let lastMoveSamples = []; // for velocity calc

/* Init three */
function initThree() {
    scene = new THREE.Scene();
    const w = cfg.dodeSize, h = cfg.dodeSize;
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    camera.position.set(0, 0, 4.5);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.domElement.style.display = 'block';
    threeContainer.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const p = new THREE.PointLight(0xffffff, 0.8);
    p.position.set(5, 5, 5);
    scene.add(p);

    const geometry = new THREE.DodecahedronGeometry(1.0, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0xdcecff, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.26, side: THREE.DoubleSide
    });
    dodeMesh = new THREE.Mesh(geometry, material);
    dodeMesh.scale.set(1, 1, 1);
    dodeMesh.rotation.x = 0.4;
    dodeMesh.rotation.y = -0.3;
    scene.add(dodeMesh);

    const geoWire = new THREE.DodecahedronGeometry(1.001, 0);
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1, transparent: true, opacity: 0.06 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geoWire), wireMaterial);
    dodeMesh.add(edges);

    requestAnimationFrame(animate);
}

/* Render loop */
function animate(now) {
    requestAnimationFrame(animate);

    // apply inertia + smoothing for target rotations
    // update rotation using smoothing factor
    dodeMesh.rotation.x += (targetRotX - dodeMesh.rotation.x) * cfg.spinDamping;
    dodeMesh.rotation.y += (targetRotY - dodeMesh.rotation.y) * cfg.spinDamping;

    // slight idle
    const clock = performance.now() * 0.0001;
    dodeMesh.rotation.z = 0.06 * Math.sin(clock);

    renderer.render(scene, camera);
}

/* Scroll behavior (spin and collapse/reverse check) */
window.addEventListener('scroll', onScroll, { passive: true });
function onScroll() {
    const sY = window.scrollY;
    const delta = sY - lastWindowScroll;
    const rotAmount = delta * cfg.spinSpeed * cfg.rotationDirection;
    targetRotY += rotAmount;
    targetRotX += rotAmount * 0.2;
    lastWindowScroll = sY;

    // pop-in
    if (!poppedIn && sY > cfg.popInScrollTrigger) {
        poppedIn = true; showPopIn();
    } else if (!poppedIn && cfg.popInScrollTrigger <= 0) {
        poppedIn = true; showPopIn();
    }

    // collapse trigger
    const distFromBottom = document.documentElement.scrollHeight - (window.innerHeight + sY);

    if (!collapsed && !collapseInProgress && distFromBottom <= cfg.collapseThreshold) {
        collapseInProgress = true;
        triggerCollapseToBox();
    }

    // reverse: user scrolled up away from bottom sufficiently
    if (collapsed && !reversing) {
        if (distFromBottom > cfg.collapseHysteresis) {
            reversing = true;
            triggerReverseFromBox();
        }
    }

    // if user scrolls while inertia is running, stop momentum (per request)
    stopInertia();
}

/* Show pop-in */
function showPopIn() {
    threeContainer.classList.remove('hidden');
    threeContainer.style.transform = 'scale(1)';
    threeContainer.style.opacity = '1';
    overlay.setAttribute('aria-hidden', 'false');
}

/* Collapse events */
function triggerCollapseToBox() {
    if (!dodeMesh) return;
    threeContainer.classList.add('collapsing');

    setTimeout(() => {
        const start = performance.now();
        const from = dodeMesh.scale.x;
        const to = 0.25;
        function scaleTick(ts) {
            const t = Math.min(1, (ts - start) / 300);
            const v = from + (to - from) * t;
            dodeMesh.scale.set(v, v, v);
            if (t < 1) requestAnimationFrame(scaleTick);
            else {
                threeContainer.style.opacity = '0';
                showBoxOverlay();
                collapsed = true;
                collapseInProgress = false;
            }
        }
        requestAnimationFrame(scaleTick);
    }, 220);
}

function showBoxOverlay() {
    box.classList.add('visible');
    box.style.pointerEvents = 'none';
    liquid.style.height = '0%';
    liquid.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.12) 100%)';
    setTimeout(() => {
        liquid.style.transition = `height ${cfg.liquidFillMs}ms linear, background-color 120ms linear`;
        liquid.style.height = '100%';
        setTimeout(() => {
            liquid.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.92) 100%)';
        }, Math.round(cfg.liquidFillMs * 0.5));
        setTimeout(() => {
            box.classList.add('revealed');
            box.style.pointerEvents = 'auto';
            box.setAttribute('aria-hidden', 'false');
        }, cfg.liquidFillMs + 40);
    }, 90);
}

/* Reverse -> drain liquid then bring back dodecahedron */
function triggerReverseFromBox() {
    // prevent re-trigger
    if (!collapsed) { reversing = false; return; }
    // make sure content is hidden before drain
    box.classList.remove('revealed');
    box.style.pointerEvents = 'none';

    // drain animation
    liquid.style.transition = `height ${cfg.liquidDrainMs}ms linear, background-color ${Math.round(cfg.liquidDrainMs / 2)}ms linear`;
    // slightly reduce opacity as it drains
    liquid.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.12) 100%)';
    liquid.style.height = '0%';

    // After drained, hide box and restore dodecahedron
    setTimeout(() => {
        box.classList.remove('visible');
        box.setAttribute('aria-hidden', 'true');
        // Restore canvas
        threeContainer.classList.remove('collapsing');
        threeContainer.style.opacity = '1';
        // animate mesh scale up from small to 1
        const start = performance.now();
        const from = dodeMesh.scale.x;
        const to = 1.0;
        function scaleUpTick(ts) {
            const t = Math.min(1, (ts - start) / 320);
            const v = from + (to - from) * t;
            dodeMesh.scale.set(v, v, v);
            if (t < 1) requestAnimationFrame(scaleUpTick);
            else {
                collapsed = false;
                reversing = false;
            }
        }
        requestAnimationFrame(scaleUpTick);
    }, cfg.liquidDrainMs + 80);
}

/* Inertia utilities */
function startInertia() {
    if (inertiaRAF) cancelAnimationFrame(inertiaRAF);
    let lastT = performance.now();
    function tick(t) {
        const dt = t - lastT;
        lastT = t;
        // apply velocities to targets
        targetRotY += velocity.x * dt;
        targetRotX += velocity.y * dt;

        // apply friction: reduce velocity exponentially
        const decay = Math.exp(-cfg.frictionPerMs * dt);
        velocity.x *= decay;
        velocity.y *= decay;

        // stop if small
        if (Math.abs(velocity.x) < cfg.minVelocityStop && Math.abs(velocity.y) < cfg.minVelocityStop) {
            velocity.x = 0; velocity.y = 0;
            inertiaRAF = null;
            return;
        }
        inertiaRAF = requestAnimationFrame(tick);
    }
    inertiaRAF = requestAnimationFrame(tick);
}

function stopInertia() {
    if (inertiaRAF) { cancelAnimationFrame(inertiaRAF); inertiaRAF = null; }
    velocity.x = 0; velocity.y = 0;
}

/* Mouse dragging for middle-click: listen globally but only respond when pointer in threeContainer bounds.
We use pointer-events:none on the overlay so we must check coords ourselves. */
function pointInThreeContainer(x, y) {
    const rect = threeContainer.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

window.addEventListener('mousedown', (ev) => {
    // Middle button (1) for drag
    if (ev.button === 1 && pointInThreeContainer(ev.clientX, ev.clientY) && poppedIn && !collapsed) {
        ev.preventDefault(); // prevent auto-scroll / autoscroll UI
        isDragging = true;
        dragStart = { x: ev.clientX, y: ev.clientY, rotX: targetRotX, rotY: targetRotY, t: performance.now() };
        lastMoveSamples = [{ x: ev.clientX, y: ev.clientY, t: performance.now() }];
        // stop any inertia in progress
        stopInertia();
    }
});

window.addEventListener('mousemove', (ev) => {
    if (!isDragging) return;
    ev.preventDefault();
    const now = performance.now();
    // calculate delta
    const dx = ev.clientX - dragStart.x;
    const dy = ev.clientY - dragStart.y;
    // convert pixels to radians and apply
    targetRotY = dragStart.rotY + dx * cfg.dragSensitivity;
    targetRotX = dragStart.rotX + dy * cfg.dragSensitivity;
    // add to samples
    lastMoveSamples.push({ x: ev.clientX, y: ev.clientY, t: now });
    // keep only last 6 samples
    if (lastMoveSamples.length > 6) lastMoveSamples.shift();
});

window.addEventListener('mouseup', (ev) => {
    if (isDragging && ev.button === 1) {
        isDragging = false;
        // compute velocity from samples
        if (lastMoveSamples.length >= 2) {
            const first = lastMoveSamples[0];
            const last = lastMoveSamples[lastMoveSamples.length - 1];
            const dt = last.t - first.t || 1;
            const vx = (last.x - first.x) / dt; // px/ms
            const vy = (last.y - first.y) / dt;
            // convert to rad/ms
            velocity.x = vx * cfg.dragSensitivity;
            velocity.y = vy * cfg.dragSensitivity;
            startInertia();
        }
        lastMoveSamples = [];
    }
});

/* Right-click context menu: intercept global contextmenu events, check pointer location */
window.addEventListener('contextmenu', (ev) => {
    if (pointInThreeContainer(ev.clientX, ev.clientY) && poppedIn) {
        ev.preventDefault();
        showContextMenuCentered();
    } else {
        // allow system menu elsewhere
        hideContextMenu();
    }
});

/* Create and show centered context menu with cfg.menuLinks */
function populateContextMenu() {
    ctxMenu.innerHTML = '';
    cfg.menuLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        a.addEventListener('click', (e) => {
            // hide menu after click to avoid lingering
            hideContextMenu();
            // In case the link is an anchor within the page, allow default; if mailto/tel, allow browser default.
        });
        ctxMenu.appendChild(a);
    });
}
populateContextMenu();

function showContextMenuCentered() {
    const rect = threeContainer.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // position menu so it is centered on shape
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = Math.round(cx - ctxMenu.offsetWidth / 2) + 'px';
    ctxMenu.style.top = Math.round(cy - ctxMenu.offsetHeight / 2) + 'px';
    ctxMenu.setAttribute('aria-hidden', 'false');
    // ensure menu fits on screen: adjust if necessary
    const menuRect = ctxMenu.getBoundingClientRect();
    const pad = 8;
    let left = parseInt(ctxMenu.style.left, 10);
    let top = parseInt(ctxMenu.style.top, 10);
    if (menuRect.right > window.innerWidth - pad) left -= (menuRect.right - (window.innerWidth - pad));
    if (menuRect.left < pad) left = pad;
    if (menuRect.bottom > window.innerHeight - pad) top -= (menuRect.bottom - (window.innerHeight - pad));
    if (menuRect.top < pad) top = pad;
    ctxMenu.style.left = left + 'px';
    ctxMenu.style.top = top + 'px';
}

function hideContextMenu() {
    ctxMenu.style.display = 'none';
    ctxMenu.setAttribute('aria-hidden', 'true');
}

/* Hide menu when clicking outside or pressing escape */
window.addEventListener('mousedown', (ev) => {
    // If click is outside the menu, hide it
    if (ctxMenu.style.display === 'block') {
        if (!ctxMenu.contains(ev.target)) hideContextMenu();
    }
});
window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideContextMenu(); });

/* If user scrolls while inertia running, stop it (already called in onScroll) */
window.addEventListener('wheel', () => { /* wheel is often used for scroll—also stop inertia */ stopInertia(); }, { passive: true });

/* Resize handling */
window.addEventListener('resize', () => {
    if (!renderer) return;
    const w = cfg.dodeSize, h = cfg.dodeSize;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    if (cfg.popInScrollTrigger <= 0 || window.scrollY > cfg.popInScrollTrigger) {
        poppedIn = true;
        threeContainer.classList.remove('hidden');
        threeContainer.style.transform = 'scale(1)';
        threeContainer.style.opacity = '1';
        overlay.setAttribute('aria-hidden', 'false');
    } else {
        threeContainer.classList.add('hidden');
    }
});