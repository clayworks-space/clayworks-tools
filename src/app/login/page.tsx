import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/clayworks-logo.webp"
            alt="Clayworks"
            width={56}
            height={56}
            className="inline-block rounded-xl"
          />
          <div className="text-[10px] tracking-widest text-muted mt-2">
            HUMANSENSE AT WORK&reg;
          </div>
          <h1 className="text-lg font-semibold mt-6">Sign in to Clayworks Tools</h1>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <LoginForm next={next || "/dashboard"} />
        </div>
      </div>
    </div>
  );
}
