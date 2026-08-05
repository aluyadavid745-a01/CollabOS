import assert from 'node:assert/strict'

import { createDefaultProfile, isLegacyGenericProfile, resetLegacyGenericProfile } from '../src/types/profile.ts'
import { createBuilderElementCore, createStarterWebsite, createWebsiteFromTemplate } from '../src/data/websiteProjectFactory.ts'

const profile = createDefaultProfile({
  uid: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
})

assert.equal(profile.uid, 'user-1')
assert.equal(profile.name, 'Ada Lovelace')
assert.equal(profile.email, 'ada@example.com')
assert.equal(profile.username, 'adalovelace')
assert.equal(profile.bio, '')
assert.deepEqual(profile.projects, [])

const legacyProfile = {
  name: 'David Aluya',
  username: 'davidcodes',
  email: 'david@collabos.dev',
  bio: 'Full-stack developer building products and collaborating with developers.',
  socials: { github: 'https://github.com/davidcodes' },
  projects: [{ id: 'old', name: 'Old', description: 'Old', role: 'Old', technologies: [], link: '', status: 'Active' }],
  createdAt: '2026-01-01T00:00:00.000Z',
}
const resetProfile = resetLegacyGenericProfile(legacyProfile, {
  uid: 'mum-user',
  name: 'mum',
  email: 'mum@gmail.com',
})

assert.equal(isLegacyGenericProfile(legacyProfile), true)
assert.equal(resetProfile.uid, 'mum-user')
assert.equal(resetProfile.name, 'mum')
assert.equal(resetProfile.email, 'mum@gmail.com')
assert.equal(resetProfile.bio, '')
assert.deepEqual(resetProfile.projects, [])
assert.equal(resetProfile.socials.github, '')

const project = createStarterWebsite('owner-1')
const initialElementCount = project.pages[0].elements.length

assert.equal(project.ownerId, 'owner-1')
assert.equal(project.status, 'draft')
assert.equal(project.pages[0].slug, '/')
assert.equal(project.pages[0].isHome, true)
assert.equal(initialElementCount, 4)

const templateProject = createWebsiteFromTemplate('saas-launch', 'owner-2')
assert.equal(templateProject.ownerId, 'owner-2')
assert.equal(templateProject.name, 'SaaS Launch')
assert.ok(templateProject.pages[0].elements.some((element) => element.type === 'pricing'))
assert.ok(templateProject.pages[0].elements.some((element) => element.type === 'faq'))

const heading = createBuilderElementCore('heading')
assert.equal(heading.type, 'heading')
assert.equal(heading.style.responsive?.mobile?.fontSize, '30px')

console.log('Smoke tests passed')
