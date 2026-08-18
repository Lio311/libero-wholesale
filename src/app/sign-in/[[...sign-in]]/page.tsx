import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl mb-6 inline-block">
            <img src="/libero-w-white.png" alt="Libero Logo" className="w-[240px] h-auto object-contain mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            ברוכים הבאים למערכת ההזמנות
          </h1>
          <p className="text-zinc-400 text-sm">
            היכנסו עם החשבון שלכם כדי להמשיך
          </p>
        </div>

        {/* Clerk SignIn */}
        <div className="w-full max-w-sm [&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-header]:!hidden [&_.cl-footer]:!hidden [&_.cl-dividerRow]:!hidden [&_.cl-logoBox]:!hidden">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full rounded-2xl p-6 sm:p-8 shadow-2xl",
                formButtonPrimary: "bg-black text-white hover:bg-zinc-800 transition-all font-bold h-11",
                footerAction: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                logoBox: "hidden",
                footer: "hidden",
                header: "hidden",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
