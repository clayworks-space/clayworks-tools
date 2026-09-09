import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
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
          <h1 className="text-lg font-semibold mt-6">Create your Clayworks Tools account</h1>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
