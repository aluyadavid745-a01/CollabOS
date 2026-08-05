import React from 'react'
import type { PrivacySettings as PrivacySettingsType } from '../types/profile'

interface PrivacySettingsProps {
  settings: PrivacySettingsType
  onChange: (settings: PrivacySettingsType) => void
  theme?: 'light' | 'dark'
}

const privacyOptions: Array<{
  key: keyof PrivacySettingsType
  label: string
  description: string
}> = [
  { key: 'showEmail', label: 'Show email', description: 'Display your email on your public profile.' },
  { key: 'showOnlineStatus', label: 'Show online status', description: 'Let teammates see when you are online.' },
  { key: 'allowMessages', label: 'Allow messages', description: 'Let people message you from your profile.' },
  {
    key: 'allowCollaborationRequests',
    label: 'Allow collaboration requests',
    description: 'Let others invite you to projects and teams.',
  },
]

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onChange, theme = 'light' }) => {
  const isDark = theme === 'dark'

  return (
  <section
    className={
      isDark
        ? 'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl'
        : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60'
    }
  >
    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>Privacy</h2>
    <div className="mt-4 space-y-3">
      {privacyOptions.map((option) => (
        <label
          key={option.key}
          className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 ${
            isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span>
            <span className={`block font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{option.label}</span>
            <span className={`mt-1 block text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {option.description}
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings[option.key]}
            onChange={(event) =>
              onChange({
                ...settings,
                [option.key]: event.target.checked,
              })
            }
            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      ))}
    </div>
  </section>
  )
}

export default PrivacySettings
