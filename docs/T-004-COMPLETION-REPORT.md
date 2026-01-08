# T-004 작업 완료 보고서

**작업명:** Supabase 인증 시스템 통합 및 Timebox CRUD API 구축
**작업 ID:** T-004
**완료일:** 2026-01-08
**상태:** ✅ 완료

---

## 목차

1. [개요](#개요)
2. [구현 내용](#구현-내용)
3. [환경 설정](#환경-설정)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 명세](#api-명세)
6. [테스트 가이드](#테스트-가이드)
7. [배포 체크리스트](#배포-체크리스트)

---

## 개요

### 목적
Supabase Auth 기반의 이메일/비밀번호 및 Google OAuth 통합 인증을 구축하고, 인증된 사용자만 접근 가능한 Timebox CRUD API를 Next.js App Router Route Handlers로 제공합니다.

### 주요 기능
- ✅ 이메일/비밀번호 회원가입 및 로그인
- ✅ Google OAuth 소셜 로그인
- ✅ 신규 가입 시 profiles 테이블 자동 생성
- ✅ 인증된 사용자만 접근 가능한 Timebox CRUD API
- ✅ RLS (Row Level Security)로 본인 데이터만 접근
- ✅ 적절한 HTTP 상태 코드 반환 (200, 201, 204, 400, 401, 404, 500)

---

## 구현 내용

### 1. 데이터베이스 마이그레이션

**파일:** `supabase/migrations/0002_create_profiles_and_timeboxes.sql`

#### 생성된 테이블

**profiles 테이블**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**timeboxes 테이블**
```sql
CREATE TABLE public.timeboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT GENERATED ALWAYS AS (
    ROUND(EXTRACT(EPOCH FROM (end_at - start_at)) / 60)
  ) STORED,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'canceled')) DEFAULT 'scheduled' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### RLS 정책
- 사용자는 본인의 데이터만 조회/생성/수정/삭제 가능
- `auth.uid() = user_id` 조건으로 접근 제어

#### 자동화 트리거
- **신규 사용자 프로필 생성**: `handle_new_user()` 함수
- **updated_at 자동 업데이트**: `update_updated_at_column()` 함수

#### 인덱스
```sql
CREATE INDEX ix_timeboxes_user_id ON public.timeboxes(user_id);
CREATE INDEX ix_timeboxes_user_id_start_at ON public.timeboxes(user_id, start_at);
```

---

### 2. 인증 시스템

#### Auth Callback 라우트
**파일:** `src/app/auth/callback/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const code = requestUrl.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

#### Google OAuth UI
**파일:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`

**추가된 기능:**
- "Google로 시작하기" 버튼
- Google 로고 SVG 아이콘
- 로딩 상태 표시
- 에러 메시지 처리

**Google OAuth 플로우:**
```typescript
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

---

### 3. API 유틸리티

#### 세션 검증 유틸리티
**파일:** `src/app/api/_utils/auth.ts`

```typescript
export async function getSessionOrThrow() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, "Unauthorized");
  }

  return { supabase, user };
}
```

#### Zod 스키마
**파일:** `src/features/timebox/schemas.ts`

```typescript
export const TimeboxCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  status: TimeboxStatus.optional(),
});

export const TimeboxUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  status: TimeboxStatus.optional(),
});
```

---

## 환경 설정

### 1. 환경 변수

`.env.local` 파일에 다음 변수를 추가하세요:

```env
# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Server-only Key (절대 클라이언트에 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**환경 변수 확인 위치:**
- Supabase Dashboard > Settings > API
- `service_role` key는 서버 전용으로만 사용

### 2. Supabase 설정

#### Google OAuth Provider 활성화
**Supabase Dashboard > Authentication > Providers > Google**

1. Enable Google provider 체크
2. Google Cloud Console에서 OAuth 2.0 Client 생성
3. Client ID와 Client Secret 입력
4. Authorized redirect URIs 추가:
   - 로컬: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://your-domain.com/auth/callback`

#### Site URL 설정
**Supabase Dashboard > Authentication > URL Configuration**

- **Site URL**:
  - 로컬: `http://localhost:3000`
  - 프로덕션: `https://your-domain.com`

#### 마이그레이션 실행
**Supabase Dashboard > SQL Editor**

1. New Query 클릭
2. `supabase/migrations/0002_create_profiles_and_timeboxes.sql` 파일 내용 복사
3. Run 버튼 클릭하여 실행
4. Success 메시지 확인

---

## 데이터베이스 스키마

### ER Diagram

```
auth.users (Supabase 기본 제공)
    |
    | 1:1
    ↓
profiles
    - id (PK, FK → auth.users.id)
    - email (unique)
    - nickname
    - created_at
    - updated_at

auth.users
    |
    | 1:N
    ↓
timeboxes
    - id (PK)
    - user_id (FK → auth.users.id)
    - title
    - description
    - start_at
    - end_at
    - duration_minutes (자동 계산)
    - status (enum)
    - created_at
    - updated_at
```

### 데이터 타입

#### Timebox Status Enum
```typescript
type TimeboxStatus =
  | 'scheduled'     // 예정됨
  | 'in_progress'   // 진행 중
  | 'completed'     // 완료
  | 'canceled';     // 취소됨
```

---

## API 명세

### Base URL
- 로컬: `http://localhost:3000/api`
- 프로덕션: `https://your-domain.com/api`

### 인증
모든 엔드포인트는 Supabase 세션 쿠키를 통한 인증이 필요합니다.

### 엔드포인트

---

#### 1. POST /api/timeboxes
**설명:** 새로운 타임박스 생성

**요청 헤더:**
```
Content-Type: application/json
Cookie: sb-access-token=...; sb-refresh-token=...
```

**요청 본문:**
```json
{
  "title": "Deep Work",
  "description": "MVP 집중 개발",
  "start_at": "2026-01-08T09:00:00Z",
  "end_at": "2026-01-08T10:00:00Z",
  "status": "scheduled"
}
```

**필드 설명:**
- `title` (required): 타임박스 제목 (1-200자)
- `description` (optional): 상세 설명
- `start_at` (required): 시작 시간 (ISO 8601 형식)
- `end_at` (required): 종료 시간 (ISO 8601 형식)
- `status` (optional): 상태 (기본값: "scheduled")

**응답 (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deep Work",
  "description": "MVP 집중 개발",
  "start_at": "2026-01-08T09:00:00Z",
  "end_at": "2026-01-08T10:00:00Z",
  "duration_minutes": 60,
  "status": "scheduled",
  "created_at": "2026-01-08T08:00:00Z",
  "updated_at": "2026-01-08T08:00:00Z"
}
```

**에러 응답:**
- `400 Bad Request`: 유효성 검사 실패
  ```json
  {
    "error": "Validation error",
    "details": [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "path": ["title"],
        "message": "제목은 필수입니다"
      }
    ]
  }
  ```
- `401 Unauthorized`: 인증되지 않은 요청

---

#### 2. GET /api/timeboxes
**설명:** 타임박스 목록 조회 (본인 데이터만)

**쿼리 파라미터:**
- `from` (optional): 시작 시간 필터 (ISO 8601)
- `to` (optional): 종료 시간 필터 (ISO 8601)
- `limit` (optional): 조회 개수 제한 (기본값: 50, 최대: 100)

**요청 예시:**
```
GET /api/timeboxes?from=2026-01-08T00:00:00Z&to=2026-01-08T23:59:59Z&limit=20
```

**응답 (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Deep Work",
    "description": "MVP 집중 개발",
    "start_at": "2026-01-08T09:00:00Z",
    "end_at": "2026-01-08T10:00:00Z",
    "duration_minutes": 60,
    "status": "completed",
    "created_at": "2026-01-08T08:00:00Z",
    "updated_at": "2026-01-08T10:01:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "팀 미팅",
    "description": null,
    "start_at": "2026-01-08T14:00:00Z",
    "end_at": "2026-01-08T15:00:00Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "created_at": "2026-01-08T08:00:00Z",
    "updated_at": "2026-01-08T08:00:00Z"
  }
]
```

**에러 응답:**
- `401 Unauthorized`: 인증되지 않은 요청

---

#### 3. GET /api/timeboxes/:id
**설명:** 특정 타임박스 단건 조회

**요청 예시:**
```
GET /api/timeboxes/550e8400-e29b-41d4-a716-446655440000
```

**응답 (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deep Work",
  "description": "MVP 집중 개발",
  "start_at": "2026-01-08T09:00:00Z",
  "end_at": "2026-01-08T10:00:00Z",
  "duration_minutes": 60,
  "status": "completed",
  "created_at": "2026-01-08T08:00:00Z",
  "updated_at": "2026-01-08T10:01:00Z"
}
```

**에러 응답:**
- `401 Unauthorized`: 인증되지 않은 요청
- `404 Not Found`: 타임박스가 존재하지 않거나 본인 데이터가 아님
  ```json
  {
    "error": "Timebox not found"
  }
  ```

---

#### 4. PUT /api/timeboxes/:id
**설명:** 타임박스 수정 (부분 업데이트 지원)

**요청 본문 (부분 업데이트 가능):**
```json
{
  "status": "completed"
}
```

또는

```json
{
  "title": "Deep Work - 완료",
  "status": "completed",
  "description": "MVP 핵심 기능 개발 완료"
}
```

**응답 (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deep Work - 완료",
  "description": "MVP 핵심 기능 개발 완료",
  "start_at": "2026-01-08T09:00:00Z",
  "end_at": "2026-01-08T10:00:00Z",
  "duration_minutes": 60,
  "status": "completed",
  "created_at": "2026-01-08T08:00:00Z",
  "updated_at": "2026-01-08T10:01:00Z"
}
```

**에러 응답:**
- `400 Bad Request`: 유효성 검사 실패
- `401 Unauthorized`: 인증되지 않은 요청
- `404 Not Found`: 타임박스가 존재하지 않거나 본인 데이터가 아님

---

#### 5. DELETE /api/timeboxes/:id
**설명:** 타임박스 삭제

**요청 예시:**
```
DELETE /api/timeboxes/550e8400-e29b-41d4-a716-446655440000
```

**응답 (204 No Content):**
```
(응답 본문 없음)
```

**에러 응답:**
- `401 Unauthorized`: 인증되지 않은 요청
- `404 Not Found`: 타임박스가 존재하지 않거나 본인 데이터가 아님

---

### 공통 에러 응답

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 테스트 가이드

### 1. 로컬 개발 서버 실행

```bash
npm run dev
```

### 2. Google OAuth 테스트

1. 브라우저에서 `http://localhost:3000/login` 접속
2. "Google로 시작하기" 버튼 클릭
3. Google 계정 선택 및 권한 승인
4. `/auth/callback` → `/dashboard` 자동 리다이렉트 확인
5. Supabase Dashboard > Table Editor > profiles 테이블에서 신규 레코드 생성 확인

### 3. 이메일/비밀번호 회원가입 테스트

1. `http://localhost:3000/signup` 접속
2. 이메일, 비밀번호 입력 후 회원가입
3. Supabase에서 이메일 확인 활성화 시: 이메일 인증 필요
4. 이메일 확인 비활성화 시: 즉시 로그인 및 대시보드 이동

### 4. API 테스트 (cURL)

#### 타임박스 생성
```bash
curl -X POST http://localhost:3000/api/timeboxes \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token; sb-refresh-token=your-refresh-token" \
  -d '{
    "title": "테스트 타임박스",
    "start_at": "2026-01-08T14:00:00Z",
    "end_at": "2026-01-08T15:00:00Z"
  }'
```

#### 타임박스 목록 조회
```bash
curl http://localhost:3000/api/timeboxes \
  -H "Cookie: sb-access-token=your-token; sb-refresh-token=your-refresh-token"
```

#### 타임박스 수정
```bash
curl -X PUT http://localhost:3000/api/timeboxes/YOUR-TIMEBOX-ID \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token; sb-refresh-token=your-refresh-token" \
  -d '{
    "status": "completed"
  }'
```

#### 타임박스 삭제
```bash
curl -X DELETE http://localhost:3000/api/timeboxes/YOUR-TIMEBOX-ID \
  -H "Cookie: sb-access-token=your-token; sb-refresh-token=your-refresh-token"
```

### 5. Postman 테스트

1. Postman에서 새 컬렉션 생성
2. 브라우저에서 로그인 후 개발자 도구 > Application > Cookies에서 세션 쿠키 복사
3. Postman Request Headers에 쿠키 추가
4. 위 API 명세에 따라 테스트 실행

---

## 배포 체크리스트

### 환경 변수 설정
- [ ] Vercel/배포 플랫폼에 환경 변수 추가
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Supabase 설정
- [ ] Supabase 프로젝트 리전: `ap-northeast-1` (서울) 확인
- [ ] Google OAuth Provider 설정
  - [ ] Client ID, Client Secret 입력
  - [ ] Redirect URI: `https://your-domain.com/auth/callback` 추가
- [ ] Site URL: `https://your-domain.com` 설정
- [ ] Email Confirmation 설정 (선택사항)

### 데이터베이스
- [ ] 마이그레이션 실행 완료
- [ ] RLS 정책 활성화 확인
- [ ] 인덱스 생성 확인
- [ ] 트리거 함수 동작 확인 (신규 사용자 프로필 자동 생성)

### API 테스트
- [ ] 인증 없이 API 호출 시 401 반환 확인
- [ ] 타임박스 CRUD 모든 엔드포인트 정상 동작 확인
- [ ] 다른 사용자 데이터 접근 시 404 반환 확인 (보안)
- [ ] 유효성 검사 실패 시 400 반환 및 에러 메시지 확인

### 보안 체크
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트에 노출되지 않는지 확인
- [ ] RLS 정책이 모든 테이블에 적용되었는지 확인
- [ ] CORS 설정 확인 (필요 시)
- [ ] Rate Limiting 고려 (추후 추가 권장)

### 문서화
- [ ] API 명세 문서 최신 상태 유지
- [ ] 환경 변수 설정 가이드 팀과 공유
- [ ] 온보딩 문서 업데이트

---

## 참고 자료

### 공식 문서
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zod 스키마 검증](https://zod.dev/)

### 관련 파일
- `supabase/migrations/0002_create_profiles_and_timeboxes.sql`
- `src/app/auth/callback/route.ts`
- `src/app/api/timeboxes/route.ts`
- `src/app/api/timeboxes/[id]/route.ts`
- `src/app/api/_utils/auth.ts`
- `src/features/timebox/schemas.ts`

---

**작성자:** Claude (AI Assistant)
**최종 업데이트:** 2026-01-08
**버전:** 1.0.0
