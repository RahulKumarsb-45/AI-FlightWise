'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send, Sparkles, ArrowRight, Bot, RotateCcw, Compass, Clock, Plane } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatInr } from '@/utils/format';
import { cn } from '@/lib/utils';
import { trackAIAgentMessage } from '@/lib/analytics';

const STARTER_PROMPTS = [
  {
    icon: Compass,
    title: 'Budget Exploration',
    prompt: 'I have ₹80,000 and want to visit 2 European countries with the best balance of cost and flight duration',
  },
  {
    icon: Clock,
    title: 'Flexible Timing',
    prompt: "I'm flexible on travel dates. Where can I fly round-trip from Mumbai under ₹35,000 in the next 2 months?",
  },
  {
    icon: Plane,
    title: 'Fastest vs Cheapest',
    prompt: 'Planning a trip for 2 people to Tokyo. Compare direct flight premiums against 1-stop layovers',
  },
];

function ExtractedSummary({ params }) {
  if (!params) return null;
  const chips = [];
  if (params.originCity) chips.push(`From ${params.originCity}`);
  if (params.destinationCountries?.length) chips.push(params.destinationCountries.join(', '));
  if (params.dateFlexible) chips.push('Flexible dates');
  else if (params.departureDate) chips.push(`Depart ${params.departureDate}`);
  if (params.travelers) chips.push(`${params.travelers} traveler${params.travelers > 1 ? 's' : ''}`);
  if (params.budgetInr) chips.push(`Budget: ${formatInr(params.budgetInr)}`);
  if (params.preference) chips.push(`Focus: ${params.preference}`);

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-ink-100">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
        Identified Trip Criteria
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="rounded-full bg-electric-50/80 border border-electric-200/60 px-2.5 py-1 text-xs font-medium text-electric-800"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-electric-500/20 shadow-sm mt-0.5">
          <Image
            src="/images/shreya-ai-avatar.png"
            alt="Shreya AI avatar"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-soft',
          isUser
            ? 'bg-electric-600 text-white rounded-tr-sm'
            : 'bg-white border border-ink-100 text-ink-900 rounded-tl-sm'
        )}
      >
        <span className="sr-only">{isUser ? 'You said: ' : 'Shreya AI said: '}</span>
        <div className="whitespace-pre-wrap">{message.content}</div>
        {!isUser && <ExtractedSummary params={message.structured_params} />}
      </div>
    </div>
  );
}

function AIAgentContent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [sending, setSending] = useState(false);
  const [lastErrorPrompt, setLastErrorPrompt] = useState(null);
  const { toast } = useToast();
  const router = useRouter();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const latestParams = [...messages].reverse().find((m) => m.role === 'assistant')?.structured_params;

  async function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setSending(true);
    setLastErrorPrompt(null);

    try {
      const result = await aiService.sendMessage({ message: trimmed, conversationId });
      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.reply, structured_params: result.extractedParams },
      ]);
      trackAIAgentMessage({ action: 'send_message', success: true });
    } catch (err) {
      toast({ variant: 'error', title: "Could not send that", description: err.message });
      setMessages((prev) => prev.slice(0, -1));
      setLastErrorPrompt(trimmed);
      trackAIAgentMessage({ action: 'send_message', success: false });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-paper-50">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-electric-500/30 shadow-soft">
            <Image
              src="/images/shreya-ai-avatar.png"
              alt="Shreya AI Avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-900">Shreya AI Assistant</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <span className="block text-xs text-ink-400">Flight Decision Intelligence Partner · AI FlightWise</span>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3 py-1 text-xs font-semibold text-electric-700">
          Flight Travel Concierge
        </span>
      </div>

      {/* Chat scroll body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl pt-6 pb-4">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-electric-600 text-white shadow-soft mb-3">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  Smarter Flights with Shreya AI
                </h1>
                <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
                  Describe your trip in natural language. Shreya AI extracts destinations, budgets, and layover tolerances to feed directly into the multi-factor flight optimization engine.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="mt-8 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 text-center mb-2">
                  Try asking a flight decision question:
                </div>
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-ink-100 bg-white p-3.5 text-left transition-all hover:border-electric-300 hover:bg-electric-50/20 hover:shadow-soft"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-electric-50 text-electric-600 group-hover:bg-electric-600 group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-ink-800 group-hover:text-electric-700">
                          {item.title}
                        </div>
                        <div className="text-xs text-ink-500 line-clamp-1 mt-0.5">
                          {item.prompt}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-electric-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversation messages */}
          <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-4">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}

            {sending && (
              <div className="flex items-start gap-3 justify-start">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-electric-500/20 shadow-sm mt-0.5">
                  <Image
                    src="/images/shreya-ai-avatar.png"
                    alt="Shreya AI avatar"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div
                  role="status"
                  className="rounded-2xl rounded-tl-sm bg-white border border-ink-100 px-4 py-3 text-sm text-ink-500 shadow-soft flex items-center gap-2"
                >
                  <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-electric-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-electric-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-electric-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span>Shreya AI is analyzing flight options...</span>
                </div>
              </div>
            )}
          </div>

          {/* Retry state if last send errored */}
          {lastErrorPrompt && !sending && (
            <div className="mx-auto max-w-sm rounded-xl border border-danger-200 bg-danger-50 p-3 text-center">
              <p className="text-xs text-danger-800">Connection timed out or failed to reach Shreya AI.</p>
              <button
                onClick={() => handleSend(lastErrorPrompt)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-danger-700 hover:text-danger-900 underline"
              >
                <RotateCcw className="h-3 w-3" /> Retry last message
              </button>
            </div>
          )}

          {/* Ready to search CTA */}
          {latestParams?.readyToSearch && !sending && (
            <div className="mx-auto max-w-md rounded-2xl border border-electric-200 bg-gradient-to-br from-electric-50/80 via-white to-cyan-50/80 p-5 text-center shadow-premium">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-electric-100 text-electric-700 mb-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-900">Trip parameters ready for optimization!</p>
              <p className="text-xs text-ink-500 mt-1">
                Shreya AI has structured your destinations and constraints. Explore the decision matrix to view trade-offs.
              </p>
              <Button
                onClick={() => router.push('/search')}
                variant="cyan"
                size="md"
                className="mt-3.5 shadow-glow-cyan"
              >
                Continue to Flight Search <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="border-t border-ink-100 bg-white/95 px-4 py-3 sm:px-8 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">
            Message Shreya AI
          </label>
          <div className="relative flex-1">
            <input
              id="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Shreya AI about flights, budget routes, or destination trade-offs..."
              className="w-full rounded-2xl border border-ink-200 bg-paper-50 px-4 py-3 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-400 focus:border-electric-500 focus:bg-white focus:ring-4 focus:ring-electric-100"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric-600 text-white shadow-soft transition-all hover:bg-electric-700 active:scale-95 disabled:opacity-40"
            aria-label="Send message to Shreya AI"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mx-auto max-w-3xl pt-2 text-center">
          <span className="text-xs text-ink-500">
            Shreya AI provides grounded decision guidance based on multi-factor flight scoring (price, duration, stops, layover comfort).
          </span>
        </div>
      </form>
    </div>
  );
}

export { AIAgentContent };

