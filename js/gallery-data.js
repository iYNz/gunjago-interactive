/* gallery-data.js — 라이트박스 확대 대상
   deck.js 는 [data-gallery="키"][data-index="N"] 클릭 시 window.GALLERY[키].items[N] 를 연다.
   k: 'v' 영상 · 'i' 이미지 / fit: 'cover' | 'contain'
   ── 현재는 플레이스홀더 이미지가 들어가 있다. AI 생성 에셋이 나오면 s 경로만 갈아끼운다. */
window.GALLERY = {

  /* 09p · IMW 8종 (자사 보유) — 순서는 보유 콘텐츠 원 순번(imw1~8)을 따른다 */
  imw: {
    fit: 'cover',
    items: [
      { k: 'v', s: 'assets/video/imw1.webm', t: '디지털 앨범 · 명화', m: '양손 동작으로 넘기는 갤러리', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw3.webm', t: '아나몰픽 · 가로형', m: '사람을 따라오는 가로형 배너', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw2.webm', t: '아나몰픽 · 세로형', m: '위치를 인식해 등장하는 세로 배너', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw4.webm', t: '아나몰픽 · 기본형', m: '파티클 · 컬러 자유 설정', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw5.webm', t: '디지털 플루이드', m: '움직임에 결이 바뀌는 유체 아트', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw6.webm', t: '디지털 앨범 · 학교', m: '학교 정보를 담은 디지털 갤러리', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw7.webm', t: '디지털 앨범 · 그리드', m: '여러 정보를 한눈에 펼치는 그리드', spec: 'IMW 보유 콘텐츠' },
      { k: 'v', s: 'assets/video/imw8.webm', t: '에코 스페이스', m: '공간 반응형 앰비언트', spec: 'IMW 보유 콘텐츠' }
    ]
  },

  /* 02p · 도면 2매 — 축소 표시라 치수가 안 읽힌다. 클릭하면 원본 크기로 연다. */
  plan: {
    fit: 'contain',
    items: [
      { k: 'i', s: 'assets/img/plan-original.png', t: '제공받은 원본 도면',
        m: '3층 평면 · 통심 ③~⑤ 구간이 구축 범위', spec: '학교 제공' },
      { k: 'i', s: 'assets/img/scope-plan.png', t: '구축 범위 도면',
        m: '칸막이 제거 후 단일 공간 · 바닥 프로젝션 + LED 미디어월 구역', spec: '실측 기반' }
    ]
  },

  /* 03p · 장비 배치 도해 (tools/make_system_plan.py) */
  sysplan: {
    fit: 'contain',
    items: [
      { k: 'i', s: 'assets/img/system-plan.png', t: '장비 배치 도해',
        m: '프로젝터 10대 · 엣지 블렌딩 18% · LiDAR 3대 · LED 미디어월 · 과 부스 5개소',
        spec: '통심 ③~⑤' }
    ]
  }

  /* storyboard · led · scope · booth* 갤러리는 해당 슬라이드가 빠지면서 같이 걷어냈다. */
};
