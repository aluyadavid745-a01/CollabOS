import React from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
} from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      section: 'Product',
      links: [
        { label: 'Product', href: '/product' },
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '/security' },
      ],
    },
    {
      section: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Investors', href: '/investors' },
        { label: 'Contact', href: '/contact' },
        { label: 'Customers', href: '/customers' },
      ],
    },
    {
      section: 'Resources',
      links: [
        { label: 'Help center', href: '/help' },
        { label: 'Solutions', href: '/solutions' },
        { label: 'Status', href: '/status' },
        { label: 'Admin analytics', href: '/admin/analytics' },
      ],
    },
    {
      section: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Security', href: '/security' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@collabos.dev', label: 'Email' },
  ]

  return (
    <footer className="relative border-t border-slate-200 bg-white">
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16 md:py-20">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <a href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
                <img src="/lll.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
                <span className="text-slate-950">CollabOS</span>
              </a>
              <p className="text-sm text-slate-500 mb-6">
                The operating system for modern teams.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-950 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>

            {/* Links Grid */}
            {footerLinks.map((group, index) => (
              <motion.div
                key={group.section}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              >
                <h4 className="font-semibold text-slate-950 mb-4">{group.section}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-slate-950 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 mb-8" />

          {/* Bottom Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-sm text-slate-500">
              © {currentYear} CollabOS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="/status" className="hover:text-slate-950 transition-colors">
                Status
              </a>
              <a href="/privacy" className="hover:text-slate-950 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-slate-950 transition-colors">
                Terms of Service
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
