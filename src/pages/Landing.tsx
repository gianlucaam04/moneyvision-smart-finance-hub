import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  PieChart,
  LineChart,
  User,
  Briefcase,
  Users,
  ShieldCheck,
  ArrowRight,
  Mail,
} from 'lucide-react';

const CONTACT_EMAIL = 'amministrazione@moneyvision.it';

const features = [
  {
    icon: Wallet,
    title: 'Expense tracking',
    description:
      'Record income and expenses in seconds and keep every transaction organized by category and date.',
  },
  {
    icon: PieChart,
    title: 'Budget visibility',
    description:
      'See where your money goes with clear breakdowns, monthly summaries and goal tracking at a glance.',
  },
  {
    icon: LineChart,
    title: 'Financial insights',
    description:
      'Turn your data into trends and reports that help you understand spending and plan ahead with confidence.',
  },
];

const audiences = [
  {
    icon: User,
    title: 'Individuals',
    description:
      'Keep personal finances under control and build better money habits over time.',
  },
  {
    icon: Briefcase,
    title: 'Freelancers',
    description:
      'Separate business and personal cash flow and stay ready for tax season.',
  },
  {
    icon: Users,
    title: 'Small teams',
    description:
      'Share a clear view of budgets and spending so everyone stays aligned.',
  },
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-brand-accent dark:bg-gray-950 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-brand-light bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <img
              src="/icons/android-chrome-192x192.png"
              alt="MoneyVision logo"
              className="h-9 w-9 rounded-xl shadow-sm"
              width={36}
              height={36}
            />
            <span className="text-lg font-bold text-brand-primary">MoneyVision</span>
          </a>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:from-brand-accent hover:to-brand-primary"
            >
              <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
            </Button>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-white to-brand-light/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-primary dark:bg-gray-900/70">
              iOS app coming soon
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-brand-accent dark:text-white sm:text-6xl">
              MoneyVision
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-accent/80 dark:text-gray-300 sm:text-xl">
              A smart financial tracker that helps you record expenses,
              understand your budget, and make clearer money decisions.
              Now being rebuilt as a native iOS app.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 w-full bg-gradient-to-r from-brand-primary to-brand-secondary px-8 text-base text-white hover:from-brand-accent hover:to-brand-primary sm:w-auto"
              >
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  Get in touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Product overview */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-brand-accent dark:text-white sm:text-4xl">
              Everything you need to stay on top of your money
            </h2>
            <p className="mt-4 text-brand-accent/70 dark:text-gray-400">
              Simple tools that give you a complete and up-to-date picture of your finances.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-brand-light bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-primary dark:bg-brand-primary/20">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-brand-accent dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-brand-accent/70 dark:text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Who it is for */}
        <section className="bg-brand-light/40 py-16 dark:bg-gray-900/40 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-brand-accent dark:text-white sm:text-4xl">
                Built for the way you work
              </h2>
              <p className="mt-4 text-brand-accent/70 dark:text-gray-400">
                Whether you manage personal or professional finances, MoneyVision adapts to you.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {audiences.map((audience) => (
                <article
                  key={audience.title}
                  className="flex flex-col items-start rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <audience.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-brand-accent dark:text-white">
                    {audience.title}
                  </h3>
                  <p className="mt-2 text-brand-accent/70 dark:text-gray-400">
                    {audience.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why MoneyVision */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-3xl border border-brand-light bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand-primary dark:bg-brand-primary/20">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-brand-accent dark:text-white sm:text-3xl">
              Why MoneyVision
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-accent/80 dark:text-gray-300">
              Most people lose track of their finances because the tools are either too
              complex or too limited. MoneyVision keeps things clear: fast data entry,
              meaningful summaries, and insights you can act on. No spreadsheets to
              maintain, no clutter, just a straightforward view of your financial life.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-light bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <img
                  src="/icons/android-chrome-192x192.png"
                  alt="MoneyVision logo"
                  className="h-8 w-8 rounded-lg"
                  width={32}
                  height={32}
                />
                <span className="text-base font-bold text-brand-primary">MoneyVision</span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-brand-accent/70 dark:text-gray-400">
                Smart financial tracking for individuals, freelancers and small teams.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
              <span className="text-sm font-medium text-brand-accent/80 dark:text-gray-300">
                iOS app coming soon
              </span>
            </div>
          </div>
          <div className="mt-10 border-t border-brand-light pt-6 text-center text-sm text-brand-accent/60 dark:border-gray-800 dark:text-gray-500">
            © {new Date().getFullYear()} MoneyVision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
