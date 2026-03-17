// ============================================
// Login Route — standalone authentication screen (outside _app layout)
// ============================================

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { LogoFull } from "~/components/layout/logo";
import { Lock } from "lucide-react";
import { GoogleIcon, MicrosoftIcon, AtlassianIcon } from "~/lib/brand-icons";
import styles from "./login.module.css";

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
    <div className={styles.particles}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
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
    <div className={styles.loginFrame}>
      {/* LEFT — Hero / Brand */}
      <div className={styles.loginHero}>
        <div className={styles.scanlines} />
        <Particles />

        <div className={styles.heroContent}>
          <LogoFull />
          <div className={styles.heroWordmark}>MEDICI</div>
          <div className={styles.heroTagline}>
            Applied Intelligence for Institutional Finance
          </div>
        </div>

        <div className={styles.heroFooter}>
          <div className={styles.heroFooterText}>
            Medici Intelligence Systems &middot; v2.1
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Panel */}
      <div className={styles.loginAuth}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authTitle}>Sign in</div>
            <div className={styles.authSubtitle}>
              Access your workspace to continue.
            </div>
          </div>

          {/* SSO Providers */}
          <div className={styles.ssoButtons}>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <GoogleIcon />
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <MicrosoftIcon />
              </span>
              Continue with Microsoft
            </button>
            <button
              type="button"
              className={styles.ssoBtn}
              onClick={handleSSO}
            >
              <span className={styles.ssoIcon}>
                <AtlassianIcon />
              </span>
              Continue with Atlassian
            </button>
          </div>

          <div className={styles.authFooter}>
            <div className={styles.authFooterText}>
              Don&apos;t have an account?{" "}
              <a href="#" className={styles.authFooterLink}>
                Request access
              </a>
              <br />
              <a href="#" className={styles.authFooterLink}>
                Terms of Service
              </a>{" "}
              &middot;{" "}
              <a href="#" className={styles.authFooterLink}>
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className={styles.authBadge}>
          <Lock className="size-3" />
          Secured by Clerk
        </div>
      </div>
    </div>
  );
}
