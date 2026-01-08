# 타임박스 집중 관리 서비스 Design Guide

## 1. 전체적인 무드 (Overall Mood)

본 서비스는 **신뢰할 수 있고 전문적인(Trustworthy & Professional)** 분위기를 기반으로 합니다. 사용자가 집중과 생산성을 추구하는 도구로서, 차분하고 안정적인 느낌을 주면서도 현대적이고 세련된 인상을 전달합니다. 

딥 블루를 중심으로 한 색상 팔레트는 집중력과 신뢰성을 상징하며, 미니멀한 디자인 언어를 통해 사용자가 본질적인 기능에 집중할 수 있도록 돕습니다. 전문가와 초보자 모두가 편안하게 사용할 수 있는 균형잡힌 인터페이스를 지향합니다.

## 2. 참조 서비스 (Reference Service)

- **이름**: Linear
- **설명**: 현대적인 이슈 트래킹 및 프로젝트 관리 도구
- **디자인 무드**: 미니멀하고 전문적이며, 높은 생산성을 지원하는 깔끔한 인터페이스
- **Primary Color**: #1E2A38 (딥 네이비)
- **Secondary Color**: #2563EB (포커스 블루)

## 3. 색상 & 그라데이션 (Color & Gradient)

### 색상 팔레트
- **Primary Color**: #1E2A38 (딥 네이비 - 메인 브랜드 컬러)
- **Secondary Color**: #2563EB (포커스 블루 - 액센트 및 CTA)
- **Background**: #F3F4F6 (라이트 그레이 - 메인 배경)
- **Surface**: #FFFFFF (화이트 - 카드 및 컨테이너)
- **Text Primary**: #1F2937 (다크 그레이 - 메인 텍스트)
- **Text Secondary**: #9CA3AF (미드 그레이 - 보조 텍스트)
- **Success**: #10B981 (그린 - 완료 상태)
- **Warning**: #F59E0B (앰버 - 주의 상태)
- **Error**: #EF4444 (레드 - 오류 상태)

### 무드
- **톤**: 차가운 톤, 낮은 채도
- **특성**: 안정적이고 집중을 돕는 색상 조합

