export const STADIUMS = [
  {
    id: 'jamsil',
    name: '잠실 야구장',
    team: 'LG 트윈스 / 두산 베어스',
    location: '서울특별시 송파구',
    food: ['김치말이국수', '철판삼겹살', '원샷치킨'],
    tip: '네이비석 상단은 여름에 시원하지만 바람이 많이 불어요.',
    wayToComeUrl: 'https://blog.naver.com/baseballnavi/220545118838'
  },
  {
    id: 'munhak',
    name: '인천 SSG 랜더스필드',
    team: 'SSG 랜더스',
    location: '인천광역시 미추홀구',
    food: ['크림새우', '그릴킹 치킨', '스타벅스'],
    tip: '외야 바베큐존 예약은 오픈 즉시 매진되니 서두르세요!'
  },
  {
    id: 'gocheok',
    name: '고척 스카이돔',
    team: '키움 히어로즈',
    location: '서울특별시 구로구',
    food: ['백남옥 만두', '타코야끼', '스테이크'],
    tip: '여름에도 시원한 돔구장! 외부 음식 반입 시 보안검색이 철저해요.'
  },
  {
    id: 'suwon',
    name: '수원 KT 위즈파크',
    team: 'kt wiz',
    location: '경기도 수원시',
    food: ['진미통닭', '보영만두', '버터구이 오징어'],
    tip: '모바일 앱으로 미리 음식을 주문하면 대기 시간을 줄일 수 있어요.'
  },
  {
    id: 'daejeon',
    name: '한화생명 이글스파크',
    team: '한화 이글스',
    location: '대전광역시 중구',
    food: ['농심 가락 떡볶이', '생맥주', '보문산 메아리'],
    tip: '중앙석 시야가 매우 탁월하지만 주차 공간이 협소해요.'
  },
  {
    id: 'daegu',
    name: '대구 삼성 라이온즈 파크',
    team: '삼성 라이온즈',
    location: '대구광역시 수성구',
    food: ['땅땅치킨', '납작만두', '우동'],
    tip: '상단 층에서도 경기장이 가깝게 보여 전 좌석 시야가 좋습니다.'
  },
  {
    id: 'gwangju',
    name: '광주-기아 챔피언스 필드',
    team: 'KIA 타이거즈',
    location: '광주광역시 북구',
    food: ['마성떡볶이', '스테이키', '수제맥주'],
    tip: '아이들과 함께라면 외야 샌드박스석을 추천합니다.'
  },
  {
    id: 'sajik',
    name: '사직 야구장',
    team: '롯데 자이언츠',
    location: '부산광역시 동래구',
    food: ['삼겹살 김밥', '어묵', '닭강정'],
    tip: '1루 응원석의 열기는 KBO 최고! 주류 반입 규정을 확인하세요.'
  },
  {
    id: 'changwon',
    name: '창원 NC 파크',
    team: 'NC 다이노스',
    location: '경상남도 창원시',
    food: ['코아양과', '족발', 'BBQ'],
    tip: '국내 최고의 메이저리그급 시설! 관전 환경이 가장 쾌적합니다.'
  }
];

