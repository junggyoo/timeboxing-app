import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/constants/env";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const cookieStore = await cookies();

		const supabase = createServerClient(
			env.NEXT_PUBLIC_SUPABASE_URL,
			env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					},
				},
			}
		);

		const { data } = await supabase.auth.exchangeCodeForSession(code);

		// Create profile if it doesn't exist
		if (data.user) {
			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", data.user.id)
				.single();

			if (!existingProfile) {
				const nickname =
					data.user.user_metadata?.nickname ||
					data.user.user_metadata?.full_name ||
					data.user.email?.split("@")[0] ||
					"User";

				await supabase.from("profiles").insert({
					id: data.user.id,
					email: data.user.email!,
					nickname,
				});
			}
		}
	}

	return NextResponse.redirect(new URL("/dashboard", request.url));
}
