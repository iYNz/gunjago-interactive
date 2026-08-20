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
      { k: 'i', s: 'assets/img/plan-original.png?v=3', t: '제공받은 원본 도면',
        m: '3층 평면 · 통심 ③~⑤ 구간이 구축 범위', spec: '학교 제공' },
      { k: 'i', s: 'assets/img/scope-plan.png', t: '구축 범위 도면',
        m: '칸막이 제거 후 단일 공간 · 바닥 프로젝션 + LED 미디어월 구역', spec: '실측 기반' }
    ]
  },

  /* 04p · 바닥 콘텐츠 4종 — 타일이 작아 결이 안 보인다. 클릭하면 원본으로 연다.
     16,200 × 2,500(6.48:1) 통짜라 cover 로 채우면 3분의 2가 잘린다 — contain 으로 전폭을 보인다. */
  floor: {
    fit: 'contain',
    items: [
      { k: 'i', s: 'assets/img/floor/f01-base.jpg?v=3', t: '01 · 빛의 결',
        m: '발밑에서 빛의 결이 열리고 지나간 자리에 잔상이 남습니다', spec: '기본 · 상시 운영' },
      { k: 'i', s: 'assets/img/floor/f02-text.jpg?v=3', t: '02 · 데이터 스트림',
        m: '흐르는 텍스트를 학교가 원하는 문구로 — 교훈 · 학과명 · 행사 안내', spec: '커스터마이징 · 문구 교체' },
      { k: 'i', s: 'assets/img/floor/f03-image.jpg?v=3', t: '03 · 키캡 그리드',
        m: '키캡 이미지를 학생 작품 · 과별 아이콘으로 교체 · 눌림 · 회전 반응', spec: '커스터마이징 · 이미지 교체' },
      { k: 'i', s: 'assets/img/floor/f04-art.jpg?v=3', t: '04 · 명화 파티클',
        m: '파티클이 그려내는 베이스 이미지를 교체 — 다른 명화나 학교 이미지로', spec: '커스터마이징 · 베이스 교체' }
    ]
  },

  /* 06p · 3D 안의 화면들 — 작고 비스듬해 내용이 안 읽힌다. 클릭하면 원본으로 연다.
     순서는 room3d.js zoom(0..3) 과 맞춰야 한다. */
  booth: {
    fit: 'contain',
    items: [
      { k: 'i', s: 'assets/img/booth/vled-01_1.jpg', t: '세로형 벽면 LED',
        m: '상시 표출 · 통로 끝에서 학과를 알아보게', spec: '600 × 2,400mm · 240 × 960px' },
      /* [1]·[2] 는 시안 A/B 를 바꿀 때 room3d.js setShot() 이 갈아 끼운다 */
      { k: 'i', s: 'assets/img/booth/tv-elec-a.jpg', t: '65″ 벽걸이 TV',
        m: '카운터 태블릿이 그대로 미러링하는 화면', spec: '1,920 × 1,080 · 16:9' },
      { k: 'i', s: 'assets/img/booth/tab-elec-a.jpg', t: '카운터 태블릿',
        m: '갤럭시탭 12.4″ — 손으로 넘기면 TV 가 따라온다', spec: '16:10' },
      { k: 'i', s: 'assets/img/led/imw-hero.jpg', t: '인터랙티브 미디어월',
        m: '화면은 예시 — 실적용 시 학교 로고로 교체', spec: '4,000 × 2,500 · 16:10 · 10㎡' }
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
