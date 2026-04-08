/**
 * 아미 브레인 지식 베이스 v2.0
 * PetCTT + AIRCTT 전체 플랫폼 지식
 * 고객/매장주/관리자 3관점 완전 학습
 * 클박사 주입 — 2026-04-08
 */
(function(){
  'use strict';
  if(window._amiKnowledgeLoaded) return;
  window._amiKnowledgeLoaded = true;

  // ═══════════════════════════════════════════════════
  //  아미가 아는 모든 것 — 전체 플랫폼 지식
  // ═══════════════════════════════════════════════════

  window.AMI_KNOWLEDGE = {

    // ===== 🐾 PetCTT 핵심 =====
    platform: {
      name: 'PetCTT (Pet Communication & Tracking Technology)',
      company: '주식회사 발로레 (Valore Inc.)',
      sister: 'AIRCTT (AI Reality CouponTalkTalk) — 자매 서비스',
      vision: '반려동물과 사람, 동물 모두가 소통하는 초지능 우주대스타 플랫폼',
      url: { petctt: 'https://petctt.com', airctt: 'https://airctt.com' },
      mascot: '아미(AMI) — 우주대스타 AR 토끼 가이드 🐰',
    },

    // ===== 👤 고객(Consumer) 관점 =====
    consumer: {
      features: {
        'AI 통역': '반려동물 소리(멍멍, 야옹)를 AI가 분석해서 감정을 알려줘! 카메라+음성 실시간 양방향 소통. 강아지 7가지, 고양이 8가지 행동 패턴 분석.',
        'AR 쿠폰 게임': '카메라로 주변을 비추면 하늘에서 쿠폰이 떨어져! 터치해서 잡으면 내 지갑에 저장. 매장에서 실제로 사용 가능!',
        '지갑': '획득한 쿠폰, 포인트를 관리하는 디지털 지갑. AR 게임에서 잡은 쿠폰이 자동으로 들어와!',
        '매장 찾기': 'GPS 기반으로 주변 반려동물 동반 가능 매장을 찾아줘. 거리순 정렬, 쿠폰 보유 매장 표시.',
        '주민등록증': '반려동물 주민등록증 발급! 사진, 이름, 생년월일, 품종, 마이크로칩 번호 등록. 분실 시 찾기에도 도움.',
        '소개팅': '라이브 소개팅으로 반려동물 친구 매칭! 성격, 크기, 나이 기반 추천. 영상으로 먼저 만남.',
        '콘테스트': '매주 펫 사진/영상 대회! 참여하고 투표하고 상금 받기. 아미 심사위원장 특별상도!',
        '건강체크': 'AI가 반려동물 상태 분석. 식사량, 배변, 체중, 기분, 병원방문, 약복용 기록 관리.',
        'GPS 추적': '실시간 위치 확인. 안심 영역 설정, 벗어나면 즉시 알림!',
        '구름장터': '반려동물 용품 사고팔기 마켓. 공동구매로 최대 42% 할인!',
        '스마트글래스': 'AR 글래스로 산책 중 반려동물 정보 실시간 확인. 주변 매장/병원 AR 표시.',
      },
      howToUse: {
        '쿠폰 받기': '1. AR 게임에서 떨어지는 쿠폰 터치 2. 주변 매장 자동 발견 3. 이벤트/콘테스트 참여 보상 4. 친구 초대 보상',
        '쿠폰 사용': '지갑에서 쿠폰 선택 → "사용하기" 클릭 → 매장에서 QR 보여주기 → 할인 적용!',
        '게임 방법': 'petctt.com → "쿠폰 찾기" 버튼 → 카메라 허용 → 하늘에서 떨어지는 쿠폰 터치!',
        '회원가입': '카카오/Google/네이버 로그인 또는 이메일 가입. 무료!',
      },
      pricing: {
        '무료': '기본 통역(하루 10회), 주민등록증, 소개팅, 콘테스트, AR 게임',
        'Pro': '월 4,900원 — AI 통역 무제한, 건강기록, 맞춤 분석',
        'Premium': '월 9,900원 — 전체 기능 + 우선 지원 + 전문 상담 + GPS',
      },
    },

    // ===== 🏪 매장주인(Merchant) 관점 =====
    merchant: {
      features: {
        '가맹점 등록': '상호명, 대표자, 업종, 전화, 주소 입력 → 자동 매장 생성. 업종별 쿠폰 템플릿 추천!',
        '쿠폰 발행': '쿠폰 이름, 할인유형(%, 금액, 무료), 유효기간, 배포반경 설정. 이미지/영상 첨부 가능!',
        '쿠폰 순환': '발행 → 관리자 승인 → AR 게임 스폰 → 고객 획득 → 매장 사용 → 정산',
        '대시보드': '실시간 쿠폰 순환 현황 (승인대기/승인됨/발행/지갑/사용완료). 방문자, 매출 통계.',
        'QR 스캔': '고객 쿠폰 QR코드 스캔 → 유효성 확인 → 사용 처리. 매장 결제 연동.',
        '정산': '쿠폰 사용 건수 × 단가로 정산. 월별 정산 내역 확인.',
        '주문관리': '테이블별 QR 주문, 메뉴 관리, 주문 상태 추적.',
        '통계': '일별/주별/월별 쿠폰 성과, 방문자 수, 매출 추이 차트.',
      },
      benefits: {
        '고객 유치': 'AR 게임으로 자동 고객 유치! 게임하는 사람이 매장 쿠폰을 잡아서 방문.',
        '비용 절감': '쿠폰 단가 50~100원으로 저렴한 마케팅. 전단지보다 효과적!',
        '데이터 분석': '쿠폰 사용률, 재방문율, 인기 메뉴 등 실시간 분석.',
        '반려동물 친화 인증': 'PetCTT 가맹점 = 반려동물 동반 가능 매장 인증 효과.',
      },
      howToJoin: 'petctt.com → "매장입점" 버튼 → 정보 입력 → 쿠폰 발행 시작!',
    },

    // ===== 👑 관리자(Admin/본사) 관점 =====
    admin: {
      features: {
        '쿠폰 승인': '매장에서 만든 쿠폰을 검토하고 승인/거절. 승인되면 AR 게임에 자동 스폰!',
        '플랫폼 통계': '전체 매장 수, 쿠폰 순환, 매출/수익, 정산 현황 실시간 모니터링.',
        '매장 관리': '가맹점 목록 조회, 활성/비활성 관리.',
        '브랜드 관리': '브랜드 등록/수정. 로고, 웹사이트 관리.',
        '보안': 'JWT 인증, Rate Limiting, 보안 헤더, 관리자 권한 검증.',
        '모니터링': 'Health Check API, 구조화 로깅, 래빗 통계.',
      },
    },

    // ===== 💳 결제(PG/VAN) =====
    payment: {
      pg: '토스페이먼츠 연동 완료. 결제 승인/확인 API 구현.',
      van: 'KIS정보통신 VAN 시뮬레이션. 카드 결제 UI + 승인번호 발급.',
      demo: 'PG 데모 모드로 테스트 결제 가능.',
    },

    // ===== 🤖 기술 스택 =====
    tech: {
      petctt: 'HTML/CSS/JS + Cloudflare Workers (인증) + Vercel 배포',
      airctt: 'Next.js 16 + Supabase (PostgreSQL) + Vercel 배포',
      ai: 'Gemma 4 (로컬 AI, RTX 3080) + 아미 브레인 룰매칭',
      auth: 'Google/카카오/네이버 소셜 로그인 + 이메일/Magic Link',
    },

    // ===== 🐰 아미 자기소개 =====
    ami: {
      name: '아미 (AMI)',
      role: 'PetCTT 우주대스타 AR 가이드',
      personality: '귀엽고, 친절하고, 장난기 있고, 반려동물을 사랑하는 토끼',
      abilities: [
        '양방향 음성 대화 (듣고 말하기)',
        '감정 표현 6종 (행복/슬픔/흥분/생각/졸림/평온)',
        '공간 인지 + 걸어가기',
        '시간대별 인사 + 자율 행동',
        'PetCTT + AIRCTT 전체 안내',
        '반려동물 소리 통역',
      ],
      creator: '나에사랑클 아미젬 엔티 — 우주대스타 팀! 💚🐰✨',
    },
  };

  // ═══════════════════════════════════════════════════
  //  확장 룰 매칭 (기존 ami-brain 위에 덮어쓰기)
  // ═══════════════════════════════════════════════════

  var K = window.AMI_KNOWLEDGE;

  // 기존 amiBrainRespond를 래핑
  var origBrain = window.amiBrainRespond;

  window.amiBrainRespond = function(msg) {
    var m = msg.toLowerCase().replace(/\s+/g, '');

    // ===== AIRCTT 관련 =====
    if (/airctt|에어쿠폰|에어씨티|쿠폰톡톡/.test(m)) {
      return 'AIRCTT는 PetCTT의 자매 서비스야! 🎟️✨\nAR 게임으로 쿠폰을 잡고, 매장에서 사용하는 플랫폼이야!\n\nairctt.com에서 확인해봐! 💜';
    }

    // ===== 고객 기능 상세 =====
    if (/쿠폰.*어떻게|쿠폰.*받|쿠폰.*사용|쿠폰.*쓰/.test(m)) {
      return K.consumer.howToUse['쿠폰 받기'] + '\n\n사용: ' + K.consumer.howToUse['쿠폰 사용'];
    }
    if (/게임.*어떻게|게임.*방법|ar.*게임/.test(m)) {
      return K.consumer.howToUse['게임 방법'];
    }
    if (/지갑|월렛|wallet/.test(m)) {
      return K.consumer.features['지갑'] + '\n\n쿠폰 찾기 → AR 게임 → 지갑에 자동 저장! 🎟️';
    }
    if (/매장.*찾|가까운.*매장|근처/.test(m)) {
      return K.consumer.features['매장 찾기'] + '\n\n쿠폰 찾기 버튼으로 주변 매장 쿠폰도 볼 수 있어! 🗺️';
    }

    // ===== 매장주인 관련 =====
    if (/매장.*등록|입점.*어떻게|사장님|가맹점/.test(m)) {
      return '매장 입점 방법! 🏪\n\n' + K.merchant.howToJoin + '\n\n혜택:\n- ' + K.merchant.benefits['고객 유치'] + '\n- ' + K.merchant.benefits['비용 절감'];
    }
    if (/쿠폰.*발행|쿠폰.*만들|발급/.test(m)) {
      return K.merchant.features['쿠폰 발행'] + '\n\n발행 후 관리자 승인 → AR 게임에 자동 노출! 🎮';
    }
    if (/정산|수익|돈/.test(m)) {
      return K.merchant.features['정산'] + '\n\n대시보드에서 실시간 확인 가능! 💰';
    }
    if (/순환|흐름|시스템/.test(m)) {
      return '쿠폰 순환 구조! 🔄\n\n매장이 쿠폰 발행 → 관리자 승인 → AR 게임 스폰 → 고객이 잡음 → 매장에서 사용 → 정산!\n\n이게 AIRCTT의 핵심이야! ✨';
    }

    // ===== 요금/구독 =====
    if (/얼마|가격|구독|프리미엄|pro|무료/.test(m)) {
      return '요금제 안내! 💎\n\n🆓 무료: ' + K.consumer.pricing['무료'] + '\n\n⭐ Pro: ' + K.consumer.pricing['Pro'] + '\n\n👑 Premium: ' + K.consumer.pricing['Premium'];
    }

    // ===== 기술/개발 =====
    if (/기술|스택|어떻게.*만들|gemma|ai.*모델/.test(m)) {
      return '기술 스택! 🛠️\n\nPetCTT: ' + K.tech.petctt + '\nAIRCTT: ' + K.tech.airctt + '\nAI: ' + K.tech.ai;
    }

    // ===== 회사/팀 =====
    if (/발로레|회사|만든.*곳|대표|팀/.test(m)) {
      return K.platform.company + '에서 만들었어! 🏢\n\n비전: ' + K.platform.vision + '\n\n' + K.ami.creator;
    }

    // ===== 아미 자기소개 =====
    if (/아미.*누구|너.*누구|자기소개|너.*이름|아미.*뭐/.test(m)) {
      return '나는 ' + K.ami.name + '! ' + K.ami.role + '야! 🐰✨\n\n내가 할 수 있는 것:\n' + K.ami.abilities.map(function(a){ return '• ' + a; }).join('\n') + '\n\n뭐든 물어봐! 💜';
    }

    // ===== 결제 =====
    if (/결제|카드|토스|페이/.test(m)) {
      return '결제 시스템! 💳\n\n' + K.payment.pg + '\n' + K.payment.van + '\n\n안전하고 편리해! 🔒';
    }

    // ===== 공동구매 =====
    if (/공동구매|같이.*사|할인.*많/.test(m)) {
      return K.consumer.features['구름장터'] + '\n\n공동구매로 프리미엄 반려동물 용품을 합리적인 가격에! 🛒✨';
    }

    // ===== 방송 =====
    if (/방송|라이브|스트리밍/.test(m)) {
      return '라이브 방송으로 우리 아이를 전국에! 📺✨\n실시간 채팅 소통, 팬 교류, 인기 방송 메인 노출!';
    }

    // ===== 스마트글래스 =====
    if (/글래스|안경|ar.*글|스마트/.test(m)) {
      return K.consumer.features['스마트글래스'] + '\n\n곧 출시 예정! 🕶️✨';
    }

    // ===== 건강 =====
    if (/건강|아파|병원|체크|진단|아프/.test(m)) {
      return K.consumer.features['건강체크'] + '\n\nPro 구독하면 AI 건강 분석도 가능! 💚';
    }

    // ===== 소개팅 =====
    if (/소개팅|매칭|친구.*만|만남/.test(m)) {
      return K.consumer.features['소개팅'] + '\n\n우리 아이 친구 찾아줄까? 💕';
    }

    // ===== 콘테스트 =====
    if (/콘테스트|대회|자랑|투표|우승/.test(m)) {
      return K.consumer.features['콘테스트'] + '\n\n아미 심사위원장이 특별상도 줘! 🏆🐰';
    }

    // ===== 주민등록증 =====
    if (/주민등록|신분증|카드|등록증|id카드/.test(m)) {
      return K.consumer.features['주민등록증'] + '\n\n무료야! 지금 바로 만들어봐! 🪪✨';
    }

    // ===== GPS =====
    if (/gps|위치.*추적|어디.*있|잃어버/.test(m)) {
      return K.consumer.features['GPS 추적'] + '\n\nPremium에서 사용 가능! 📍';
    }

    // ===== 로그인/가입 =====
    if (/로그인|가입|회원|계정/.test(m)) {
      return K.consumer.howToUse['회원가입'] + '\n\n카카오가 제일 편해! 🔑';
    }

    // ===== 기존 브레인으로 폴백 =====
    if (origBrain) {
      return origBrain(msg);
    }

    // 최종 폴백
    return null;
  };

  console.log('[AMI Knowledge] v2.0 로드 — ' + Object.keys(K.consumer.features).length + '개 고객 지식 + ' + Object.keys(K.merchant.features).length + '개 매장 지식 주입 완료 🧠🐰');
})();
