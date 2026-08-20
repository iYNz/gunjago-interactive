/* imw-hover.js — 13p 기본 내장 콘텐츠 8종
   8개를 동시에 재생하면 원본 영상이라 부하가 크고, 무엇을 보라는 건지도 흩어진다.
   기본은 첫 프레임 썸네일(poster)이고, 마우스를 올린 하나만 재생한다.
   벗어나면 되감아 멈추므로 다시 첫 프레임으로 돌아간다. */
(function () {
  'use strict';

  var tiles = document.querySelectorAll('#room-imw .base-tile');
  if (!tiles.length) return;

  function play(v) {
    if (!v) return;
    if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function stop(v) {
    if (!v) return;
    v.pause();
    /* src 를 지우지 않는다 — 두 번째 호버부터 즉시 재생된다.
       currentTime 0 이면 poster 와 같은 프레임이라 정지 화면이 자연스럽게 이어진다. */
    try { v.currentTime = 0; } catch (e) {}
  }

  tiles.forEach(function (t) {
    var v = t.querySelector('video');
    if (!v) return;
    t.addEventListener('mouseenter', function () { t.classList.add('is-playing'); play(v); });
    t.addEventListener('mouseleave', function () { t.classList.remove('is-playing'); stop(v); });
    /* 발표 중 슬라이드를 벗어나면 소리·부하가 남지 않게 한다 */
    v.addEventListener('ended', function () { v.currentTime = 0; play(v); });
  });

  /* 슬라이드 이탈 시 전부 정지 — deck.js 의 unloadSlide 는 src 를 지우므로
     poster 가 다시 보이도록 여기서 되감기만 해 둔다. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) tiles.forEach(function (t) { stop(t.querySelector('video')); });
  });
})();