export const CHEER_SONGS = [
  {
    team: 'LG 트윈스',
    teamSong: '서울의 찬가, 승리의 노래',
    teamSongUrl: 'https://youtu.be/oLLEq6bzCBs?si=D2Krn-L-Hwj4Pj9W',
    players: [
      { name: '오지환', lyrics: '오지환 오지환 성큼성큼 날려버려라~ (안타!) 영원한 유격수 오지환 무적 LG 오지환' },
      { name: '김현수', lyrics: 'L! G! 김현수! 안타 김현수! 타점 김현수! 무적 LG 김현수!' }
    ]
  },
  {
    team: '두산 베어스',
    teamSong: '승리의 두산, 최강두산',
    teamSongUrl: 'https://youtu.be/I3yUOwoo0v4?si=Zqh7nzZVSs5WIaQz',
    players: [
      { name: '양의지', lyrics: '두산의 안방마님 양의지~ 안타를 날려줘요 양의지~' },
      { name: '정수빈', lyrics: '안타 날려라~ 두산의 정수빈! 수빈! 정수빈!' }
    ]
  },
  {
    team: '한화 이글스',
    teamSong: '행복송, 나는 행복합니다',
    teamSongUrl: 'https://youtu.be/ucNR9zLqmDs?si=urJobvYDDZ1LvYwo',
    players: [
      { name: '채은성', lyrics: '채은성 채은성 채은성 한화의 채은성~ 안타 채은성!' },
      { name: '요나단 페라자', lyrics: '안타 안타 요나단 페라자~ 홈런 홈런 요나단 페라자~' }
    ]
  },
  {
    team: 'KIA 타이거즈',
    teamSong: '남행열차, 응원가 메들리',
    teamSongUrl: 'https://youtu.be/dudVNSG9foc?si=b3_m5X6iCy5Fg-yK',
    players: [
      { name: '김도영', lyrics: '기아의 김도영~ 안타 날려버려~ 승리를 향해 가자~' },
      { name: '최형우', lyrics: '최형우! 최형우! 타이거즈 해결사~' }
    ]
  },
  {
    team: 'SSG 랜더스',
    teamSong: '연안부두, 승리의 함성',
    teamSongUrl: 'https://youtu.be/-s9b3o3BLXo?si=ot38XXbV1FtfPnLC',
    players: [
      { name: '최정', lyrics: '홈런 날려라 SSG의 최정~ 최정! 홈런 최정!' },
      { name: '추신수', lyrics: '추신수 추신수 안타 추신수~ 추추 트레인 추신수!' }
    ]
  },
  {
    team: 'NC 다이노스',
    teamSong: '맞나 맞다, 다이노스여 일어나라',
    teamSongUrl: 'https://youtu.be/HfcIgjcdNQ8?si=c8Tx9G0vTBHYPTly',
    players: [
      { name: '박건우', lyrics: 'NC 박건우~ 안타 박건우~ 거누거누~ 박건우!' },
      { name: '손아섭', lyrics: '자이언트 아섭에서 공룡 아섭으로! 안타 제조기 손아섭!' }
    ]
  },
  {
    team: '삼성 라이온즈',
    teamSong: '엘도라도, 승리의 찬가',
    teamSongUrl: 'https://youtu.be/g4tl-r76JEs?si=h7pVwSf5-ozjfyRh',
    players: [
      { name: '구자욱', lyrics: '삼성의 구자욱~ 구자욱~ 안타를 날려버려~' },
      { name: '강민호', lyrics: '삼성의 안방마님 강민호~ 안타 강민호! 홈런 강민호!' }
    ]
  },
  {
    team: 'kt wiz',
    teamSong: '우리는 kt wiz, 승리의 마법사',
    teamSongUrl: 'https://youtu.be/3GXBL7QhPvU?si=2TsKZEhuV_d_qW1G',
    players: [
      { name: '강백호', lyrics: 'kt의 강백호~ 홈런 강백호~ 백호! 백호! 강백호!' },
      { name: '황재균', lyrics: '황재균! 황재균! 안타 날려버려~ 워어어어~' }
    ]
  },
  {
    team: '키움 히어로즈',
    teamSong: '영웅 출정가, 영웅의 함성',
    teamSongUrl: 'https://youtu.be/antR6UYqZKk?si=VP96ILkyWiTB0IyC',
    players: [
      { name: '송성문', lyrics: '키움의 캡틴 송성문! 안타 송성문~ 홈런 송성문~' },
      { name: '김혜성', lyrics: '키움의 김혜성~ 안타 김혜성! 김혜성! 날려버려!' }
    ]
  },
  {
    team: '롯데 자이언츠',
    teamSong: '부산 갈매기, 돌아와요 부산항에',
    teamSongUrl: 'https://youtu.be/-CLzJsuoka0?si=AR5y1BOlfittsbpz',
    players: [
      { name: '황성빈', lyrics: '오~ 롯데의 황성빈 오오오 안타안타 롯데 황성빈~' },
      { name: '전준우', lyrics: '안타 안타 쌔리라 쌔리라~ 롯데 전준우' },
      { name: '한태양', lyrics: '롯데자이언츠 한태양 안타~ 오오오오오오오오~ 롯데 자이언츠 한태양 안타~ 오오오오오오오' },
      { name: '윤동희', lyrics: '롯데의 윤동희~ 쌔리라 안타 쌔리라~ 최강 롯데 자이언츠 윤동희~' },
      { name: '빅터 레이예스', lyrics: '빅터 레이예스 안타홈런 오오오오~ 빅터 레이예스 오오오오오' }
    ]
  }
];
