import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { AuthMode, AuthUser } from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";
import { showToast } from "./utils/toast";
import { deleteCookie, getJsonCookie, hasCookieConsent, setCookie, setJsonCookie } from "./utils/cookies";
import { prefetchRoutes, prefetchRoutesOnIdle } from "./utils/prefetch";

const AppInstallPrompt = React.lazy(() => import("./components/AppInstallPrompt"));
const CookieConsent = React.lazy(() => import("./components/CookieConsent"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const loadAuthPage = () => import("./pages/AuthPage");
const AuthPage = React.lazy(loadAuthPage);
const EmailAction = React.lazy(() => import("./pages/EmailAction"));
const HomeDashboard = React.lazy(() => import("./pages/HomeDashboard"));
const NotificationCenter = React.lazy(() => import("./pages/NotificationCenter"));
const EditProfile = React.lazy(() => import("./pages/EditProfile"));
const FeatureDetail = React.lazy(() => import("./pages/FeatureDetail"));
const Profile = React.lazy(() => import("./pages/Profile"));
const AIWebsitePromptEditor = React.lazy(() => import("./pages/AIWebsitePromptEditor"));
const CodeWebsiteBuilder = React.lazy(() => import("./pages/CodeWebsiteBuilder"));
const WebsiteBuilderDashboard = React.lazy(() => import("./pages/WebsiteBuilderDashboard"));
const WebsiteBuilderEditor = React.lazy(() => import("./pages/WebsiteBuilderEditor"));
const WebsitePreview = React.lazy(() => import("./pages/WebsitePreview"));
const PublicWebsite = React.lazy(() => import("./pages/PublicWebsite"));
const PublicProfile = React.lazy(() => import("./pages/PublicProfile"));
const MeetingsWorkspace = React.lazy(() => import("./pages/MeetingsWorkspace"));
const SecureTeamWorkspace = React.lazy(() => import("./pages/SecureTeamWorkspace"));
const InviteJoin = React.lazy(() => import("./pages/InviteJoin"));
const GiftCardStudio = React.lazy(() => import("./pages/GiftCardStudio"));

const RouteShell = ({ label = "Opening..." }: { label?: string }) => (
  <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-500">
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold">{label}</span>
  </main>
);

const AUTH_REDIRECT_KEY = "collabos:post-auth-redirect";

function readStoredUser(key: string): AuthUser | null {
  if (!hasCookieConsent()) return null;
  return getJsonCookie<AuthUser>(key);
}

function getViewFromPath(pathname: string): AuthMode | "home" {
  if (pathname === "/signin") return "signin";
  if (pathname === "/get-started") return "signup";
  return "home";
}

function getPostAuthRedirect(state: unknown) {
  if (!state || typeof state !== "object" || !("from" in state)) return null;

  const from = (state as { from?: unknown }).from;
  return normalizePostAuthRedirect(from);
}

function normalizePostAuthRedirect(from: unknown) {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) return null;
  if (from === "/signin" || from === "/get-started") return null;

  return from;
}

function savePendingAuthRedirect(from: string) {
  if (typeof window === "undefined") return;
  const redirect = normalizePostAuthRedirect(from);
  if (!redirect) return;

  try {
    window.sessionStorage.setItem(AUTH_REDIRECT_KEY, redirect);
  } catch {
    // Router state remains the fallback if session storage is unavailable.
  }
}

function consumePendingAuthRedirect() {
  if (typeof window === "undefined") return null;

  try {
    const redirect = normalizePostAuthRedirect(window.sessionStorage.getItem(AUTH_REDIRECT_KEY));
    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    return redirect;
  } catch {
    return null;
  }
}

const AuthRedirect = ({ from }: { from: string }) => {
  React.useLayoutEffect(() => {
    savePendingAuthRedirect(from);
  }, [from]);

  return <Navigate to="/signin" replace state={{ from }} />;
};

function App() {
  const navigateRouter = useNavigate();
  const location = useLocation();
  const { firebaseUser, loading: authLoading, profile, setLocalProfileSeed } = useAuth();
  const view = getViewFromPath(location.pathname);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [createdAccount, setCreatedAccount] = React.useState<AuthUser | null>(() =>
    readStoredUser("collabos:createdAccount")
  );
  const rememberedUser = React.useMemo<AuthUser | null>(() => {
    if (profile) {
      return {
        name: profile.name,
        email: profile.email,
        workspace: user?.workspace || "CollabOS Workspace",
        verifiedAt: profile.updatedAt,
      };
    }

    if (firebaseUser?.email) {
      return {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0] || "CollabOS User",
        email: firebaseUser.email,
        workspace: user?.workspace || "CollabOS Workspace",
        verifiedAt: new Date().toISOString(),
      };
    }

    return user;
  }, [firebaseUser, profile, user]);

  React.useEffect(() => {
    if (!user) {
      setLocalProfileSeed(null);
      return;
    }

    setLocalProfileSeed({
      name: user.name,
      email: user.email,
      workspace: user.workspace,
    });
  }, [setLocalProfileSeed, user]);

  React.useEffect(() => {
    if (view !== "home") return;

    return prefetchRoutesOnIdle(["auth", "profile", "homeDashboard", "notifications", "editProfile", "websiteDashboard", "featureDetail", "teamWorkspace", "giftCards"], 1200);
  }, [view]);

  React.useEffect(() => {
    if (!rememberedUser && !firebaseUser) return;

    return prefetchRoutesOnIdle(
      ["profile", "homeDashboard", "notifications", "editProfile", "websiteDashboard", "websiteEditor", "websitePreview", "codeBuilder", "aiBuilder", "teamWorkspace", "giftCards"],
      900
    );
  }, [firebaseUser, rememberedUser]);

  const navigate = (nextView: AuthMode | "home") => {
    navigateRouter(nextView === "home" ? "/" : nextView === "signin" ? "/signin" : "/get-started");
  };

  const handleAuthenticated = (nextUser: AuthUser) => {
    if (hasCookieConsent()) {
      setCookie("collabos:lastEmail", nextUser.email);
      deleteCookie("collabos:createdAccount");
    }
    setUser(nextUser);
    setCreatedAccount(null);
    setLocalProfileSeed({
      name: nextUser.name,
      email: nextUser.email,
      workspace: nextUser.workspace,
    });
    prefetchRoutes(["profile", "homeDashboard", "notifications", "editProfile", "websiteDashboard", "websiteEditor", "websitePreview"]);
    navigateRouter(getPostAuthRedirect(location.state) || consumePendingAuthRedirect() || "/", { replace: true });
  };

  const handleSignupVerified = (nextUser: AuthUser) => {
    if (hasCookieConsent()) {
      setJsonCookie("collabos:createdAccount", nextUser);
      setCookie("collabos:lastEmail", nextUser.email);
    }
    setCreatedAccount(nextUser);
  };

  const handleLogout = async () => {
    const [{ signOut }, { getConfiguredAuth, isFirebaseConfigured }] = await Promise.all([
      import("firebase/auth"),
      import("./firebase/config"),
    ]);
    const auth = await getConfiguredAuth();

    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }

    deleteCookie("collabos:user");
    deleteCookie("collabos:createdAccount");
    setUser(null);
    setCreatedAccount(null);
    setLocalProfileSeed(null);
    navigate("home");
  };

  const handleChangePassword = async () => {
    const email = firebaseUser?.email || rememberedUser?.email;
    if (!email) return;

    const [{ sendPasswordResetEmail }, { getConfiguredAuth, isFirebaseConfigured }] = await Promise.all([
      import("firebase/auth"),
      import("./firebase/config"),
    ]);
    const auth = await getConfiguredAuth();

    if (auth && isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    }

    showToast({
      message: `Password change link sent to ${email}`,
      type: "success",
    });
  };

  const handleCustomizeProfile = () => {
    navigateRouter("/profile/edit");
  };

  const sharedPageProps = {
    rememberedUser,
    onNavigate: navigate,
    onLogout: handleLogout,
    onChangePassword: handleChangePassword,
    onCustomizeProfile: handleCustomizeProfile,
  };

  const protectedRoute = (element: React.ReactElement, label: string) => {
    if (authLoading) return <RouteShell label={label} />;
    if (!firebaseUser) return <AuthRedirect from={`${location.pathname}${location.search}`} />;
    return element;
  };

  if (view !== "home") {
    return (
      <>
        <React.Suspense fallback={<RouteShell label="Opening account..." />}>
          <AuthPage
            mode={view}
            rememberedUser={rememberedUser}
            createdAccount={createdAccount}
            onNavigate={navigate}
            onAuthenticated={handleAuthenticated}
            onSignupVerified={handleSignupVerified}
          />
        </React.Suspense>
        <React.Suspense fallback={null}>
          <AppInstallPrompt isAuthenticated={Boolean(firebaseUser)} />
          <CookieConsent />
        </React.Suspense>
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<RouteShell label="Opening CollabOS..." />}>
              <LandingPage {...sharedPageProps} />
            </React.Suspense>
          }
        />
        <Route
          path="/auth/action"
          element={
            <React.Suspense fallback={<RouteShell label="Verifying email..." />}>
              <EmailAction />
            </React.Suspense>
          }
        />
        <Route
          path="/features/:slug"
          element={
            <React.Suspense fallback={<RouteShell label="Opening feature..." />}>
              <FeatureDetail />
            </React.Suspense>
          }
        />
        <Route
          path="/home"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening dashboard..." />}>
              <HomeDashboard />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/notifications"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening notifications..." />}>
              <NotificationCenter />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/meetings"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening meetings..." />}>
              <MeetingsWorkspace />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/workspace"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening secure workspace..." />}>
              <SecureTeamWorkspace />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/gift-cards"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening gift cards..." />}>
              <GiftCardStudio />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/invite/:token"
          element={
            <React.Suspense fallback={<RouteShell label="Opening invitation..." />}>
              <InviteJoin />
            </React.Suspense>
          }
        />
        <Route
          path="/meetings/:roomId"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening meeting room..." />}>
              <MeetingsWorkspace />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/dashboard/websites"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening Website Builder..." />}>
              <WebsiteBuilderDashboard />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/builder/:siteId/code"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening code builder..." />}>
              <CodeWebsiteBuilder />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/builder/:siteId/ai"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening AI builder..." />}>
              <AIWebsitePromptEditor />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/builder/:siteId"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening editor..." />}>
              <WebsiteBuilderEditor />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/preview/:siteId"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening preview..." />}>
              <WebsitePreview />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/sites/:siteId"
          element={
            <React.Suspense fallback={<RouteShell label="Opening published site..." />}>
              <PublicWebsite />
            </React.Suspense>
          }
        />
        <Route
          path="/u/:username"
          element={
            <React.Suspense fallback={<RouteShell label="Opening public profile..." />}>
              <PublicProfile />
            </React.Suspense>
          }
        />
        <Route
          path="/profile"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening profile..." />}>
              <Profile {...sharedPageProps} />
            </React.Suspense>,
            "Checking account..."
          )}
        />
        <Route
          path="/profile/edit"
          element={protectedRoute(
            <React.Suspense fallback={<RouteShell label="Opening editor..." />}>
              <EditProfile />
            </React.Suspense>,
            "Checking account..."
          )}
        />
      </Routes>
      <React.Suspense fallback={null}>
        <AppInstallPrompt isAuthenticated={Boolean(firebaseUser)} />
        <CookieConsent />
      </React.Suspense>
    </>
  );
}

export default App;
