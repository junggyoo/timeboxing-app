"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<header className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="container mx-auto max-w-7xl px-6 py-20">
				<div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
					<div className="space-y-6">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
						>
							시간을 블록으로 계획하고
							<br />
							알림으로 지키는
							<br />
							<span className="text-primary">집중 관리</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-lg text-muted-foreground md:text-xl"
						>
							60초 온보딩으로 시작, 데스크톱·모바일 동기화, 집중·휴식
							리마인더까지 한 번에.
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="flex flex-col gap-3 sm:flex-row"
						>
							<Button asChild size="lg" className="text-base">
								<Link href="/signup" aria-label="지금 시작하기">
									지금 시작하기
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="text-base">
								<Link href="/login" aria-label="로그인">
									로그인
								</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</div>
		</header>
	);
}
