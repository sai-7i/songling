// js/main.js

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate = () => typeof window.gsap !== 'undefined' && !prefersReducedMotion.matches;

let scale = 1.1;
let translateX = 0;
let translateY = 0;
let worldGroup;
let currentActiveId = null;
let transformFrame = 0;
let hasDragged = false;

const MIN_SCALE = 0.65;
const MAX_SCALE = 3;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 900;
const AMAP_CITY = '巩义';
const AMAP_SOURCE = 'songling';
const gameMap = document.getElementById('game-map');
const mapContainer = document.getElementById('map-container');
const pointerPositions = new Map();
let dragState = null;
let pinchState = null;

document.addEventListener('DOMContentLoaded', () => {
    try { initList(); } catch (err) { console.error('initList 失败', err); }
    try { initLandmarks(); } catch (err) { console.error('initLandmarks 失败', err); }
    try { initMap(); } catch (err) { console.error('initMap 失败', err); }
    try { initModal(); } catch (err) { console.error('initModal 失败', err); }

    if (canAnimate()) {
        try { initIntro(); } catch (err) { console.error('initIntro 失败', err); }
    } else {
        showMap();
    }
});

function initIntro() {
    const enterBtn = document.getElementById('btn-enter');
    const introScreen = document.getElementById('intro-screen');
    const mapScreen = document.getElementById('map-screen');

    gsap.set('.title-main', { autoAlpha: 0, scale: 0.94 });
    gsap.set('.title-sub, .intro-text', { autoAlpha: 0, y: 16 });
    gsap.set('.seal-mark', { autoAlpha: 0, scale: 1.2 });
    gsap.set(enterBtn, { autoAlpha: 0, y: 20 });
    mapScreen.classList.add('hidden');

    gsap.timeline({ delay: 0.15 })
        .to('.seal-mark', { autoAlpha: 0.8, scale: 1, duration: 0.7, ease: 'power2.out' })
        .to('.title-main', { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, '-=0.35')
        .to('.title-sub, .intro-text', { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power1.out' }, '-=0.35')
        .to(enterBtn, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)' }, '-=0.2');

    let hasEntered = false;
    enterBtn.addEventListener('click', () => {
        if (hasEntered) return;
        hasEntered = true;

        gsap.to('.intro-content', { autoAlpha: 0, scale: 1.03, duration: 0.45, ease: 'power2.in' });
        gsap.to(introScreen, {
            autoAlpha: 0,
            duration: 0.55,
            ease: 'power1.inOut',
            onComplete: showMap
        });
    });
}

function showMap() {
    const introScreen = document.getElementById('intro-screen');
    const mapScreen = document.getElementById('map-screen');

    introScreen.style.display = 'none';
    mapScreen.classList.remove('hidden');
    mapScreen.style.display = 'flex';
    centerMap(true);

    if (!canAnimate()) return;

    gsap.from('.hud-header', { autoAlpha: 0, y: -16, duration: 0.45, ease: 'power2.out' });
    gsap.from('.hud-controls .hud-btn', { autoAlpha: 0, x: -12, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
    gsap.from('.side-panel', { autoAlpha: 0, x: window.innerWidth <= 768 ? 0 : 24, y: window.innerWidth <= 768 ? 24 : 0, duration: 0.45, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
    gsap.from('.marker-visual', { autoAlpha: 0, scale: 0.75, duration: 0.35, stagger: 0.04, ease: 'back.out(1.4)', clearProps: 'opacity,transform' });
}

function isMobileExperience() {
    return window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|HarmonyOS/i.test(navigator.userAgent);
}

function getAmapSearchUrl(keyword, requestNative = isMobileExperience()) {
    const query = new URLSearchParams({
        keyword,
        city: AMAP_CITY,
        view: 'map',
        src: AMAP_SOURCE,
        callnative: requestNative ? '1' : '0'
    });
    return `https://uri.amap.com/search?${query.toString()}`;
}

function openAmapSearch(keyword) {
    const url = getAmapSearchUrl(keyword);
    if (isMobileExperience()) {
        // 移动端优先请求打开地图 App；未安装时由网页继续承接。
        window.location.assign(url);
        return;
    }
    window.open(url, '_blank', 'noopener');
}

function initLandmarks() {
    document.querySelectorAll('.landmark[data-amap-keyword]').forEach(landmark => {
        const keyword = landmark.dataset.amapKeyword;
        const link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
        link.setAttribute('href', getAmapSearchUrl(keyword));
        link.setAttribute('target', isMobileExperience() ? '_self' : '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('aria-label', `查看${keyword}位置`);

        landmark.removeAttribute('role');
        landmark.removeAttribute('tabindex');
        landmark.parentNode.insertBefore(link, landmark);
        link.appendChild(landmark);
    });
}

function initMap() {
    syncMapAspectRatio();
    worldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    worldGroup.setAttribute('id', 'world-transform');

    const layerIds = ['terrain-layer', 'water-layer', 'township-layer', 'road-layer', 'landmark-layer', 'zone-layer', 'markers-layer'];
    const layers = layerIds.map(id => document.getElementById(id));
    const markers = document.getElementById('markers-layer');

    gameMap.appendChild(worldGroup);
    layers.forEach(layer => worldGroup.appendChild(layer));

    tombsData.forEach(tomb => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'map-marker');
        group.setAttribute('id', `marker-${tomb.id}`);
        group.setAttribute('role', 'button');
        group.setAttribute('aria-label', `查看${tomb.name}详情`);
        group.setAttribute('tabindex', '0');
        group.setAttribute('transform', `translate(${tomb.location.mapX}, ${tomb.location.mapY})`);

        const visual = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        visual.setAttribute('class', 'marker-visual');

        const base = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        base.setAttribute('points', '0,-15 15,0 0,15 -15,0');
        base.setAttribute('class', 'marker-base');

        const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        core.setAttribute('cx', '0');
        core.setAttribute('cy', '0');
        core.setAttribute('r', '4');
        core.setAttribute('class', 'marker-core');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', '30');
        text.setAttribute('class', 'marker-text');
        text.textContent = tomb.name;

        visual.append(base, core, text);
        group.appendChild(visual);

        const selectTomb = event => {
            event.stopPropagation();
            if (hasDragged) {
                hasDragged = false;
                return;
            }
            if (canAnimate()) {
                gsap.fromTo(visual, { scale: 0.88 }, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
            }
            setActive(tomb.id);
            openModal(tomb);
            centerOnMarker(tomb.location.mapX, tomb.location.mapY);
        };

        group.addEventListener('click', selectTomb);
        group.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectTomb(event);
            }
        });
        markers.appendChild(group);
    });

    mapContainer.addEventListener('pointerdown', handlePointerDown);
    mapContainer.addEventListener('pointermove', handlePointerMove);
    mapContainer.addEventListener('pointerup', handlePointerEnd);
    mapContainer.addEventListener('pointercancel', handlePointerEnd);
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });

    document.getElementById('btn-zoom-in').addEventListener('click', () => zoomAt(0.2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoomAt(-0.2));
    document.getElementById('btn-reset').addEventListener('click', resetMap);

    window.addEventListener('resize', () => {
        syncMapAspectRatio();
        centerMap(true);
    }, { passive: true });
}

function syncMapAspectRatio() {
    if (!gameMap) return;
    gameMap.setAttribute('preserveAspectRatio', window.innerWidth <= 768 ? 'xMidYMid slice' : 'xMidYMid meet');
}

function getMapMetrics() {
    const rect = mapContainer.getBoundingClientRect();
    const slice = gameMap.getAttribute('preserveAspectRatio')?.includes('slice');
    const scaleFactor = slice
        ? Math.max(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT)
        : Math.min(rect.width / SVG_WIDTH, rect.height / SVG_HEIGHT);
    return {
        rect,
        scaleFactor,
        offsetX: (rect.width - SVG_WIDTH * scaleFactor) / 2,
        offsetY: (rect.height - SVG_HEIGHT * scaleFactor) / 2
    };
}

function getSvgPoint(clientX, clientY) {
    const metrics = getMapMetrics();
    return {
        x: (clientX - metrics.rect.left - metrics.offsetX) / metrics.scaleFactor,
        y: (clientY - metrics.rect.top - metrics.offsetY) / metrics.scaleFactor
    };
}

function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    pointerPositions.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    mapContainer.setPointerCapture?.(event.pointerId);

    if (pointerPositions.size === 1) {
        dragState = {
            clientX: event.clientX,
            clientY: event.clientY,
            translateX,
            translateY,
            scale
        };
        hasDragged = false;
    } else if (pointerPositions.size === 2) {
        beginPinch();
        dragState = null;
    }
}

function handlePointerMove(event) {
    if (!pointerPositions.has(event.pointerId)) return;

    pointerPositions.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

    if (pointerPositions.size === 2) {
        updatePinch();
        return;
    }

    if (!dragState) return;
    const metrics = getMapMetrics();
    const deltaX = (event.clientX - dragState.clientX) / metrics.scaleFactor;
    const deltaY = (event.clientY - dragState.clientY) / metrics.scaleFactor;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) hasDragged = true;
    translateX = dragState.translateX + deltaX;
    translateY = dragState.translateY + deltaY;
    updateTransform();
}

function handlePointerEnd(event) {
    pointerPositions.delete(event.pointerId);
    if (pointerPositions.size === 1) {
        const [pointer] = pointerPositions.values();
        dragState = { clientX: pointer.clientX, clientY: pointer.clientY, translateX, translateY, scale };
        pinchState = null;
    } else {
        dragState = null;
        pinchState = null;
    }
}

function beginPinch() {
    const [first, second] = pointerPositions.values();
    const midpoint = getSvgPoint((first.clientX + second.clientX) / 2, (first.clientY + second.clientY) / 2);
    pinchState = {
        distance: Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY),
        midpoint,
        scale,
        translateX,
        translateY
    };
}

