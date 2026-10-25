'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileCheck2,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DecisionsPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [evidenceConsidered, setEvidenceConsidered] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [rationale, setRationale] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [actualOutcome, setActualOutcome] = useState('');
  const [risks, setRisks] = useState('');
  const [owner, setOwner] = useState('Product Lead');
  const [followUpMetric, setFollowUpMetric] = useState('');

  const { data: decisions = [], isLoading, refetch } = useQuery({
    queryKey: ['decisions'],
    queryFn: () => productService.listDecisions(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => productService.createDecision(payload),
    onSuccess: () => {
      setShowModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setProblem('');
    setEvidenceConsidered('');
    setAlternatives('');
    setSelectedDecision('');
    setRationale('');
    setExpectedOutcome('');
    setActualOutcome('');
    setRisks('');
    setOwner('Product Lead');
    setFollowUpMetric('');
  };

  const filtered = decisions.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.selected_decision?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-slate-50 py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 bg-white p-6 rounded-2xl shadow-soft">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 via-ink-800 to-indigo-900 text-white shadow-soft">
                  <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink-900">
                    Product Decision Log (ADRs & Decisions)
                  </h1>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Auditable record of architectural and product trade-offs, evidence considered, expected outcomes, and verified results.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Log Product Decision
              </Button>

              <a
                href={productService.getDecisionsExportUrl()}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-soft hover:bg-ink-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export Decision Log
              </a>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl border border-ink-100 shadow-soft">
            <div className="relative w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-ink-400" />
              <input
                type="text"
                placeholder="Search decisions, rationales, problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-ink-200 text-xs w-full focus:outline-electric-500"
              />
            </div>
            <span className="text-xs text-ink-500 font-medium">
              {filtered.length} decision records logged
            </span>
          </div>

          {/* Decision Records Accordion */}
          <div className="mt-4 space-y-4">
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-ink-100 bg-white shadow-soft overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50/60 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {item.date}
                        </Badge>
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-600 line-clamp-1">
                        <strong>Problem:</strong> {item.problem}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-ink-400">{item.owner}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-ink-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-ink-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Full Record */}
                  {isExpanded && (
                    <div className="p-6 border-t border-ink-100 bg-slate-50/50 space-y-5 text-xs">
                      {/* Decision & Rationale Banner */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Selected Decision & Rationale
                        </div>
                        <p className="text-sm font-semibold text-emerald-950">
                          {item.selected_decision}
                        </p>
                        <p className="text-emerald-800 leading-relaxed">{item.rationale}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-white rounded-xl border border-ink-100 space-y-1">
                          <span className="font-bold text-ink-700 uppercase tracking-wider text-[10px]">
                            Evidence Considered
                          </span>
                          <p className="text-ink-600 leading-relaxed">
                            {item.evidence_considered || 'No specific telemetry logged.'}
                          </p>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-ink-100 space-y-1">
                          <span className="font-bold text-ink-700 uppercase tracking-wider text-[10px]">
                            Alternatives Evaluated
                          </span>
                          <p className="text-ink-600 leading-relaxed">
                            {item.alternatives || 'None recorded.'}
                          </p>
                        </div>
                      </div>

                      {/* Expected vs Actual Outcome */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-white rounded-xl border border-sky-100 space-y-1">
                          <span className="font-bold text-sky-800 uppercase tracking-wider text-[10px]">
                            Hypothesized Expected Outcome
                          </span>
                          <p className="text-sky-950 leading-relaxed font-medium">
                            {item.expected_outcome || 'N/A'}
                          </p>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-purple-100 space-y-1">
                          <span className="font-bold text-purple-800 uppercase tracking-wider text-[10px]">
                            Verified Actual Outcome
                          </span>
                          <p className="text-purple-950 leading-relaxed font-medium">
                            {item.actual_outcome || 'Pending review / experiment in progress'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="flex flex-wrap items-center justify-between text-ink-500 pt-2 border-t border-ink-100 text-[11px]">
                        <span>
                          <strong>Follow-up Metric:</strong> <code className="font-mono text-ink-800">{item.follow_up_metric || 'N/A'}</code>
                        </span>
                        <span>
                          <strong>Owner:</strong> {item.owner} · <strong>Review Date:</strong> {item.review_date || 'Periodic review'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-ink-400 text-sm bg-white rounded-2xl border border-ink-100 shadow-soft">
                No decision records match your search.
              </div>
            )}
          </div>

          {/* New Decision Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl p-6 shadow-2xl border border-ink-100 overflow-y-auto space-y-4 text-xs">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  Record Architectural / Product Decision
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-ink-700">Decision Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Adopt PostgreSQL for Telemetry Events Over Third-party SaaS"
                      className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ink-700">Problem Addressed</label>
                    <textarea
                      rows={2}
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="What trade-off or challenge required a decision?"
                      className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-ink-700">Selected Decision</label>
                      <input
                        type="text"
                        value={selectedDecision}
                        onChange={(e) => setSelectedDecision(e.target.value)}
                        placeholder="Chosen approach"
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-ink-700">Owner</label>
                      <input
                        type="text"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-ink-700">Rationale</label>
                    <textarea
                      rows={2}
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder="Why was this option selected over alternatives?"
                      className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-ink-700">Expected Outcome</label>
                      <input
                        type="text"
                        value={expectedOutcome}
                        onChange={(e) => setExpectedOutcome(e.target.value)}
                        placeholder="Hypothesized result"
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-ink-700">Observed Actual Outcome</label>
                      <input
                        type="text"
                        value={actualOutcome}
                        onChange={(e) => setActualOutcome(e.target.value)}
                        placeholder="Leave blank or fill verified data"
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={createMutation.isPending}
                    disabled={!title.trim() || !problem.trim() || !selectedDecision.trim() || !rationale.trim()}
                    onClick={() =>
                      createMutation.mutate({
                        title,
                        problem,
                        selectedDecision,
                        rationale,
                        evidenceConsidered,
                        alternatives,
                        expectedOutcome,
                        actualOutcome,
                        risks,
                        owner,
                        followUpMetric,
                      })
                    }
                    className="bg-electric-600 hover:bg-electric-700 text-white"
                  >
                    Save Decision
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
