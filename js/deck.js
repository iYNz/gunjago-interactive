/* deck.js — 슬라이드 내비 · 16:9 스케일러 · HUD · 미디어 lazy
   (gemini-omni-test 리포트 덱 엔진 계승 · Claude Team 도입 기안용 경량판) */
(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var booted = false;
  var hudInput = document.getElementById('hud-input');
  var hudTotal = document.getElementById('hud-total');
  var hudSection = document.getElementById('hud-section');
  var hudFill = document.querySelector('#hud .bar > i');
  var navPrev = document.getElementById('navPrev');
  var navNext = document.getElementById('navNext');
  var hudHome = document.getElementById('hud-home');

  var STAGE_W = 1920, STAGE_H = 1080;
  var current = 0;

  /* ---- 섹션 라벨 ---- */
  var SECTION = {
    cover: '표지',
    toc: '목차',
    overview: '개요',
    'corridor-open': '복도 · 인터랙티브 바닥',
    'corridor-space': '복도 · 공간 실측',
    'corridor-sim': '복도 · 투사 검증',
    'corridor-content': '복도 · 콘텐츠',
    'corridor-sim3d': '복도 · 공간 시뮬레이션',
    'room-sim3d': '교실 · 공간 시뮬레이션',
    'room-open': '교실 · 신입생 환영관',
    'room-layout': '교실 · 공간 구성',
    tech: '교실 · LED 미디어월',
    'room-imw': '교실 · 콘텐츠',
    'room-custom': '교실 · 맞춤 세팅',
    'booth-overview': '과 부스 · 구성',
    'booth-detail': '과 부스 · 상세',
    'booth-content': '과 부스 · 콘텐츠',
    'ops-open': '시스템 · 운영',
    cms: '통합 관제',
    system: '장비 구성',
    delivery: '공정 · 사후관리',
    quote: '사업 규모',
    assumptions: '확정 필요 항목',
    effect: '운영 목표',
    outro: '담당 · 문의',
    'logo-end': '마무리',
  };
  function sectionFor(slide) { return SECTION[slide.id] || ''; }

  /* ---- 16:9 스케일러 (레터박스) ---- */
  function fit() {
    var scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
  }

  /* ================= 미디어 lazy ================= */
  function loadVideo(v) {
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function unloadVideo(v) { if (v.src) { v.pause(); v.removeAttribute('src'); v.load(); } }
  function unloadSlide(slide) { slide.querySelectorAll('video').forEach(unloadVideo); }
  function bufferVideo(v) {
    if (!v.src && v.dataset.src) { v.preload = 'auto'; v.src = v.dataset.src; if (v.load) v.load(); }
  }

  /* ---- 결과물 쇼케이스(세로 미니 캐러셀) ---- */
  var showcaseSyncGlow = null;
  function initMiniCarousels() {
    document.querySelectorAll('.mini[data-carousel]').forEach(function (m) {
      var track = m.querySelector('.sc-track-main') || m.querySelector('.mini__track');
      if (!track) return;
      var scope = m.parentNode || m;
      var prev = scope.querySelector('[data-film-prev]');
      var next = scope.querySelector('[data-film-next]');
      var countEl = scope.querySelector('[data-mini-count]');
      if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function (e) { e.stopPropagation(); track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }); });
      track.addEventListener('scroll', function () {
        if (countEl) countEl.textContent = Math.round(track.scrollLeft / track.clientWidth) + 1;
      });
    });
  }

  function onSlideChange(active) {
    var nextSlide = slides[current + 1] || null;
    slides.forEach(function (s) { if (s !== active && s !== nextSlide) unloadSlide(s); });
    active.querySelectorAll('video[data-autoplay]').forEach(loadVideo);
    if (nextSlide) nextSlide.querySelectorAll('video[data-autoplay]').forEach(bufferVideo);
    var lsc = active.querySelector('.logscroll');
    if (lsc) lsc.scrollTop = 0;
    var trk = active.querySelector('.final-track');
    if (trk) { trk.style.animation = 'none'; void trk.offsetWidth; trk.style.animation = ''; }
  }

  /* ================= 내비게이션 ================= */
  function goTo(index, dir) {
    var nx = Math.max(0, Math.min(slides.length - 1, index));
    if (nx === current) { syncInput(); return; }
    slides[current].classList.remove('is-active');
    slides[nx].classList.add('is-active');
    current = nx;
    /* 복도 시뮬레이션 / 기술구성으로 들어올 때: 앞에서 오면 첫 항목, 뒤에서 오면 마지막부터 */
    if (slides[current].id === 'corridor-sim3d' && window.CORR) window.CORR.reset(dir < 0);
    if (slides[current].id === 'room-sim3d' && window.ROOM) window.ROOM.reset(dir < 0);
    if (slides[current].id === 'tech' && window.TECH) window.TECH.reset(dir < 0);
    var gt = slides[current].querySelector('.sc-track-main');
    if (gt) { gt.scrollLeft = (dir < 0) ? Math.max(0, gt.scrollWidth - gt.clientWidth) : 0; }
    render();
  }
  function gatedTrack() { return slides[current].querySelector('.sc-track-main'); }
  /* 복도 시뮬레이션은 16.2m 를 다 걸은 뒤, 교실은 9지점을 다 본 뒤,
     기술구성은 두 센서 뷰를 소진한 뒤 슬라이드를 넘긴다 */
  function onCorr() { return slides[current].id === 'corridor-sim3d' && window.CORR; }
  function onRoom() { return slides[current].id === 'room-sim3d' && window.ROOM; }
  function onTech() { return slides[current].id === 'tech' && window.TECH; }
  function next() {
    if (onCorr() && window.CORR.next()) return;
    if (onRoom() && window.ROOM.next()) return;
    if (onTech() && window.TECH.next()) return;
    var t = gatedTrack();
    if (t) {
      var idx = Math.round(t.scrollLeft / t.clientWidth);
      if (idx < t.children.length - 1) { t.scrollBy({ left: t.clientWidth, behavior: 'smooth' }); return; }
    }
    goTo(current + 1, 1);
  }
  function prev() {
    if (onCorr() && window.CORR.prev()) return;
    if (onRoom() && window.ROOM.prev()) return;
    if (onTech() && window.TECH.prev()) return;
    var t = gatedTrack();
    if (t) {
      var idx = Math.round(t.scrollLeft / t.clientWidth);
      if (idx > 0) { t.scrollBy({ left: -t.clientWidth, behavior: 'smooth' }); return; }
    }
    goTo(current - 1, -1);
  }
  function syncInput() { hudInput.value = String(current + 1).padStart(2, '0'); }

  function render() {
    syncInput();
    if (hudSection) hudSection.textContent = sectionFor(slides[current]);
    hudFill.style.width = ((current + 1) / slides.length * 100) + '%';
    navPrev.classList.toggle('is-disabled', current === 0);
    navNext.classList.toggle('is-disabled', current === slides.length - 1);
    onSlideChange(slides[current]);
  }

  /* ================= 라이트박스 (확대 재생 · 좌우 이동 · 카운터) =================
     리포트 덱(gemini-omni-test)의 동작을 그대로 가져왔다.
     확대 재생은 항상 사운드 포함 — 슬라이드 위 미리보기는 muted, 열었을 때만 소리가 난다. */
  var GALLERY = window.GALLERY || {};
  var lb = document.getElementById('lightbox');
  var lbMedia = document.getElementById('lb-media');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var lbCount = document.getElementById('lb-count');
  var lbFill = document.getElementById('lb-fill');
  var lbCap1 = document.getElementById('lb-cap-1');
  var lbCap2 = document.getElementById('lb-cap-2');
  var lbBack = document.getElementById('lb-back');
  var lbItems = null, lbIdx = 0, lbFit = 'cover';

  function renderLB() {
    if (!lbItems || !lbMedia) return;
    var it = lbItems[lbIdx], total = lbItems.length;
    var contain = lbFit === 'contain'; // 세로 영상: contain + 양옆 여백은 같은 영상 블러
    var mainCls = contain ? 'lb-con-v' : 'lb-cov-v';
    if (it.k === 'v') {
      lbMedia.innerHTML =
        (contain ? '<video class="lb-blur-v" src="' + it.s + '" autoplay loop muted playsinline aria-hidden="true"></video>' : '')
        + '<video class="' + mainCls + '" src="' + it.s + '" autoplay loop controls playsinline></video>';
      var v = lbMedia.querySelector('.' + mainCls);
      if (v) { v.muted = false; v.volume = 1; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    } else {
      lbMedia.innerHTML = (contain ? '<div class="lb-blur"></div>' : '')
        + '<img class="' + (contain ? 'lb-con-i' : 'lb-cov-i') + '" src="' + it.s + '" alt="" />';
      var bg = lbMedia.querySelector('.lb-blur');
      if (bg) bg.style.backgroundImage = "url('" + it.s + "')";
    }
    if (lbCount) lbCount.textContent = (lbIdx + 1) + ' / ' + total;
    if (lbFill) lbFill.style.width = ((lbIdx + 1) / total * 100) + '%';
    if (lbCap1) lbCap1.textContent = it.t || '';
    if (lbCap2) lbCap2.textContent = [it.m, it.spec].filter(Boolean).join(' · ');
    if (lbPrev) lbPrev.classList.toggle('is-off', lbIdx === 0);
    if (lbNext) lbNext.classList.toggle('is-off', lbIdx === total - 1);
  }
  function openLightbox(key, idx) {
    var g = GALLERY[key]; if (!g || !lb) return;
    lbItems = g.items; lbFit = g.fit || 'cover';
    lbIdx = Math.max(0, Math.min(lbItems.length - 1, idx));
    lb.classList.add('is-open');
    renderLB();
  }
  function lbStep(dir) {
    if (!lbItems) return;
    lbIdx = Math.max(0, Math.min(lbItems.length - 1, lbIdx + dir));
    renderLB();
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('is-open');
    if (lbMedia) lbMedia.innerHTML = ''; // 소리가 계속 나지 않도록 즉시 비운다
    lbItems = null;
  }
  if (lbBack) lbBack.addEventListener('click', function (e) { e.stopPropagation(); closeLightbox(); });
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); lbStep(-1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); lbStep(1); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var z = e.target.closest('[data-gallery]');
    if (z) { e.stopPropagation(); openLightbox(z.getAttribute('data-gallery'), parseInt(z.getAttribute('data-index'), 10) || 0); }
  });

  /* ---- 키보드 ---- */
  window.addEventListener('keydown', function (e) {
    if (!booted) return;
    if (lb && lb.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); lbStep(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); lbStep(1); }
      return;
    }
    if (document.activeElement === hudInput) return;
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      /* 기록 슬라이드(.logscroll)는 세로 스크롤이 본문이므로 ↓↑를 슬라이드 이동이 아닌 스크롤에 쓴다 */
      case 'ArrowDown': case 'ArrowUp': {
        var sc = slides[current].querySelector('.logscroll');
        if (!sc) return;
        e.preventDefault();
        sc.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * Math.round(sc.clientHeight * 0.8), behavior: 'smooth' });
        break;
      }
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(slides.length - 1); break;
      default: break;
    }
  });

  navPrev.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  navNext.addEventListener('click', function (e) { e.stopPropagation(); next(); });
  /* 26p 구성 — HUD 좌측 버튼은 목차(02p)로 보낸다. 표지에서는 다음 장이 곧 목차이므로 그대로 둔다 */
  if (hudHome) hudHome.addEventListener('click', function (e) {
    e.stopPropagation();
    var tocIdx = slides.findIndex(function (s) { return s.id === 'toc'; });
    goTo(tocIdx >= 0 ? tocIdx : 0);
  });

  /* ---- 번호 입력 워프 ---- */
  function commitInput() { var n = parseInt(hudInput.value, 10); if (!isNaN(n)) goTo(n - 1); else syncInput(); }
  hudInput.addEventListener('click', function (e) { e.stopPropagation(); hudInput.select(); });
  hudInput.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); commitInput(); hudInput.blur(); }
    else if (e.key === 'Escape') { syncInput(); hudInput.blur(); }
  });
  hudInput.addEventListener('change', commitInput);

  /* ---- 목차 이동 ---- */
  document.querySelectorAll('.toc-link[data-goto]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var n = parseInt(btn.getAttribute('data-goto'), 10);
      if (!isNaN(n)) goTo(n - 1);
    });
  });

  /* ---- 종합 마퀴 2배 복제(이음새 없는 -50% 루프) ---- */
  (function buildMarquee() {
    document.querySelectorAll('.final-track').forEach(function (track) {
      track.innerHTML = track.innerHTML + track.innerHTML;
    });
  })();

  /* ---- 표지 전체화면 버튼 ---- */
  var fsBtn = document.getElementById('fsBtn');
  if (fsBtn) fsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  });
  function syncFs() {
    var on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.documentElement.classList.toggle('is-fullscreen', on);
  }
  document.addEventListener('fullscreenchange', syncFs);
  document.addEventListener('webkitfullscreenchange', syncFs);

  /* ---- 백그라운드 프리로드 ---- */
  function preloadAll() {
    var boot = document.getElementById('boot');
    function bgPreloadRest() {
      var seen = {}, list = [];
      slides.forEach(function (slide) {
        slide.querySelectorAll('img[src]').forEach(function (im) { var s = im.getAttribute('src'); if (s && !seen[s]) { seen[s] = 1; list.push(s); } });
        slide.querySelectorAll('[data-src]').forEach(function (v) { var s = v.getAttribute('data-src'); if (s && !seen[s]) { seen[s] = 1; list.push(s); } });
      });
      var isFile = location.protocol === 'file:';
      var idx = 0;
      function pump() {
        if (idx >= list.length) return;
        var u = list[idx++];
        if (isFile) {
          // file://에서는 fetch가 CORS로 차단된다 → 이미지는 Image()로 프리로드, 영상은 슬라이드별 lazy 로딩에 위임
          if (/\.(png|jpe?g|webp|gif|svg)$/i.test(u)) { var im = new Image(); im.onload = im.onerror = pump; im.src = u; }
          else { pump(); }
        } else {
          fetch(u).then(function (r) { return r.blob(); }).then(pump, pump);
        }
      }
      for (var c = 0; c < 4; c++) pump();
    }
    booted = true;
    if (boot) { boot.classList.add('is-done'); setTimeout(function () { boot.classList.add('is-hidden'); }, 700); }
    bgPreloadRest();
  }

  /* ---- 초기화 ---- */
  window.addEventListener('resize', fit);
  initMiniCarousels();
  slides[0].classList.add('is-active');
  if (hudTotal) hudTotal.textContent = String(slides.length).padStart(2, '0');
  fit();
  render();
  preloadAll();
})();