function updatePinch() {
    const [first, second] = pointerPositions.values();
    if (!pinchState) {
        beginPinch();
        return;
    }

    const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchState.scale * distance / pinchState.distance));
    const ratio = nextScale / pinchState.scale;
    scale = nextScale;
    translateX = pinchState.midpoint.x - (pinchState.midpoint.x - pinchState.translateX) * ratio;
    translateY = pinchState.midpoint.y - (pinchState.midpoint.y - pinchState.translateY) * ratio;
    hasDragged = true;
    updateTransform();
}

function handleWheel(event) {
    event.preventDefault();
    const point = getSvgPoint(event.clientX, event.clientY);
    zoomAt(event.deltaY > 0 ? -0.12 : 0.12, point);
}

function zoomAt(delta, point = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }) {
    const previousScale = scale;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    if (scale === previousScale) return;

    const ratio = scale / previousScale;
    translateX = point.x - (point.x - translateX) * ratio;
    translateY = point.y - (point.y - translateY) * ratio;
    updateTransform();
}

function resetMap() {
    const reset = () => {
        scale = 1.1;
        translateX = 0;
        translateY = 0;
        centerMap(true);
    };

    if (!canAnimate()) {
        reset();
        return;
    }

    gsap.to({ scale, translateX, translateY }, {
        scale: 1.1,
        translateX: 0,
        translateY: 0,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate() {
            const values = this.targets()[0];
            scale = values.scale;
            translateX = values.translateX;
            translateY = values.translateY;
            centerMap(true);
        }
    });
}

