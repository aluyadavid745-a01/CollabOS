import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, Gift, Globe2, KeyRound, LogOut, Menu, MessageSquare, UserCircle, UserCog, Video, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Common/Button'
import type { AuthMode, AuthUser } from '../../pages/AuthPage'
import { prefetchRoute, prefetchRoutes } from '../../utils/prefetch'

interface NavbarProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onLogout: () => void
  onChangePassword: () => void
  onCustomizeProfile: () => void
}

const Navbar: React.FC<NavbarProps> = ({
  rememberedUser,
  onNavigate,
  onLogout,
  onChangePassword,
  onCustomizeProfile,
}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const accountMenuRef = React.useRef<HTMLDivElement>(null)
  const mobileAccountMenuRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideDesktopAccountMenu = accountMenuRef.current?.contains(target)
      const isInsideMobileAccountMenu = mobileAccountMenuRef.current?.contains(target)

      if (!isInsideDesktopAccountMenu && !isInsideMobileAccountMenu) {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const handleChangePassword = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    onChangePassword()
  }

  const handleCustomizeProfile = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    onCustomizeProfile()
  }

  const handleProfile = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    navigate('/profile')
  }

  const handleWebsiteBuilder = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    navigate('/dashboard/websites')
  }

  const handleTeamWorkspace = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    navigate('/workspace')
  }

  const handleMeetings = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    navigate('/meetings')
  }

  const handleGiftCards = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    navigate('/gift-cards')
  }

  const handleLogout = () => {
    setIsAccountOpen(false)
    setIsOpen(false)
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    setIsLogoutModalOpen(false)
    onLogout()
  }

  const warmAuth = () => prefetchRoute('auth')
  const warmEditProfile = () => prefetchRoute('editProfile')
  const warmWebsiteBuilder = () => prefetchRoutes(['websiteDashboard', 'websiteEditor', 'websitePreview'])
  const warmMeetings = () => prefetchRoute('meetings')
  const warmTeamWorkspace = () => prefetchRoute('teamWorkspace')
  const warmGiftCards = () => prefetchRoute('giftCards')

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200 bg-white/95 py-3 shadow-sm'
          : 'bg-white/80 py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold text-slate-950 group">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center transition-colors group-hover:bg-slate-800">
            <span className="text-white font-bold">C</span>
          </div>
          <span>CollabOS</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-950 transition-colors relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-950 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {rememberedUser ? (
            <div className="relative" ref={accountMenuRef}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAccountOpen((current) => !current)}
                onMouseEnter={() => prefetchRoutes(['profile', 'editProfile', 'websiteDashboard'])}
                onFocus={() => prefetchRoutes(['profile', 'editProfile', 'websiteDashboard'])}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
                className="gap-2"
              >
                Welcome, {rememberedUser.name.split(' ')[0]}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`}
                />
              </Button>

              {isAccountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/60"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfile}
                    onMouseEnter={() => prefetchRoute('profile')}
                    onFocus={() => prefetchRoute('profile')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserCircle className="w-4 h-4 text-slate-500" />
                    My profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleCustomizeProfile}
                    onMouseEnter={warmEditProfile}
                    onFocus={warmEditProfile}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserCog className="w-4 h-4 text-slate-500" />
                    Customize profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleTeamWorkspace}
                    onMouseEnter={warmTeamWorkspace}
                    onFocus={warmTeamWorkspace}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-300" />
                    Team Workspace
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleWebsiteBuilder}
                    onMouseEnter={warmWebsiteBuilder}
                    onFocus={warmWebsiteBuilder}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Globe2 className="w-4 h-4 text-slate-500" />
                    Website Builder
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleMeetings}
                    onMouseEnter={warmMeetings}
                    onFocus={warmMeetings}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Video className="w-4 h-4 text-emerald-300" />
                    Meetings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleGiftCards}
                    onMouseEnter={warmGiftCards}
                    onFocus={warmGiftCards}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Gift className="w-4 h-4 text-emerald-600" />
                    Gift Cards
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleChangePassword}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Change password
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <LogOut className="w-4 h-4 text-red-300" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('signin')} onMouseEnter={warmAuth} onFocus={warmAuth}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => onNavigate('signup')} onMouseEnter={warmAuth} onFocus={warmAuth}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => prefetchRoutes(['auth', 'profile', 'websiteDashboard'])}
          onFocus={() => prefetchRoutes(['auth', 'profile', 'websiteDashboard'])}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-t border-slate-200 bg-white shadow-sm"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          {rememberedUser ? (
            <div ref={mobileAccountMenuRef} className="pt-4 space-y-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                onClick={() => setIsAccountOpen((current) => !current)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
              >
                Welcome, {rememberedUser.name.split(' ')[0]}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`}
                />
              </Button>
              {isAccountOpen && (
                <div role="menu" className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfile}
                    onMouseEnter={() => prefetchRoute('profile')}
                    onFocus={() => prefetchRoute('profile')}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserCircle className="w-4 h-4 text-slate-500" />
                    My profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleCustomizeProfile}
                    onMouseEnter={warmEditProfile}
                    onFocus={warmEditProfile}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserCog className="w-4 h-4 text-slate-500" />
                    Customize profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleTeamWorkspace}
                    onMouseEnter={warmTeamWorkspace}
                    onFocus={warmTeamWorkspace}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-300" />
                    Team Workspace
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleWebsiteBuilder}
                    onMouseEnter={warmWebsiteBuilder}
                    onFocus={warmWebsiteBuilder}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Globe2 className="w-4 h-4 text-slate-500" />
                    Website Builder
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleMeetings}
                    onMouseEnter={warmMeetings}
                    onFocus={warmMeetings}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Video className="w-4 h-4 text-emerald-300" />
                    Meetings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleGiftCards}
                    onMouseEnter={warmGiftCards}
                    onFocus={warmGiftCards}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Gift className="w-4 h-4 text-emerald-600" />
                    Gift Cards
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleChangePassword}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    Change password
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                  >
                    <LogOut className="w-4 h-4 text-red-300" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setIsOpen(false)
                  onNavigate('signin')
                }}
                onMouseEnter={warmAuth}
                onFocus={warmAuth}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setIsOpen(false)
                  onNavigate('signup')
                }}
                onMouseEnter={warmAuth}
                onFocus={warmAuth}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-900/20">
            <div className="mb-5 flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Log out of CollabOS?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You will leave this workspace on this device. You can sign in again anytime.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  )
}

export default Navbar
