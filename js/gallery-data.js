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
  }

  /* storyboard · led · scope · booth* 갤러리는 해당 슬라이드가 빠지면서 같이 걷어냈다.
     남은 라이트박스는 09p IMW 8종 하나뿐이다. */
};
