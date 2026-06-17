import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", error);

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createServerSupabaseClient();

  if (code && supabase) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (exchangeError) {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("next", next);
      loginUrl.searchParams.set("error", exchangeError.message);

      return NextResponse.redirect(loginUrl);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: user.user_metadata.display_name ?? user.email ?? null,
          role: "manager",
        },
        {
          onConflict: "id",
          ignoreDuplicates: true,
        },
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
