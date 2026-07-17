import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full bg-background">
      {/* Dynamic Background Elements matching our site theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Login Box Container */}
      <div className="relative z-10 w-full max-w-md p-4 flex flex-col items-center">
        <img src="/logo2.png" alt="Libero Logo" className="h-16 mb-8 drop-shadow-2xl brightness-200" />
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full",
              headerTitle: "text-foreground font-bold text-2xl text-center",
              headerSubtitle: "text-muted-foreground text-center",
              socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-foreground transition-all",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              dividerText: "text-muted-foreground",
              dividerLine: "bg-white/10",
              formFieldLabel: "text-foreground font-medium",
              formFieldInput: "bg-black/50 border-white/10 text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-11 transition-all",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-bold text-base transition-all",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:text-primary/90 font-medium"
            }
          }}
        />
      </div>
    </div>
  );
}
