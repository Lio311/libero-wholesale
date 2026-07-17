import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex bg-background" dir="rtl">
      {/* Right Side - Branding (Visible on md and up) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative bg-zinc-950 flex-col items-center justify-center overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-12 text-center">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl mb-8">
            <img src="/libero-w-white.png" alt="Libero Logo" className="w-[300px] h-auto object-contain drop-shadow-xl mx-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            ברוכים הבאים למערכת ההזמנות
          </h1>
          <p className="text-zinc-400 text-lg max-w-[500px] leading-relaxed">
            הזמינו מוצרים לעסק שלכם בקלות, עקבו אחר משלוחים ונהלו את כל הרכישות במקום אחד נוח ומתקדם.
          </p>
        </div>
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-12 relative bg-background">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="md:hidden mb-12">
          <img src="/libero-w.png" alt="Libero Logo" className="h-16 object-contain dark:hidden" />
          <img src="/libero-w-white.png" alt="Libero Logo" className="h-16 object-contain hidden dark:block" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 text-center md:text-right">
            <h2 className="text-3xl font-bold tracking-tight mb-2">התחברות</h2>
            <p className="text-muted-foreground">הכנס את הפרטים שלך כדי להתחבר לחשבון</p>
          </div>

          <div className="[&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-header]:hidden">
            <SignIn 
              appearance={{
                variables: {
                  colorPrimary: 'hsl(var(--primary))',
                  colorBackground: 'transparent',
                  colorInputBackground: 'transparent',
                  colorInputText: 'hsl(var(--foreground))',
                  colorShimmer: 'hsl(var(--muted))',
                  borderRadius: '0.75rem',
                },
                elements: {
                  rootBox: "w-full",
                  card: "w-full bg-transparent shadow-none border-0 p-0 m-0",
                  socialButtonsBlockButton: "bg-muted/30 border-border hover:bg-muted/50 text-foreground transition-all rounded-xl h-12 shadow-sm font-medium",
                  socialButtonsBlockButtonText: "text-foreground font-semibold",
                  socialButtonsProviderIcon: "mr-2 scale-110",
                  dividerText: "text-muted-foreground/70 font-medium px-4",
                  dividerLine: "bg-border",
                  formFieldLabel: "text-foreground font-semibold mb-1.5",
                  formFieldInput: "bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-12 rounded-xl transition-all shadow-sm",
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg w-full mt-2",
                  footerActionText: "text-muted-foreground",
                  footerActionLink: "text-primary hover:text-primary/90 font-bold",
                  formFieldSuccessText: "text-green-500",
                  formFieldErrorText: "text-destructive font-medium",
                  identityPreviewText: "text-foreground font-medium",
                  identityPreviewEditButton: "text-primary hover:text-primary/80",
                }
              }}
            />
          </div>
          
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>הסרט הכתום "Development mode" מופיע רק בסביבת פיתוח וייעלם ברגע שהאתר יעלה לאוויר.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
