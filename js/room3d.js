/* room3d.js — 통합 교실 3D 시뮬레이션 (9p)

   입구에서 한 바퀴 도는 관람 동선을 그대로 따라간다.
   자유 시점은 방향을 잃기 쉬워, 볼 자리를 미리 잡아 두고 순서대로 보여준다.
     · 휠 업 / 아래 버튼 → 다음 지점, 휠 다운 → 이전 지점
     · ← → 는 슬라이드 이동 (여기서 잡아두지 않는다)

   동선 : 미술실 입구 → 부스 01 → 부스 02 → 부스 03 → 미디어월
          → 출구 → 부스 04 → 부스 05 → 입구 방향
   부스 번호는 이 동선 순서다. 도면상 위치가 아니라 걷는 순서로 매겨야
   하단 버튼(02 부스 01 …)을 따라가는 사람이 헷갈리지 않는다.

   좌표 — 원점은 방 중앙 바닥
     x  +북(복도쪽 · 출입구 2 · 부스 04·05)   −남(외벽 · 부스 02·03)
     z  −서(입구쪽 단변 · 부스 01)            +동(단변 · LED 미디어월)
     y  −위(천장)
*/
(function () {
  'use strict';

  var world = document.getElementById('roomWorld');
  if (!world) return;
  var slide = document.getElementById('room-sim3d');

  var PPM = 260;
  var LEN = 16.2, WID = 8.4, HGT = 2.9;
  var P = 1500;

  var HL = LEN * PPM / 2;                    // 2106 — 동서 반길이
  var HW = WID * PPM / 2;                    // 1092 — 남북 반폭
  var CE = -HGT * PPM;                       // -754 (바닥 y=0)
  var WH = -CE, YC = CE / 2;

  var items = [];

  function add(cls, w, h, tf, html, x, z) {
    var el = document.createElement('div');
    el.className = cls;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.left = (-w / 2) + 'px';
    el.style.top = (-h / 2) + 'px';
    el.style.transform = tf;
    if (html) el.innerHTML = html;
    world.appendChild(el);
    items.push({ el: el, x: x || 0, z: z || 0 });
    return el;
  }

  /* ---- 입체 상자 ----
     면 하나짜리 판을 벽에 붙이면 아무리 밝게 칠해도 스티커처럼 보인다.
     앞면 + 양 옆면 + 윗면을 세워 두께를 만든다.
     각 면은 상자 중심 기준 좌표로 놓고, transform-origin(요소 중앙)에서 회전시킨다. */
  function face(w, h, cx, cy, cz, rot, cls, html) {
    return '<i class="' + cls + '" style="width:' + w + 'px;height:' + h + 'px;transform:' +
      'translate3d(' + (cx - w / 2) + 'px,' + (cy - h / 2) + 'px,' + cz + 'px)' +
      (rot || '') + '">' + (html || '') + '</i>';
  }
  function box(w, h, d, x, y, z, cls, html, attr) {
    var hw = w / 2, hh = h / 2, hd = d / 2;
    return '<div class="bx ' + (cls || '') + '"' + (attr || '') + ' style="transform:translate3d(' +
      x + 'px,' + y + 'px,' + z + 'px)">' +
      face(w, h, 0, 0, hd, '', 'bx__f', html) +
      face(d, h, -hw, 0, 0, ' rotateY(-90deg)', 'bx__s') +
      face(d, h, hw, 0, 0, ' rotateY(90deg)', 'bx__s') +
      face(w, d, 0, -hh, 0, ' rotateX(90deg)', 'bx__t') +
      /* 밑면. 지정 지점에서는 눈높이가 기기 높이 안쪽이라 잘 안 보이지만,
         전환 중 월드가 도는 동안 사선으로 걸린다 — 그때 뚫린 상자로 보이면 안 된다. */
      face(w, d, 0, hh, 0, ' rotateX(-90deg)', 'bx__b') +
      '</div>';
  }

  /* ---- 바닥 · 천장 ---- */
  add('rm-floor', WID * PPM, LEN * PPM, 'translate3d(0,0,0) rotateX(90deg)');
  add('rm-ceil', WID * PPM, LEN * PPM, 'translate3d(0,' + CE + 'px,0) rotateX(-90deg)');

  /* ---- 동측 단변 : LED 인터랙티브 미디어월 4,000 × 2,500 ----
     입구(서측)에서 가장 먼 벽. 둘러보다 마지막에 만나게 둔다.
     보유 콘텐츠 8종이 16:10 으로 제작돼 있어 화면도 16:10 으로 맞춘다 — 리마스터
     없이 그대로 얹힌다. 500각 캐비닛으로 16:10 이 정수로 떨어지는 조합은
     8 × 5 = 4,000 × 2,500 뿐이고, 천장 2,900 안에서 이게 최대다.
     y=0 은 벽 중앙 — 화면 2,500 이라 위아래 200mm 씩 균등하게 남는다. */
  add('rm-wall rm-wall--e', WID * PPM, WH,
    'translate3d(0,' + YC + 'px,' + HL + 'px) rotateY(180deg)',
    /* 캐비닛 340mm 두께를 그대로 살려 벽에서 튀어나오게 둔다. 벽면(z=0) 기준
       앞으로 밀어야 옆면이 보이고, 뒤에 그림자를 깔아야 떠 있는 게 읽힌다. */
    wallShadow(4 * PPM, 2.5 * PPM, 0, 0) +
    box(4 * PPM, 2.5 * PPM, 0.34 * PPM, 0, 0, 0.17 * PPM + 6, 'bx--led',
      '<img class="bx__img" src="assets/img/led/imw-hero.jpg" alt="" />', zoom(3)),
    0, HL).dataset.solid = '1';   // 입체 상자를 품은 면 — opacity 로 페이드하면 납작해진다

  /* ---- 서측 단변 : 입구 정면 벽 — 과 부스 01 이 붙는다 ---- */
  add('rm-wall rm-wall--w', WID * PPM, WH,
    'translate3d(0,' + YC + 'px,' + (-HL) + 'px)', '', 0, -HL);

  /* ---- 남북 장변 ---- */
  var BAY = 12, BW = LEN * PPM / BAY;
  for (var i = 0; i < BAY; i++) {
    var z = -HL + (i + 0.5) * BW;
    var door = (i === 0 || i === 10);        // 도면상 양 끝 존치 출입구
    add('rm-wall rm-wall--n', BW, WH,
      'translate3d(' + HW + 'px,' + YC + 'px,' + z + 'px) rotateY(-90deg)',
      door ? '<div class="rm-door"><i></i></div>'
           : '<div class="rm-sill"></div><div class="rm-win rm-win--in"><i></i><i></i></div>',
      HW, z);
    add('rm-wall rm-wall--s', BW, WH,
      'translate3d(' + (-HW) + 'px,' + YC + 'px,' + z + 'px) rotateY(90deg)',
      '<div class="rm-sill"></div><div class="rm-win"><i></i><i></i></div>', -HW, z);
  }

  /* ---- 과 부스 5개소 ----
     세로 LED 600×2,400×120 · 65″ TV 1,439×809×90 · 카운터 1,600×900×600.
     태블릿은 카운터 상판 앞쪽 경사 하우징에 눕는다(레퍼런스 1·2.jpg). */
  /* 관람 순서대로 01~05. 서측 벽 부스 01 은 벽 중앙에 둔다 —
     벽 끝으로 밀면 미술실 입구에서 너무 멀어 보인다. */
  var BOOTHS = [
    { n: '01', side: 'w', z: 0, x: 0 },
    { n: '02', side: 's', z: -700 },
    { n: '03', side: 's', z: 900 },
    { n: '04', side: 'n', z: 900 },
    { n: '05', side: 'n', z: -700 }
  ];
  var BWD = 3.0 * PPM, FL = WH / 2;          // 부스 판 폭 · 바닥선(로컬 y)

  /* 화면 면에는 글씨를 얹지 않는다 — 목업 이미지를 가려 버린다.
     스펙은 전부 하단 자막(SPOTS[].c)으로 뺐다.

     지금은 디지털전기과 한 세트만 시안이 나와 있어 5개 부스에 같은 그림을 물린다.
     "5개 과가 완전히 같은 무대"가 이 공간의 전제라 오히려 그 메시지에 맞는다 —
     과별 시안이 나오면 부스 번호로 갈라 끼우면 된다.

     태블릿은 TV 를 미러링하지만 갤럭시탭이 16:10 이라 16:9 를 그대로 쓰면 잘린다.
     같은 화면을 16:10 으로 다시 잡은 파일을 따로 쓴다. */
  var SHOT = {
    v: 'assets/img/booth/vled-01_1.jpg',            // 세로 LED  1:4
    t: 'assets/img/booth/tv-01-elec.jpg',           // 65″ TV    16:9
    p: 'assets/img/booth/tablet-01-elec-w.jpg'      // 태블릿    16:10
  };

  function screen(src) {
    return src ? '<img class="bx__img" src="' + src + '" alt="" />' : '';
  }

  /* 3D 안에서는 화면이 작고 비스듬해 내용이 안 읽힌다 — 클릭하면 원본으로 연다.
     deck.js 라이트박스가 [data-gallery][data-index] 를 잡으므로 상자에 그대로 얹는다. */
  function zoom(i) {
    return ' data-no-advance data-gallery="booth" data-index="' + i + '"';
  }

  /* 벽면에 지는 그림자. 기기보다 조금 크게 잡고 아래로 내려 광원이 위에 있다는
     전제를 맞춘다. 벽(z=0) 바로 앞 2px 에 눕혀 기기 뒤로 깔린다. */
  function wallShadow(w, h, x, y) {
    var sw = w + 34, sh = h + 34;
    return '<i class="rm-shadow" style="width:' + sw + 'px;height:' + sh + 'px;transform:translate3d(' +
      (x - sw / 2) + 'px,' + (y - sh / 2 + 12) + 'px,2px)"></i>';
  }

  function boothHTML(n) {
    /* 두께를 실제 캐비닛 값으로 올리고 벽에서 살짝 띄운다. 얇게 붙여 두면
       옆면이 1px 로 뭉개져 벽에 인쇄된 그림처럼 읽힌다. */
    var vw = 0.6 * PPM, vh = 2.4 * PPM, vd = 0.16 * PPM;      // 세로 LED 캐비닛 160mm
    var tw = 1.439 * PPM, th = 0.809 * PPM, td = 0.13 * PPM;  // 65″ 16:9 · 패널+브라켓 130mm
    var cw = 1.6 * PPM, ch = 0.9 * PPM, cd = 0.6 * PPM;
    var OFF = 8;                                              // 벽 ↔ 기기 배면 30mm
    /* 카운터를 벽에서 800mm 띄운다. 벽에 바싹 붙이면 태블릿을 조작하는 사람 머리
       바로 위에 TV 가 걸려 부담스럽다 — 사람이 설 자리를 먼저 비워 둔다. */
    var GAP = 0.8 * PPM, cz = GAP + cd / 2;
    var lx = -BWD / 2 + 40 + vw / 2, rx = BWD / 2 - 60 - cw / 2;
    /* 부스 카메라는 전부 벽을 정면으로 본다 — 그 각도에서는 옆면이 거의 안 보여
       두께를 늘려도 판때기로 읽힌다. 벽에 지는 그림자가 정면에서 유일하게
       "떠 있다"를 말해 주는 단서다. */
    var vy = FL - 39 - vh / 2, ty = FL - 330 - th / 2;
    return '<div class="rm-booth__no">' + n + '</div>' +
      wallShadow(vw, vh, lx, vy) + wallShadow(tw, th, rx, ty) +
      box(vw, vh, vd, lx, vy, vd / 2 + OFF, 'bx--vled', screen(SHOT.v), zoom(0)) +
      box(tw, th, td, rx, ty, td / 2 + OFF, 'bx--tv', screen(SHOT.t), zoom(1)) +
      box(cw, ch, cd, rx, FL - ch / 2, cz, 'bx--desk', '') +
      /* 경사 하우징에 눕는 태블릿. 판 한 장이면 옆에서 종잇장이 되므로 얇은 상자로
         세운다 — 갤럭시탭 12.4″ 는 16:10, 두께 6mm 에 하우징 테두리가 더 붙는다.
         상자를 눕히는 회전은 바깥 래퍼가 맡고, 안쪽 box() 는 로컬 원점에 둔다. */
      '<i class="rm-tab" style="transform:translate3d(' + rx + 'px,' +
      (FL - ch - 8) + 'px,' + (cz + 40) + 'px) rotateX(58deg)">' +
      box(84, 52, 9, 0, 0, 0, 'bx--tab', screen(SHOT.p), zoom(2)) + '</i>';
  }

  BOOTHS.forEach(function (b) {
    var tf, bx, bz;
    if (b.side === 'w') { bx = b.x; bz = -HL + 8;
      tf = 'translate3d(' + bx + 'px,' + YC + 'px,' + bz + 'px)'; }
    else {
      var sg = b.side === 'n' ? 1 : -1;
      bx = sg * (HW - 8); bz = b.z;
      tf = 'translate3d(' + bx + 'px,' + YC + 'px,' + bz + 'px) rotateY(' + (-90 * sg) + 'deg)';
    }
    add('rm-booth', BWD, WH, tf, boothHTML(b.n), bx, bz).dataset.solid = '1';
  });

  /* ---- 카메라 : 입구에서 한 바퀴 ----
     aim 이 있으면 그 지점을 정면에 두고, 없으면 a 를 그대로 쓴다. */
  function lookAt(cx, cz, tx, tz) { return Math.atan2(tx - cx, -(tz - cz)) * 180 / Math.PI; }
  /* c = 하단 자막. 화면 면에 얹던 스펙을 여기로 옮겼다 — 목업 위에 글씨가 없어야
     실제로 어떻게 보일지가 판단된다.
     지점마다 길이가 달라 한 줄↔두 줄로 바뀌면 자막 상자가 들썩인다. 1행 스펙 /
     2행 단서로 나눠 전 지점을 2줄로 고정한다(자막이 없는 지점은 상자째 숨긴다). */
  function at(k, d, x, z, tx, tz, e, c1, c2) {
    return { k: k, d: d, x: x, z: z, a: lookAt(x, z, tx, tz), e: e || 1.65,
             c: c1 ? [c1, c2 || ''] : null };
  }
  var BOOTH_CAP = '세로형 LED 600 × 2,400 · 65″ TV · 카운터 하우징 태블릿 (TV 미러링)';
  /* 다섯 부스에 같은 디지털전기과 시안이 들어가 있다 — 보는 사람이 "다 같은 과인가"
     하지 않도록 자막에서 먼저 밝힌다. */
  var BOOTH_NOTE = '화면은 디지털전기과 시안 — 실제로는 해당 과에 맞춰 교체됩니다';
  var DOOR = { x: HW, z: -HL + 0.5 * BW };          // 미술실 입구(북측 벽 서쪽 끝)
  var EXIT = { x: HW, z: -HL + 10.5 * BW };         // 출구(북측 벽 동쪽)
  var SPOTS = [
    at('미술실 입구', '문 열었을 때', 820, -1790, 60, -1200, 1.70,
      '통합 교실 16,200 × 8,400mm · 약 136㎡',
      '기존 특별교실 3실(미술실 · 준비실 · VR체험실) 칸막이를 제거해 하나로 씁니다'),
    at('과 부스 01', '입구 정면 · 서측 벽', 0, -700, 0, -HL, 1.62, BOOTH_CAP, BOOTH_NOTE),
    at('과 부스 02', '외벽쪽 · 서측', 400, -700, -HW, -700, 1.62, BOOTH_CAP, BOOTH_NOTE),
    at('과 부스 03', '외벽쪽 · 동측', 400, 900, -HW, 900, 1.62, BOOTH_CAP, BOOTH_NOTE),
    at('인터랙티브 미디어월', '동측 단변 전면', 0, -400, 0, HL, 1.65,
      'P2.5 · 4,000 × 2,500mm · 16:10 · 1,600 × 1,000px · 500각 40장 · 10㎡',
      '화면은 예시 — 실적용 시 군자디지털과학고등학교 로고로 교체됩니다'),
    at('출구', '북측 벽 · 동쪽 출입구', -300, EXIT.z, EXIT.x, EXIT.z, 1.65,
      '도면상 존치 출입구 2개소 — 서측 입구 · 동측 출구',
      '중앙부 출입문 2개소는 벽체로 마감합니다'),
    at('과 부스 04', '복도쪽 · 동측', -400, 900, HW, 900, 1.62, BOOTH_CAP, BOOTH_NOTE),
    at('과 부스 05', '복도쪽 · 서측', -400, -700, HW, -700, 1.62, BOOTH_CAP, BOOTH_NOTE),
    /* 마지막 뷰는 돌아본 컷이라 덧붙일 스펙이 없다 — 자막 없이 둔다 */
    at('입구 방향', '교실 안에서 미술실 입구', -250, -500, DOOR.x, DOOR.z, 1.68)
  ];
  var vi = 0;
  var kEl = document.getElementById('roomViewK');
  var dEl = document.getElementById('roomViewD');
  var nEl = document.getElementById('roomViewN');
  var cEl = document.getElementById('roomViewC');

  /* rotateY 는 숫자 그대로 보간된다. 부스 04(-90°) → 미디어월(180°) 처럼
     그냥 대입하면 +270° 를 돌아 오른쪽으로 크게 도는데, 실제로는 왼쪽으로 90° 만
     틀면 되는 자리다. 현재 각도에 가장 가까운 등가각(±360°)으로 바꿔 최단 회전시킨다. */
  var curA = SPOTS[0].a;
  function shortest(target) {
    return target + 360 * Math.round((curA - target) / 360);
  }

  function apply() {
    var v = SPOTS[vi];
    curA = shortest(v.a);
    var rad = v.a * Math.PI / 180, sn = Math.sin(rad), cs = Math.cos(rad);
    world.style.transform =
      'translateZ(' + P + 'px) rotateY(' + curA + 'deg) ' +
      'translate3d(' + (-v.x) + 'px,' + (v.e * PPM) + 'px,' + (-v.z) + 'px)';
    items.forEach(function (it) {
      var dx = it.x - v.x, dz = it.z - v.z;
      var zv = -dx * sn + dz * cs + P;
      var o = zv > 1330 ? 0 : (zv > 1080 ? 1 - (zv - 1080) / 250 : 1);
      /* opacity 가 1 미만이면 CSS 가 preserve-3d 를 flat 으로 강등한다(그루핑 속성).
         부스처럼 안에 입체 상자를 품은 덩어리는 그 순간 납작하게 무너져,
         전환할 때마다 「평면이었다가 3D 로 돌아오는」 것처럼 보였다.
         페이드가 걸리는 구간은 카메라 옆·뒤(화면 밖)라 켜고 끄기로 충분하다. */
      if (it.el.dataset.solid) o = o < 0.5 ? 0 : 1;
      it.el.style.opacity = String(o);
    });
    if (kEl) kEl.textContent = v.k;
    if (dEl) dEl.textContent = v.d;
    if (nEl) nEl.textContent = ('0' + (vi + 1)).slice(-2);
    if (cEl) {
      if (v.c) { cEl.innerHTML = v.c[0] + '<br />' + v.c[1]; cEl.style.opacity = ''; }
      else { cEl.style.opacity = '0'; }
    }
    slide.querySelectorAll('.rm-vbtn').forEach(function (b, j) { b.classList.toggle('is-on', j === vi); });
  }
  apply();

  slide.querySelectorAll('.rm-vbtn').forEach(function (b, i) {
    b.addEventListener('click', function (e) { e.stopPropagation(); vi = i; apply(); });
  });

  /* 휠 아래로 = 다음 지점. 문서를 아래로 내리듯 동선을 따라간다
     (07p 복도는 휠 위로 = 전진 — 그쪽은 카메라가 앞으로 나가는 동작이라 방향이 반대다). */
  var lock = 0;
  slide.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.timeStamp - lock < 300) return;
    lock = e.timeStamp;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  function step(d) {
    var nx = vi + d;
    if (nx < 0 || nx > SPOTS.length - 1) return false;   // 끝 — 슬라이드로 넘긴다
    vi = nx; apply();
    return true;
  }

  /* deck.js 가 ← → · Space 를 넘기기 전에 물어본다. 9지점을 다 보기 전에는
     슬라이드가 넘어가지 않고, 되돌아갈 때도 마찬가지로 처음까지 되짚는다.
     들어오는 방향에 따라 시작 지점이 다르다 — 뒤에서 오면 마지막 컷부터. */
  window.ROOM = {
    next: function () { return step(1); },
    prev: function () { return step(-1); },
    reset: function (fromEnd) { vi = fromEnd ? SPOTS.length - 1 : 0; apply(); }
  };
})();
