import { Mail, Github, Linkedin } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Card } from '@/components/ui/Card';

export const metadata = { title: 'Contact' };

import { BackButton } from '@/components/common/BackButton';

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@aiflightwise.app',
    href: 'mailto:hello@aiflightwise.app',
  },
  {
    icon: Github,
    label: 'GitHub Repository',
    value: 'github.com/RahulKumarsb-45/AI-FlightWise',
    href: 'https://github.com/RahulKumarsb-45/AI-FlightWise',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Connect for product management or engineering collaboration',
    href: 'https://linkedin.com',
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <BackButton />
      <main id="main-content" className="container-page max-w-3xl py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-electric-50 px-3 py-1 text-xs font-semibold text-electric-700 border border-electric-200/60 mb-3">
          Direct Channels
        </span>
        <h1 className="font-display text-display-md text-ink-900">Get in Touch</h1>
        <p className="mt-2 text-sm text-ink-500 max-w-xl">
          Have questions regarding the multi-factor flight optimization algorithms, Shreya AI integration, or architecture? Reach out directly.
        </p>

        <div className="mt-8 space-y-3.5">
          {CHANNELS.map((channel) => (
            <a key={channel.label} href={channel.href} target="_blank" rel="noreferrer" className="block">
              <Card className="flex items-center gap-4 rounded-2xl border border-ink-100/90 p-5 shadow-soft transition-all hover:border-electric-300 hover:shadow-premium hover:bg-electric-50/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-electric-50 text-electric-600 border border-electric-100">
                  <channel.icon className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-sm font-bold text-ink-900">{channel.label}</span>
                  <span className="block text-xs text-ink-500 mt-0.5">{channel.value}</span>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
