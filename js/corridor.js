/* corridor.js — 복도 3D 시뮬레이션 (8p)

   실측 치수를 그대로 px 로 환산해 세운다. 눈대중으로 만든 그림이 아니라
   "16.2 × 2.5 × 2.428m 가 실제로 이렇게 보인다"를 확인하는 화면이다.

   시점은 계단을 막 올라온 자리에서 동쪽. 화면 우하단에 올라온 계단이 걸리고,
   2.7m 쯤 걸어 들어가면 통심 ③(구축 구간 시작)에 닿는다.
     · 좌측 = 외벽 창 (바깥)
     · 우측 = 계단실 → 교실쪽 벽 (존치 출입구 2 · 밀폐 마감 2 · 복도창)

   조명은 두 상태를 오간다.
     · 평상시  천장 형광등 점등, 바닥은 그냥 복도
     · 운영 시 형광등 소등, 천장 매립 프로젝터 10대가 바닥을 그린다

   길이 방향 좌표(a)는 카메라 출발점을 0 으로 잡는다. 바닥·천장의 안쪽 컨테이너를
   -90° 눕혀 두었으므로, 그 안에서는 left = a(길이), top = 폭이 된다.
*/
(function () {
  'use strict';

  var world = document.getElementById('corrWorld');
  if (!world) return;
  var slide = document.getElementById('corridor-sim3d');

  /* ---- 실측 → px ---- */
  var PPM = 260;
  var LEN = 16.2, WID = 2.5, HGT = 2.428;
  var EYE = 1.55;
  var P = 1500;                        // .cw-stage 의 perspective — 눈은 z=+P

  var L = LEN * PPM;                   // 4212 — 구축 구간
  var CW = WID * PPM;                  // 650
  var HW = CW / 2;                     // 325
  var FLOOR_Y = EYE * PPM;             // 403
  var CEIL_Y = FLOOR_Y - HGT * PPM;    // -228
  var YC = (FLOOR_Y + CEIL_Y) / 2, WHH = FLOOR_Y - CEIL_Y;

  var BAY = 12, BAYW = L / BAY;        // 창 베이 1.35m
  /* 계단 참 3베이(4.05m). 2베이로 줄이면 계단이 전부 눈높이 아래로 내려가
     프레임 밑으로 잘린다 — 우하단에 '걸리려면' 이 정도 앞이 필요하다. */
  var PRE = 3;
  var A0 = PRE * BAYW;                 // 1053 — 통심 ③ 의 길이좌표
  var TL = A0 + L;                     // 5265 — 모델 전체 길이

  var Z0 = 985;                        // 카메라 기준면(출발점의 근단)
  function zOf(a) { return Z0 - a; }   // 길이좌표 → world z

  var seg = [];

  function add(cls, w, h, tf, html, meta) {
    var el = document.createElement('div');
    el.className = cls;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.left = (-w / 2) + 'px';
    el.style.top = (-h / 2) + 'px';
    el.style.transform = tf;
    if (html) el.innerHTML = html;
    world.appendChild(el);
    if (meta) { meta.el = el; seg.push(meta); }
    return el;
  }

  /* ---- 우측(교실쪽) 벽 — 도면상 존치 출입구는 양 끝, 밀폐는 통심 ④ 주변 ---- */
  var RIGHT = {};
  RIGHT[0] = { t: 'door', lbl: '미술실 입구', sub: '존치' };
  RIGHT[4] = { t: 'seal', lbl: '밀폐 마감', sub: '기존 준비실 문' };
  RIGHT[6] = { t: 'seal', lbl: '밀폐 마감', sub: '기존 VR체험실 문' };
  RIGHT[10] = { t: 'door', lbl: 'VR체험실 출구', sub: '존치' };

  function bayHTML(kind) {
    if (kind === 'stair') return '<div class="cw-stair"><i></i><i></i><i></i><i></i><i></i></div>';
    if (kind === 'door') return '<div class="cw-door"><i class="cw-door__v"></i><i class="cw-door__h"></i></div>';
    if (kind === 'seal') return '<div class="cw-seal"></div>';
    return '<div class="cw-sill"></div><div class="cw-win"><i></i><i></i></div>';
  }

  /* 공중에 뜬 말풍선 라벨(미술실 입구 · 밀폐 마감 · 계단실 …)은 걷어냈다.
     복도를 걸어가며 보는 화면인데, 라벨이 벽마다 떠 있어 도면 주석처럼 읽혔다.
     어느 문이 존치이고 어디가 마감인지는 04p 도면과 우상단 제원이 들고 있다. */

  /* 계단 참 3베이 + 구축 구간 12베이 */
  for (var i = -PRE; i < BAY; i++) {
    var z = zOf(A0 + (i + 0.5) * BAYW);
    add('cw cw--l', BAYW, WHH,
      'translate3d(' + (-HW) + 'px,' + YC + 'px,' + z + 'px) rotateY(90deg)',
      bayHTML('win'), { z: z });

    /* 계단 참 구간(i<0)의 우측은 벽이 아니라 계단실로 열린 개구다.
       벽을 세우면 '옆에 딴 방이 있다'로 읽히고, 계단을 올라온 느낌이 나지 않는다. */
    if (i < 0) continue;
    var info = RIGHT[i];
    add('cw cw--r' + (info ? ' cw--' + info.t : ''), BAYW, WHH,
      'translate3d(' + HW + 'px,' + YC + 'px,' + z + 'px) rotateY(-90deg)',
      bayHTML(info ? info.t : 'win'), { z: z });
  }

  /* ---- 올라온 계단 ----
     계단실을 옆방으로 그리는 대신, 방금 올라온 계단을 우하단 전경에 둔다.
     트레드 300 · 챌판 180mm. 챌판은 복도 쪽(-x)을 보므로 카메라에 정면으로 잡힌다. */
  var ST = 9, TRD = 0.30 * PPM, RIS = 0.18 * PPM;
  var stZ = zOf(A0 * 0.5), stD = A0;
  for (var t = 0; t < ST; t++) {
    var sx = HW + t * TRD, sy = FLOOR_Y + t * RIS;
    add('cw-tread', TRD, stD,
      'translate3d(' + (sx + TRD / 2) + 'px,' + sy + 'px,' + stZ + 'px) rotateX(90deg)',
      '', { z: stZ });
    if (t) add('cw-riser', stD, RIS,
      'translate3d(' + sx + 'px,' + (sy - RIS / 2) + 'px,' + stZ + 'px) rotateY(-90deg)',
      '', { z: stZ });
  }
  /* 계단실 안쪽 끝 — 열린 채 두면 검은 구멍이 된다 */
  add('cw-stwall', stD, WHH * 1.6,
    'translate3d(' + (HW + ST * TRD) + 'px,' + (YC + 120) + 'px,' + stZ + 'px) rotateY(-90deg)',
    '', { z: stZ });
  /* 난간 */
  add('cw-rail', stD, 12,
    'translate3d(' + (HW + 40) + 'px,' + (FLOOR_Y - 1.05 * PPM) + 'px,' + stZ + 'px) rotateY(-90deg)',
    '', { z: stZ });

  /* ---- 바닥 ---- */
  var zc = zOf(TL / 2);
  /* 바닥을 남김없이 덮는 것이 구축 기준이다(삐져나오는 부분은 와핑).
     근단 유효폭 2,167 로 좁혀 그리면 양옆이 빈 것처럼 읽힌다. */
  var BANDW = CW;
  var floorEl = add('cw-floor', CW, TL,
    'translate3d(0,' + FLOOR_Y + 'px,' + zc + 'px) rotateX(90deg)',
    '<div class="cw-fx" style="width:' + TL + 'px;height:' + CW + 'px"></div>');
  var fx = floorEl.querySelector('.cw-fx');

  /* 바닥 콘텐츠는 make_floor_plates.py 로 같은 이름에 덮어쓴다 — 캐시가 옛 그림을
     붙들고 있어 「분명 고쳤는데 그대로」가 된다. 재생성할 때 이 숫자를 올릴 것.
     (7p 타일도 index.html 에서 같은 ?v= 를 달고 있다) */
  var FV = '?v=3';

  /* 투사 밴드는 구축 구간에만 깔린다 (계단실 구간은 그냥 바닥) */
  var bandHtml = '<div class="cw-band" style="left:' + A0 + 'px;width:' + L +
    'px;top:' + ((CW - BANDW) / 2) + 'px;height:' + BANDW + 'px">' +
    '<img id="corrFloorImg" src="assets/img/floor/f01-base.jpg' + FV + '" alt="" /></div>';

  /* ---- 프로젝터 10대 · 투사 발자국 · 18% 블렌딩 ----
     경사 32° · 렌즈고 2,380 기준(tools/projector_sim.py):
     단위 커버 1,937mm · 근단 폭 2,167 · 피치 1,592mm · 중첩 345mm(18%). */
  /* 발자국·18% 중첩 띠·LiDAR 부채꼴 오버레이는 걷어냈다 — 토글 세 개가 화면을
     설명 도표로 만들었고, 이 슬라이드가 보여줄 것은 "실제로 이렇게 보인다"다.
     수치 근거는 6p 와 tools/projector_sim.py 에 남아 있다. */
  var N = 10, PITCH = 1.592, SEGL = 1.937;
  /* 실제로는 경사 투사라 천장 개구가 발자국보다 1.66m 뒤에 온다(오프셋 689 + 커버 절반).
     그런데 빛기둥은 수직 사다리꼴로 세워 두었으니, 개구를 뒤로 물리면 화면에서는
     "엉뚱한 데서 나온 빛"으로만 읽힌다. 여기서는 개구를 콘 바로 위에 맞춘다 —
     실제 기하는 5p 배치 도해(tools/make_system_plan.py)가 오프셋까지 그대로 그린다. */
  var coneZ = [], pjA = [];
  for (var p = 0; p < N; p++) {
    var mid = A0 + (p * PITCH + SEGL / 2) * PPM;
    pjA.push(mid);
    coneZ.push(zOf(mid));
  }

  fx.innerHTML = bandHtml;

  /* ---- 구축 범위 끝(통심 ⑤) ---- */
  add('cw-end', CW, WHH, 'translate3d(0,' + YC + 'px,' + zOf(TL) + 'px)',
    '<span>구축 범위 끝 · 통심 ⑤<br /><i>16,200mm</i></span>', { z: zOf(TL) });

  /* ---- 천장 ----
     형광등 · 프로젝터 본체 · LiDAR 원까지 전부 걷어내 민 천장으로 둔다.
     빛기둥이 이미 프로젝터 위치를 말하고, 기구를 그려 넣으면 어느 배치든
     콘과 화면에서 겹친다 — 콘이 천장에서 바닥까지 내려오는 삼각형이라
     길이로 띄우든 좌우로 벌리든 깊이가 다른 콘의 몸통 위에 얹힌다. */
  add('cw-ceil', CW, TL, 'translate3d(0,' + CEIL_Y + 'px,' + zc + 'px) rotateX(-90deg)', '');

  /* ---- 투사 콘 ----
     복도를 정면으로 보는 시점이라 복도 축과 나란한 면은 날이 서서 안 보인다.
     폭 방향 면(카메라 정면)에 사다리꼴로 세워 빛줄기처럼 읽히게 한다. */
  coneZ.forEach(function (cz) {
    add('cw-cone', 3.10 * PPM, WHH, 'translate3d(0,' + YC + 'px,' + cz + 'px)', '',
      { z: cz, cone: 1 });
  });

  /* ---- 카메라 ---- */
  var STEP = BAYW, MAX = TL - BAYW * 2, cam = 0;
  var posEl = document.getElementById('corrPos');
  var posUnit = document.getElementById('corrUnit');

  function apply() {
    world.style.transform = 'translateZ(' + cam + 'px)';
    seg.forEach(function (s) {
      var d = s.z + cam, o;
      if (s.cone) {
        /* 콘은 복도 한가운데라 가까워지면 화면을 덮는다 — 일찍 걷어낸다 */
        o = d > 1250 ? 0 : (d > 900 ? 1 - (d - 900) / 350 : 1);
      } else {
        /* 벽·라벨은 x=±325 라 가까워질수록 화면 밖으로 밀려난다. 일찍 지우면
           아직 보이는 벽이 꺼지는 것처럼 읽히므로 렌즈 코앞까지 남긴다.
           단 베이 근단(z+175)이 눈(z=P)을 넘으면 뒤집혀 그려지니 그 전에 끊는다. */
        o = d > 1280 ? 0 : (d > 1200 ? 1 - (d - 1200) / 80 : 1);
      }
      if (s.lbl && o) {
        if (Z0 - d > s.near) o = 0;
        else if (Math.abs(s.lx * P / (P - d)) > 700) o = 0;
      }
      if (s.cone) s.el.style.opacity = o ? '' : '0';
      else s.el.style.opacity = String(o);
    });
    /* 거리는 통심 ③(구축 시작) 기준. 계단실 구간에서는 숫자 대신 위치를 쓴다. */
    if (posEl) {
      var m = (cam - A0) / PPM;
      if (m < -0.05) { posEl.textContent = '계단실'; if (posUnit) posUnit.style.display = 'none'; }
      else { posEl.textContent = m.toFixed(1); if (posUnit) posUnit.style.display = ''; }
    }
  }
  apply();

  var lock = 0;
  slide.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.timeStamp - lock < 240) return;
    lock = e.timeStamp;
    cam = e.deltaY < 0 ? Math.min(MAX, cam + STEP) : Math.max(0, cam - STEP);
    apply();
  }, { passive: false });

  /* 복도를 끝까지 걸어야 넘어가던 잠금은 없다 — ← → 와 좌우 버튼은 언제든 슬라이드를 넘긴다. */

  /* ---- 바닥 콘텐츠 · 조명 모드 ---- */
  /* data-floor 가 비면 「00 · 없음」 — 콘텐츠를 끈 맨 바닥이 어떻게 보이는지가
     기준선이라, 이게 있어야 나머지 4종이 얼마나 바뀌는지 읽힌다.

     투사 콘은 흰 빛기둥이 아니라 지금 쏘고 있는 콘텐츠의 색을 띤다 — 실제로도
     램프가 아니라 화면이 광원이다. 콘텐츠별 대표색을 콘에 물려 준다.
     「없음」은 무신호(검은 화면)라 아주 옅은 중성광만 남긴다. */
  var CONE = {
    '': '236,238,244',
    'f01-base': '255,214,158',      // 빛의 결 — 앰버
    'f02-text': '166,255,206',      // 데이터 스트림 — 그린
    'f03-image': '218,196,255',     // 키캡 그리드 — 라벤더
    'f04-art': '176,206,255'        // 파티클 명화 — 블루
  };
  var img = document.getElementById('corrFloorImg');

  /* 조명 토글은 없앴다 — 바닥 콘텐츠 선택이 곧 조명 상태다.
       「00 · 없음」  프로젝터가 꺼진 평상시 복도 → 공간을 밝히고 빛기둥도 끈다
       나머지 4종    운영 중 → 소등된 복도에 빛기둥과 바닥 콘텐츠
     상태가 둘로 갈리는 것을 버튼 두 벌로 나눠 두니 조합만 늘고 뜻은 같았다. */
  function setFloor(b) {
    slide.querySelectorAll('.cw-fbtn').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    var f = b.dataset.floor;
    img.style.display = f ? '' : 'none';
    if (f) img.src = 'assets/img/floor/' + f + '.jpg' + FV;
    slide.style.setProperty('--cone', CONE[f] || CONE['']);
    slide.classList.toggle('is-lit', !f);
    slide.classList.toggle('fx-cone', !!f);
  }
  slide.querySelectorAll('.cw-fbtn').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); setFloor(b); });
  });
  setFloor(slide.querySelector('.cw-fbtn.is-on'));
})();
