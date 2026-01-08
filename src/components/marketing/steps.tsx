"use client";

import { Section } from "./section";

const steps = [
  {
    number: 1,
    title: "가입 및 기본 설정",
    description: "이메일로 60초 안에 시작하고 알림 권한을 설정하세요.",
  },
  {
    number: 2,
    title: "타임박스 계획",
    description: "일정을 만들고 집중·휴식 사이클을 설정합니다.",
  },
  {
    number: 3,
    title: "모바일 알림으로 실천",
    description: "브라우저 또는 푸시 알림으로 계획된 흐름을 유지합니다.",
  },
];

export function Steps() {
  return (
    <Section className="bg-slate-50 py-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            3단계 온보딩
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            복잡한 설정 없이 간단한 3단계로 바로 시작하세요
          </p>
        </div>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-xl border border-slate-200 bg-white p-8"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