function updateTransform() {
    if (transformFrame) return;
    transformFrame = window.requestAnimationFrame(() => {
        if (worldGroup) {
            worldGroup.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
        }
        transformFrame = 0;
    });
}

function centerMap(force = false, targetX = SVG_WIDTH / 2, targetY = SVG_HEIGHT / 2) {
    if (force || (translateX === 0 && translateY === 0)) {
        translateX = targetX - targetX * scale;
        translateY = targetY - targetY * scale;
    }
    updateTransform();
}

function centerOnMarker(x, y) {
    const offsetX = window.innerWidth > 768 ? 450 : SVG_WIDTH / 2;
    const offsetY = window.innerWidth > 768 ? SVG_HEIGHT / 2 : 330;
    const targetScale = Math.max(scale, 1.5);
    const targetTranslateX = offsetX - x * targetScale;
    const targetTranslateY = offsetY - y * targetScale;

    if (!canAnimate()) {
        scale = targetScale;
        translateX = targetTranslateX;
        translateY = targetTranslateY;
        updateTransform();
        return;
    }

    gsap.to({ x: translateX, y: translateY, s: scale }, {
        x: targetTranslateX,
        y: targetTranslateY,
        s: targetScale,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate() {
            const values = this.targets()[0];
            translateX = values.x;
            translateY = values.y;
            scale = values.s;
            updateTransform();
        }
    });
}

