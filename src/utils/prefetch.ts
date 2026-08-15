export type PrefetchTarget =
  | 'auth'
  | 'profile'
  | 'homeDashboard'
  | 'notifications'
  | 'editProfile'
  | 'websiteDashboard'
  | 'websiteEditor'
  | 'websitePreview'
  | 'publicWebsite'
  | 'publicProfile'
  | 'codeBuilder'
  | 'aiBuilder'
  | 'featureDetail'
  | 'meetings'
  | 'teamWorkspace'
  | 'giftCards'
  | 'inviteJoin'

const preloaders: Record<PrefetchTarget, () => Promise<unknown>> = {
  auth: () =>
    Promise.all([
      import('../pages/AuthPage'),
      import('firebase/auth'),
      import('../firebase/config').then((config) => config.getConfiguredAuth()),
    ]),
  profile: () => import('../pages/Profile'),
  homeDashboard: () => import('../pages/HomeDashboard'),
  notifications: () => import('../pages/NotificationCenter'),
  editProfile: () => import('../pages/EditProfile'),
  websiteDashboard: () => import('../pages/WebsiteBuilderDashboard'),
  websiteEditor: () =>
    Promise.all([
      import('../pages/WebsiteBuilderEditor'),
      import('../components/WebsiteBuilder/BuilderToolbar'),
      import('../components/WebsiteBuilder/BuilderSidebar'),
      import('../components/WebsiteBuilder/BuilderCanvas'),
      import('../components/WebsiteBuilder/PropertiesPanel'),
      import('../components/WebsiteBuilder/BuilderBottomBar'),
    ]),
  websitePreview: () => import('../pages/WebsitePreview'),
  publicWebsite: () => import('../pages/PublicWebsite'),
  publicProfile: () => import('../pages/PublicProfile'),
  codeBuilder: () => import('../pages/CodeWebsiteBuilder'),
  aiBuilder: () => import('../pages/AIWebsitePromptEditor'),
  featureDetail: () => import('../pages/FeatureDetail'),
  meetings: () =>
    Promise.all([
      import('../pages/MeetingsWorkspace'),
      import('@livekit/components-react'),
      import('livekit-client'),
    ]),
  teamWorkspace: () => import('../pages/SecureTeamWorkspace'),
  giftCards: () => import('../pages/GiftCardStudio'),
  inviteJoin: () => import('../pages/InviteJoin'),
}

const warmed = new Set<PrefetchTarget>()

export const prefetchRoute = (target: PrefetchTarget) => {
  if (warmed.has(target)) return

  warmed.add(target)
  void preloaders[target]().catch(() => {
    warmed.delete(target)
  })
}

export const prefetchRoutes = (targets: PrefetchTarget[]) => {
  targets.forEach(prefetchRoute)
}

export const prefetchRoutesOnIdle = (targets: PrefetchTarget[], timeout = 1800) => {
  const run = () => prefetchRoutes(targets)

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(run, { timeout })
    return () => window.cancelIdleCallback(idleId)
  }

  const timeoutId = globalThis.setTimeout(run, Math.min(timeout, 1000))
  return () => globalThis.clearTimeout(timeoutId)
}
