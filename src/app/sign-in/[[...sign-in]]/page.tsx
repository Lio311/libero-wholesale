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
        <div className="w-full [&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-card]:shadow-2xl [&_.cl-card]:border [&_.cl-card]:border-white/10 [&_.cl-card]:bg-zinc-950/80 [&_.cl-card]:backdrop-blur-xl [&_.cl-header]:hidden">
          <SignIn 
            appearance={{
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'transparent',
                colorText: 'white',
                colorInputText: 'white',
                colorInputBackground: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
              },
              elements: {
                rootBox: "w-full",
                card: "w-full rounded-2xl p-6 sm:p-8",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all rounded-xl h-12 shadow-sm font-medium",
                socialButtonsBlockButtonText: "text-white font-semibold",
                socialButtonsProviderIcon: "mr-2 scale-110",
                dividerText: "text-zinc-500 font-medium px-4",
                dividerLine: "bg-white/10",
                formFieldLabel: "text-zinc-300 font-semibold mb-1.5",
                formFieldInput: "bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all shadow-sm",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg w-full mt-2 border-0",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-primary hover:text-primary/90 font-bold",
                formFieldSuccessText: "text-green-400",
                formFieldErrorText: "text-red-400 font-medium",
                identityPreviewText: "text-white font-medium",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
                alternativeMethodsBlockButton: "text-zinc-300 hover:text-white hover:bg-white/5 border-white/10",
                alternativeMethodsBlockButtonText: "text-zinc-300",
                otpCodeFieldInput: "bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