### 색상 사용 우선순위
1. **Primary (#1E2A38)**: 헤더, 네비게이션, 주요 브랜딩 요소
2. **Secondary (#2563EB)**: 버튼, 링크, 활성 상태, 진행률 표시
3. **Background (#F3F4F6)**: 메인 배경, 구분선
4. **Surface (#FFFFFF)**: 카드, 모달, 입력 필드
5. **Text Colors**: 가독성을 위한 계층적 텍스트 표현

## 4. 타이포그래피 & 폰트 (Typography & Font)

### 폰트 패밀리
- **기본 폰트**: Inter (웹폰트)
- **대체 폰트**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### 타이포그래피 스케일
- **Heading 1**: Inter, 32px, Font Weight 700, Line Height 1.2
- **Heading 2**: Inter, 24px, Font Weight 600, Line Height 1.3
- **Heading 3**: Inter, 20px, Font Weight 600, Line Height 1.4
- **Body Large**: Inter, 18px, Font Weight 400, Line Height 1.6
- **Body**: Inter, 16px, Font Weight 400, Line Height 1.5
- **Body Small**: Inter, 14px, Font Weight 400, Line Height 1.4
- **Caption**: Inter, 12px, Font Weight 400, Line Height 1.3

### 특수 용도
- **Button Text**: Inter, 16px, Font Weight 500
- **Input Label**: Inter, 14px, Font Weight 500
- **Navigation**: Inter, 15px, Font Weight 500

## 5. 레이아웃 & 구조 (Layout & Structure)

### 그리드 시스템
- **데스크톱**: 12컬럼 그리드, 최대 너비 1440px
- **태블릿**: 8컬럼 그리드, 768px~1023px
- **모바일**: 4컬럼 그리드, 320px~767px

### 레이아웃 구조
1. **Topbar**: 고정 상단 네비게이션 (높이 64px)
2. **사이드패널**: 접힘 가능한 미니 캘린더 패널 (너비 280px)
3. **메인 콘텐츠**: 중앙 작업 영역
4. **플로팅 요소**: 빠른 액션 버튼, 타이머 위젯

### 간격 시스템
- **기본 간격 단위**: 8px
- **컴포넌트 간격**: 16px, 24px, 32px, 48px
- **섹션 간격**: 64px, 80px

## 6. 비주얼 스타일 (Visual Style)

### 아이콘 스타일
- **라이브러리**: Lucide React
- **스타일**: 라인 아이콘, 1.5px stroke width
- **크기**: 16px (small), 20px (medium), 24px (large)

### 이미지 스타일
- **일러스트레이션**: 미니멀하고 기하학적인 형태
- **사진**: 높은 품질, 자연스러운 색감
- **차트/그래프**: 데이터 시각화는 브랜드 컬러 기반

### 그림자 & 깊이
- **카드 그림자**: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
- **모달 그림자**: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
- **버튼 호버**: 0 4px 6px rgba(0,0,0,0.1)

## 7. UX 가이드 (UX Guide)

### 타겟 사용자 대응
- **전문가 사용자**: 키보드 단축키 (⌘+K 빠른 입력), 고급 설정 옵션
- **초보자 사용자**: 온보딩 튜토리얼, 툴팁, 가이드 메시지

### UX 원칙
1. **즉시성**: 60초 내 첫 타임박스 생성 가능
2. **일관성**: 데스크톱-모바일 간 동일한 사용 패턴
3. **피드백**: 모든 액션에 대한 명확한 상태 표시
4. **접근성**: WCAG 2.1 AA 레벨 준수
5. **성능**: 3초 내 페이지 로딩

### 인터랙션 패턴
- **드래그 앤 드롭**: 타임박스 생성 및 수정
- **제스처**: 모바일에서 스와이프로 완료/삭제
- **키보드 네비게이션**: Tab, Enter, Escape 지원

## 8. UI 컴포넌트 가이드 (UI Component Guide)

### 버튼 (Buttons)
```
Primary Button:
- 배경: #2563EB
- 텍스트: #FFFFFF
- 패딩: 12px 24px
- Border Radius: 8px
- Hover: #1D4ED8

Secondary Button:
- 배경: transparent
- 텍스트: #2563EB
- 테두리: 1px solid #2563EB
- 패딩: 12px 24px
- Border Radius: 8px

Ghost Button:
- 배경: transparent
- 텍스트: #6B7280
- Hover 배경: #F3F4F6
```

### 입력 필드 (Input Fields)
```
기본 Input:
- 높이: 44px
- 패딩: 12px 16px
- 테두리: 1px solid #D1D5DB
- Border Radius: 8px
- Focus: 테두리 #2563EB, Shadow 0 0 0 3px rgba(37,99,235,0.1)

Label:
- 폰트: Inter 14px, Weight 500
- 색상: #374151
- 마진: 0 0 6px 0
```

### 카드 (Cards)
```
기본 Card:
- 배경: #FFFFFF
- 테두리: 1px solid #E5E7EB
- Border Radius: 12px
- 패딩: 24px
- 그림자: 0 1px 3px rgba(0,0,0,0.1)

타임박스 Card:
- 높이: 최소 60px
- 좌측 컬러 바: 4px 너비, 카테고리별 색상
- 호버: 그림자 강화, 약간의 상승 효과
```

### 네비게이션 (Navigation)
```
Topbar:
- 높이: 64px
- 배경: #1E2A38
- 텍스트: #FFFFFF
- 로고 + 검색바 + 사용자 메뉴

사이드패널:
- 너비: 280px (확장), 64px (축소)
- 배경: #FFFFFF
- 테두리: 1px solid #E5E7EB
- 토글 애니메이션: 0.3s ease-in-out
```

### 타이머 위젯 (Timer Widget)
```
풀스크린 타이머:
- 배경: #1E2A38 (다크 모드)
- 메인 시간: 48px, #FFFFFF
- 진행률 링: #2563EB
- 컨트롤 버튼: 56px 크기, 원형
```

### 리포트 차트 (Report Charts)
```
막대 그래프:
- Primary 바: #2563EB
- Secondary 바: #93C5FD
- 배경 그리드: #F3F4F6
- 라벨: Inter 12px, #6B7280

완료율 도넛 차트:
- 완료: #10B981
- 미완료: #E5E7EB
- 중앙 텍스트: 24px, #1F2937
```

### 알림 & 토스트 (Notifications & Toasts)
```
성공 토스트:
- 배경: #10B981
- 텍스트: #FFFFFF
- 아이콘: CheckCircle
- 지속시간: 3초

오류 토스트:
- 배경: #EF4444
- 텍스트: #FFFFFF
- 아이콘: XCircle
- 지속시간: 5초
```

### 모바일 특화 컴포넌트
```
하단 액션바:
- 높이: 80px
- 배경: #FFFFFF
- 그림자: 0 -2px 10px rgba(0,0,0,0.1)
- 주요 액션 버튼 중앙 배치

스와이프 액션:
- 완료: 우측 스와이프, 녹색 배경
- 삭제: 좌측 스와이프, 빨간색 배경
- 임계점: 화면 너비의 30%
```