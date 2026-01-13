import type {
  BaseItem,
  MemoItem,
  SectionConfig,
  TimeBoxItem,
} from "./types";

export const SECTION_CONFIGS: SectionConfig[] = [
  { key: "brainDump", title: "Brain Dump", icon: "Brain", gridSpan: 8 },
  { key: "priorities", title: "Priorities", icon: "Target", gridSpan: 4 },
  { key: "urgent", title: "Urgent Work", icon: "AlertCircle", gridSpan: 4 },
  { key: "selfDev", title: "Self-Development", icon: "Lightbulb", gridSpan: 4 },
  { key: "notToDo", title: "Not To-Do", icon: "Ban", gridSpan: 4 },
  { key: "timeBox", title: "Time Box", icon: "Clock", gridSpan: 8 },
  { key: "memo", title: "Memo", icon: "StickyNote", gridSpan: 4 },
];

export const SAMPLE_BRAIN_DUMP: string =
  "프로젝트 아이디어 정리하기\n다음 주 회의 안건 준비\n디자인 시스템 문서 검토\n\n새로운 기능 아이디어:\n- 사용자 피드백 대시보드\n- 자동 리포트 생성";

export const SAMPLE_PRIORITIES: BaseItem[] = [
  {
    id: "pr-1",
    title: "대시보드 7섹션 구현 완료",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pr-2",
    title: "코드 리뷰 피드백 반영",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pr-3",
    title: "API 연동 테스트",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_URGENT: BaseItem[] = [
  {
    id: "ur-1",
    title: "긴급 버그 수정",
    note: "오늘 마감",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ur-2",
    title: "클라이언트 미팅 자료 준비",
    note: "오후 3시까지",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_SELF_DEV: BaseItem[] = [
  {
    id: "sd-1",
    title: "TypeScript 고급 패턴 학습",
    tags: ["#reading"],
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sd-2",
    title: "React 19 새 기능 실습",
    tags: ["#coding"],
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sd-3",
    title: "시스템 디자인 인터뷰 준비",
    tags: ["#learning"],
    isDone: false,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_NOT_TO_DO: BaseItem[] = [
  {
    id: "ntd-1",
    title: "SNS 무한 스크롤",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ntd-2",
    title: "불필요한 미팅 참석",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ntd-3",
    title: "멀티태스킹",
    isDone: false,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_TIMEBOX: TimeBoxItem[] = [
  {
    id: "tb-1",
    title: "집중 코딩 세션",
    startAt: "09:00",
    endAt: "11:00",
    durationMin: 120,
    status: "done",
  },
  {
    id: "tb-2",
    title: "점심 휴식",
    startAt: "12:00",
    endAt: "13:00",
    durationMin: 60,
    status: "done",
  },
  {
    id: "tb-3",
    title: "코드 리뷰",
    startAt: "14:00",
    endAt: "15:30",
    durationMin: 90,
    status: "ongoing",
  },
  {
    id: "tb-4",
    title: "문서 작성",
    startAt: "16:00",
    endAt: "17:00",
    durationMin: 60,
    status: "scheduled",
  },
];

export const SAMPLE_MEMO: MemoItem[] = [
  {
    id: "memo-1",
    content:
      "오늘의 목표: 대시보드 7섹션 구현을 완료하고 반응형 테스트까지 마무리하기.\n\n회고: 어제 진행한 모달 작업이 생각보다 잘 마무리되었다.",
    createdAt: new Date().toISOString(),
  },
];

export const MAX_PRIORITIES = 5;