function initList() {
    const list = document.getElementById('tomb-list');
    if (!list) return;

    list.innerHTML = '';
    tombsData.forEach(tomb => {
        const item = document.createElement('button');
        item.className = 'list-item';
        item.id = `list-${tomb.id}`;
        item.type = 'button';
        item.innerHTML = `
            <span class="item-name">${tomb.name}</span>
            <span class="item-meta">${tomb.emperor} / ${tomb.area}</span>
        `;
        item.addEventListener('click', () => {
            setActive(tomb.id);
            openModal(tomb);
            centerOnMarker(tomb.location.mapX, tomb.location.mapY);
        });
        list.appendChild(item);
    });
}

function setActive(id) {
    if (currentActiveId) {
        document.getElementById(`list-${currentActiveId}`)?.classList.remove('active');
        document.getElementById(`marker-${currentActiveId}`)?.classList.remove('active');
    }

    currentActiveId = id;
    const tomb = tombsData.find(item => item.id === id);
    if (!tomb) return;

    document.getElementById(`list-${id}`)?.classList.add('active');
    document.getElementById(`marker-${id}`)?.classList.add('active');
    document.getElementById('current-region-display').textContent = tomb.area;
}

function initModal() {
    const overlay = document.getElementById('detail-overlay');
    const closeButton = document.getElementById('btn-close-detail');

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) closeModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && overlay.style.display === 'flex') closeModal();
    });
}

function openModal(tomb) {
    const overlay = document.getElementById('detail-overlay');
    document.getElementById('detail-title').textContent = tomb.name;
    document.getElementById('detail-emperor').textContent = tomb.emperor;
    document.getElementById('detail-era').textContent = tomb.era;
    document.getElementById('detail-level').textContent = tomb.level;
    document.getElementById('detail-desc').textContent = tomb.desc;
    const amapLink = document.getElementById('detail-amap');
    amapLink.href = getAmapSearchUrl(tomb.name);
    amapLink.target = isMobileExperience() ? '_self' : '_blank';
    renderGallery(tomb);

    overlay.style.display = 'flex';
    document.body.classList.add('modal-open');

    if (!canAnimate()) return;
    gsap.fromTo('.detail-content', { autoAlpha: 0, scale: 0.98, y: 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    gsap.from('.detail-title, .meta-tag, #detail-desc', { autoAlpha: 0, y: 8, duration: 0.25, stagger: 0.05, delay: 0.08 });
}

function renderGallery(tomb) {
    const gallery = document.getElementById('detail-images');
    gallery.replaceChildren();

    const stage = document.createElement('div');
    stage.className = 'gallery-stage';
    const controls = document.createElement('div');
    controls.className = 'gallery-controls';
    controls.setAttribute('aria-label', `${tomb.name}图片切换`);

    const showImage = index => {
        const imageName = tomb.images[index];
        const webpName = imageName.replace(/\.jpe?g$/i, '.webp');
        const picture = document.createElement('picture');
        const webp = document.createElement('source');
        webp.type = 'image/webp';
        webp.srcset = `assets/images/tombs/${webpName}`;

        const image = document.createElement('img');
        image.src = `assets/images/tombs/${imageName}`;
        image.alt = `${tomb.name}图片 ${index + 1}`;
        image.className = 'gallery-img';
        image.decoding = 'async';
        image.fetchPriority = 'high';

        picture.append(webp, image);
        stage.replaceChildren(picture);
        controls.querySelectorAll('button').forEach((button, buttonIndex) => {
            button.classList.toggle('active', buttonIndex === index);
            button.setAttribute('aria-pressed', String(buttonIndex === index));
        });
    };

    tomb.images.forEach((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery-control';
        button.textContent = `图 ${index + 1}`;
        button.setAttribute('aria-label', `查看${tomb.name}第${index + 1}张图片`);
        button.addEventListener('click', () => showImage(index));
        controls.appendChild(button);
    });

    gallery.append(stage, controls);
    showImage(0);
}

function closeModal() {
    const overlay = document.getElementById('detail-overlay');
    const finish = () => {
        overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    if (!canAnimate()) {
        finish();
        return;
    }

    gsap.to('.detail-content', { autoAlpha: 0, scale: 0.98, y: 8, duration: 0.2, ease: 'power1.in', onComplete: finish });
}
