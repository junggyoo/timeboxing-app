"use client";

import { Section } from "./section";
import { Clock, AlarmClock, BellRing, BarChart3, Smartphone } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "빠른 타임박스 생성",
    description: "드래그 앤 드롭과 자연어 입력으로 즉시 계획을 만듭니다.",
  },
  {
    icon: AlarmClock,
    title: "집중 타이머",
    description: "현재 타임박스의 진행률과 남은 시간을 실시간으로 표시합니다.",
  },
  {
    icon: BellRing,
    title: "알람·리마인더",
    description: "시작 전, 종료, 휴식 알림으로 집중 흐름을 유지합니다.",
  },
  {
    icon: BarChart3,
    title: "데일리·위클리 리포트",
    description: "완료율, 총 집중 시간, 패턴 그래프로 성과를 확인합니다.",
  },
  {
    icon: Smartphone,
    title: "멀티 디바이스",
    description: "데스크톱·모바일 브라우저에서 실시간으로 동기화됩니다.",
  },
];

export function Features() {
  return (
    <Section className="container mx-auto max-w-7xl px-6 py-20">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          핵심 기능
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          타임박스 집중 관리가 제공하는 생산성 향상 기능들을 확인하세요
        </p>
      </div>
      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <li
              key={index}
              className="group rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-lg hover:border-primary/20"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
