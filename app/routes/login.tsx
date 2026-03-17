// ============================================
// Login Route — standalone authentication screen (outside _app layout)
// ============================================

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { LogoFull } from "~/components/layout/logo";
import { Lock } from "lucide-react";
import { GoogleIcon, MicrosoftIcon, AtlassianIcon } from "~/lib/brand-icons";

/** Generates floating particle elements for the hero background */
function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 10}s`,
        delay: `${Math.random() * 10}s`,
        size: `${1 + Math.random() * 2}px`,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="login-particle absolute rounded-full bg-violet-2 opacity-0 -bottom-[10px]"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

/** Login route — SSO-only authentication screen with hero branding */
export default function LoginRoute() {
  const navigate = useNavigate();

  // Redirect to app on SSO button click (mock behavior)
  const handleSSO = () => {
    navigate("/chat");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden max-[900px]:flex-col">
      {/* LEFT — Hero / Brand */}
      <div
        className="login-hero flex-1 flex flex-col justify-center items-center relative overflow-hidden max-[900px]:flex-[0_0_220px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(116,65,143,0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 70% 60%, rgba(93,53,94,0.2) 0%, transparent 70%), radial-gradient(ellipse 90% 80% at 50% 50%, rgba(42,24,46,0.6) 0%, transparent 100%), #0e0d11",
        }}
      >
        <div className="login-scanlines absolute inset-0 pointer-events-none z-[3]" />
        <Particles />

        <div className="relative z-[2] flex flex-col items-center gap-8 max-[900px]:gap-4">
          <LogoFull />
          <div
            className="font-[family-name:var(--pixel)] text-[3.25rem] text-[#e0dee5] tracking-[6px] leading-none max-[900px]:text-[2.25rem] max-[900px]:tracking-[4px]"
            style={{
              textShadow:
                "0 0 40px rgba(116,65,143,0.5), 0 2px 0 rgba(0,0,0,0.6)",
            }}
          >
            MEDICI
          </div>
          <div className="font-mono text-[0.8125rem] text-[rgba(163,131,180,0.7)] tracking-[0.25em] uppercase">
            Applied Intelligence for Institutional Finance
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center z-[2]">
          <div className="font-mono text-[0.625rem] text-[rgba(163,131,180,0.35)] tracking-[0.1em] uppercase">
            Medici Intelligence Systems &middot; v2.1
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Panel */}
      <div className="w-[460px] shrink-0 flex flex-col justify-center items-center p-10 bg-white border-l-2 border-taupe-2 relative dark:bg-surface-1 dark:border-surface-3 max-[900px]:w-full max-[900px]:border-l-0 max-[900px]:border-t-2 max-[900px]:border-taupe-2">
        <div className="w-full max-w-[340px]">
          <div className="mb-8">
            <div className="font-[family-name:var(--pixel)] text-2xl text-taupe-5 tracking-[0.5px] mb-2 dark:text-taupe-1">
              Sign in
            </div>
            <div className="font-mono text-xs text-taupe-3 leading-relaxed">
              Access your workspace to continue.
            </div>
          </div>

          {/* SSO Providers */}
          <div className="flex flex-col gap-2 mb-6">
            <button
              type="button"
              className="flex items-center gap-3 w-full py-[11px] px-4 font-mono text-xs font-semibold text-taupe-5 bg-off-white border-2 border-t-taupe-1 border-l-taupe-1 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer uppercase tracking-[0.05em] transition-all duration-150 hover:bg-berry-1 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-b-berry-4 hover:border-r-berry-4 hover:text-berry-5 active:border-t-berry-4 active:border-l-berry-4 active:border-b-berry-2 active:border-r-berry-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:text-taupe-1 dark:bg-surface-2 dark:border-t-surface-3 dark:border-l-surface-3 dark:border-b-surface-0 dark:border-r-surface-0 dark:hover:bg-berry-4 dark:hover:border-t-berry-3 dark:hover:border-l-berry-3 dark:hover:border-b-berry-5 dark:hover:border-r-berry-5 dark:hover:text-berry-1 dark:active:border-t-berry-5 dark:active:border-l-berry-5 dark:active:border-b-berry-3 dark:active:border-r-berry-3"
              onClick={handleSSO}
            >
              <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full py-[11px] px-4 font-mono text-xs font-semibold text-taupe-5 bg-off-white border-2 border-t-taupe-1 border-l-taupe-1 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer uppercase tracking-[0.05em] transition-all duration-150 hover:bg-berry-1 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-b-berry-4 hover:border-r-berry-4 hover:text-berry-5 active:border-t-berry-4 active:border-l-berry-4 active:border-b-berry-2 active:border-r-berry-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:text-taupe-1 dark:bg-surface-2 dark:border-t-surface-3 dark:border-l-surface-3 dark:border-b-surface-0 dark:border-r-surface-0 dark:hover:bg-berry-4 dark:hover:border-t-berry-3 dark:hover:border-l-berry-3 dark:hover:border-b-berry-5 dark:hover:border-r-berry-5 dark:hover:text-berry-1 dark:active:border-t-berry-5 dark:active:border-l-berry-5 dark:active:border-b-berry-3 dark:active:border-r-berry-3"
              onClick={handleSSO}
            >
              <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                <MicrosoftIcon />
              </span>
              Continue with Microsoft
            </button>
            <button
              type="button"
              className="flex items-center gap-3 w-full py-[11px] px-4 font-mono text-xs font-semibold text-taupe-5 bg-off-white border-2 border-t-taupe-1 border-l-taupe-1 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer uppercase tracking-[0.05em] transition-all duration-150 hover:bg-berry-1 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-b-berry-4 hover:border-r-berry-4 hover:text-berry-5 active:border-t-berry-4 active:border-l-berry-4 active:border-b-berry-2 active:border-r-berry-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:text-taupe-1 dark:bg-surface-2 dark:border-t-surface-3 dark:border-l-surface-3 dark:border-b-surface-0 dark:border-r-surface-0 dark:hover:bg-berry-4 dark:hover:border-t-berry-3 dark:hover:border-l-berry-3 dark:hover:border-b-berry-5 dark:hover:border-r-berry-5 dark:hover:text-berry-1 dark:active:border-t-berry-5 dark:active:border-l-berry-5 dark:active:border-b-berry-3 dark:active:border-r-berry-3"
              onClick={handleSSO}
            >
              <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                <AtlassianIcon />
              </span>
              Continue with Atlassian
            </button>
          </div>

          <div className="mt-7 text-center">
            <div className="font-mono text-[0.6875rem] text-taupe-3 leading-relaxed">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="text-violet-3 no-underline font-semibold hover:text-berry-3 dark:text-violet-2 dark:hover:text-berry-2"
              >
                Request access
              </a>
              <br />
              <a
                href="#"
                className="text-violet-3 no-underline font-semibold hover:text-berry-3 dark:text-violet-2 dark:hover:text-berry-2"
              >
                Terms of Service
              </a>{" "}
              &middot;{" "}
              <a
                href="#"
                className="text-violet-3 no-underline font-semibold hover:text-berry-3 dark:text-violet-2 dark:hover:text-berry-2"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 flex items-center gap-1.5 font-mono text-[0.625rem] text-taupe-2 tracking-[0.05em] uppercase dark:text-taupe-3">
          <Lock className="size-3" />
          Secured by Clerk
        </div>
      </div>
    </div>
  );
}
