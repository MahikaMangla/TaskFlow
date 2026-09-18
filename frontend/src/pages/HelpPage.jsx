import { useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Mail,
  MessageCircle,
  Search,
} from 'lucide-react'

import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'

const faqs = [
  {
    question: 'How do I create a project?',
    answer:
      'Open Projects from the sidebar and use the create project action to start a new project.',
  },
  {
    question: 'How do I create and assign a task?',
    answer:
      'Open Tasks, create a task and assign it to a team member. You can also associate the task with a project or sprint.',
  },
  {
    question: 'How does team workload work?',
    answer:
      'Workload is calculated from the tasks assigned to each team member and their available capacity.',
  },
  {
    question: 'How do I manage sprints?',
    answer:
      'Open Sprints to review sprint progress, tasks and performance. Open an individual sprint for detailed information.',
  },
  {
    question: 'Where can I see project progress?',
    answer:
      'Project progress is available from the Projects section and the Reports dashboard.',
  },
]

const categories = [
  {
    icon: BookOpen,
    title: 'Getting started',
    description: 'Learn the basics of projects, tasks and sprints.',
  },
  {
    icon: CircleHelp,
    title: 'Common questions',
    description: 'Quick answers to frequently asked questions.',
  },
  {
    icon: MessageCircle,
    title: 'TaskFlow support',
    description: 'Need help with something specific? Contact support.',
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return faqs

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-sm font-medium text-accent">Help Center</p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          How can we help?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Find answers, learn how TaskFlow works, or get in touch with support.
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary"
          strokeWidth={1.5}
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search help articles and FAQs..."
          className="h-12 w-full rounded-xl border border-border bg-surface-raised pl-12 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon

          return (
            <Card key={category.title} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>

              <h2 className="mt-4 font-semibold text-text-primary">
                {category.title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {category.description}
              </p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
          </CardHeader>

          <div className="divide-y divide-border-subtle">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index

                return (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-text-primary">
                        {faq.question}
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {isOpen && (
                      <p className="mt-3 pr-8 text-sm leading-6 text-text-secondary">
                        {faq.answer}
                      </p>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="py-10 text-center text-sm text-text-secondary">
                No help articles found.
              </div>
            )}
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Contact support</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <p className="text-sm leading-6 text-text-secondary">
              Can't find what you're looking for? Our support team can help you
              with your TaskFlow workspace.
            </p>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                window.location.href = 'mailto:support@taskflow.app'
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}