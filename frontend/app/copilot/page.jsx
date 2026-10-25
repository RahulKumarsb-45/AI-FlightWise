'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Calculator,
  FileText,
  Lightbulb,
  Save,
  Download,
  RotateCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CopilotPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('copilot'); // copilot | prds | rice
  const [copilotMode, setCopilotMode] = useState('opportunity'); // opportunity | prd | rice
  const [userPrompt, setUserPrompt] = useState(
    'Evaluate flight search recommendation explainability and trade-off badges'
  );

  // RICE Calculator state
  const [reach, setReach] = useState(1200);
  const [impact, setImpact] = useState(2.0); // 0.5 (Minimal), 1.0 (Low), 2.0 (Medium), 3.0 (High)
  const [confidence, setConfidence] = useState(0.8); // 0.5 to 1.0
  const [effort, setEffort] = useState(3.0); // person-weeks

  // PRD Editor state
  const [editingPrdId, setEditingPrdId] = useState(null);
  const [prdTitle, setPrdTitle] = useState('');
  const [prdMarkdown, setPrdMarkdown] = useState('');
  const [showPrdModal, setShowPrdModal] = useState(false);

  // Queries
  const { data: evidenceData, isLoading: evidenceLoading } = useQuery({
    queryKey: ['copilot', 'evidence'],
    queryFn: () => productService.getCopilotEvidence(),
  });

  const { data: prdsData, isLoading: prdsLoading } = useQuery({
    queryKey: ['copilot', 'prds'],
    queryFn: () => productService.listPrds(),
  });

  // Copilot generation mutation
  const generateMutation = useMutation({
    mutationFn: (mode) =>
      productService.generateCopilotArtifact({
        prompt: userPrompt,
        mode: mode || copilotMode,
        inputContext: { reach, impact, confidence, effort },
      }),
    onSuccess: (data) => {
      if (data.mode === 'prd' && data.generatedContent) {
        setPrdTitle(data.title || userPrompt);
        setPrdMarkdown(data.generatedContent);
        setEditingPrdId(null);
        setShowPrdModal(true);
      }
    },
  });

  // Save PRD mutation
  const savePrdMutation = useMutation({
    mutationFn: (payload) =>
      editingPrdId
        ? productService.updatePrd(editingPrdId, payload)
        : productService.savePrd(payload),
    onSuccess: () => {
      setShowPrdModal(false);
      queryClient.invalidateQueries({ queryKey: ['copilot', 'prds'] });
    },
  });

  // Delete PRD mutation
  const deletePrdMutation = useMutation({
    mutationFn: (id) => productService.deletePrd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copilot', 'prds'] });
    },
  });

  // Calculate RICE score live
  const calculatedRiceScore = Number(((reach * impact * confidence) / effort).toFixed(2));
  const prds = prdsData || [];
  const evidence = evidenceData || {};

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-[#F8FAFC] py-10">
        <div className="container-page max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-ink-100 bg-white p-7 rounded-2xl shadow-soft">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-electric-700 bg-electric-50 px-2.5 py-0.5 rounded-full border border-electric-200/60">
                  PM Workspace
                </span>
                <span className="text-xs text-ink-400">·</span>
                <span className="text-xs text-ink-500 font-medium">PRD Generation & RICE Prioritization</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                AI Product Manager Copilot
              </h1>
              <p className="mt-1 text-sm text-ink-600 max-w-2xl leading-relaxed">
                Evidence-backed opportunity discovery, interactive RICE prioritization, and automated PRD authoring linked to real flight metrics.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('copilot')}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'copilot'
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-electric-600" />
                Strategy Copilot
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rice')}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'rice'
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                )}
              >
                <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                RICE Calculator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prds')}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5',
                  activeTab === 'prds'
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                )}
              >
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                PRD Repository ({prds.length})
              </button>
            </div>
          </div>

          {/* Evidence Telemetry Inspector */}
          <div className="mt-6 rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-700 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-electric-600" />
                Live Evidence Telemetry Grounding:
              </span>
              <span className="text-ink-400">Zero hallucinations — copilot strictly grounded in DB facts</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-ink-800">Customer Feedback</span>
                <p className="mt-1 text-ink-500">
                  {evidence.feedback?.isEmpty
                    ? 'No user feedback recorded yet'
                    : `${evidence.feedback?.total || 0} customer quotes across ${evidence.feedback?.themes?.length || 0} themes`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-ink-800">Funnel Drop-off</span>
                <p className="mt-1 text-ink-500">
                  {evidence.analytics?.isEmpty
                    ? 'Live event tracking active'
                    : `Highest drop-off at: ${evidence.analytics?.dropoffStage?.stage || 'Results'}`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-ink-800">Model Quality Benchmark</span>
                <p className="mt-1 text-ink-500">
                  {evidence.evaluation?.isEmpty
                    ? 'Offline baseline available'
                    : `Pass Rate: ${evidence.evaluation?.passRate}% (${evidence.evaluation?.modelProvider})`}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: COPILOT GENERATION */}
          {activeTab === 'copilot' && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <h2 className="font-display text-base font-bold text-ink-900">
                  Product Decision & Strategy Generation
                </h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  Move from customer discovery evidence to testable hypotheses and formal PRDs.
                </p>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-ink-700">Product Problem or Prompt</label>
                  <textarea
                    rows={3}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Describe the opportunity, user friction, or feature idea..."
                    className="w-full mt-1.5 p-3 rounded-xl border border-ink-200 text-xs focus:outline-electric-500"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink-600">Mode:</span>
                    <button
                      onClick={() => setCopilotMode('opportunity')}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                        copilotMode === 'opportunity'
                          ? 'bg-electric-600 text-white'
                          : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                      )}
                    >
                      Opportunity & Hypothesis
                    </button>
                    <button
                      onClick={() => setCopilotMode('prd')}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                        copilotMode === 'prd'
                          ? 'bg-electric-600 text-white'
                          : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                      )}
                    >
                      Complete PRD Document
                    </button>
                  </div>

                  <Button
                    onClick={() => generateMutation.mutate(copilotMode)}
                    loading={generateMutation.isPending}
                    className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    {generateMutation.isPending ? 'Generating Intelligence...' : 'Generate with Evidence'}
                  </Button>
                </div>
              </div>

              {/* Generated Result Output */}
              {generateMutation.data && (
                <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="electric">
                        {generateMutation.data.mode.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-ink-400">
                        Evaluated via {generateMutation.data.model}
                      </span>
                    </div>

                    {generateMutation.data.mode === 'prd' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setPrdTitle(generateMutation.data.title);
                          setPrdMarkdown(generateMutation.data.generatedContent);
                          setShowPrdModal(true);
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Open in PRD Editor
                      </Button>
                    )}
                  </div>

                  {generateMutation.data.problemStatement && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1">
                        Synthesized Problem Statement
                      </div>
                      <p className="text-sm font-medium text-ink-900">
                        {generateMutation.data.problemStatement}
                      </p>
                    </div>
                  )}

                  {generateMutation.data.hypothesis && (
                    <div className="p-4 bg-electric-50/50 rounded-xl border border-electric-100">
                      <div className="text-xs font-semibold uppercase tracking-wider text-electric-700 mb-1">
                        Testable Feature Hypothesis
                      </div>
                      <p className="text-sm font-medium text-electric-950">
                        {generateMutation.data.hypothesis}
                      </p>
                    </div>
                  )}

                  {generateMutation.data.generatedContent && (
                    <pre className="p-4 bg-ink-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {generateMutation.data.generatedContent}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RICE CALCULATOR */}
          {activeTab === 'rice' && (
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  RICE Prioritization Calculator
                </h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  RICE Score = (Reach × Impact × Confidence) / Effort. Adjust variables to compute real priority ranking.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-ink-700 mb-1">
                      <span>Reach (users impacted per month)</span>
                      <span className="font-mono text-electric-600">{reach} users</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      value={reach}
                      onChange={(e) => setReach(Number(e.target.value))}
                      className="w-full accent-electric-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-ink-700 mb-1">
                      <span>Impact (per user conversion lift)</span>
                      <span className="font-mono text-electric-600">{impact}x</span>
                    </div>
                    <select
                      value={impact}
                      onChange={(e) => setImpact(Number(e.target.value))}
                      className="w-full p-2 border border-ink-200 rounded-lg text-xs"
                    >
                      <option value="0.25">0.25 — Minimal</option>
                      <option value="0.5">0.5 — Low</option>
                      <option value="1.0">1.0 — Medium</option>
                      <option value="2.0">2.0 — High</option>
                      <option value="3.0">3.0 — Massive</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-ink-700 mb-1">
                      <span>Confidence Level</span>
                      <span className="font-mono text-electric-600">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <select
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full p-2 border border-ink-200 rounded-lg text-xs"
                    >
                      <option value="0.5">50% — Low Confidence (gut feeling)</option>
                      <option value="0.8">80% — Medium Confidence (supported by customer feedback)</option>
                      <option value="1.0">100% — High Confidence (backed by live telemetry and test data)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-ink-700 mb-1">
                      <span>Effort (person-weeks)</span>
                      <span className="font-mono text-electric-600">{effort} weeks</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={effort}
                      onChange={(e) => setEffort(Number(e.target.value))}
                      className="w-full accent-electric-600"
                    />
                  </div>
                </div>

                {/* Score Card Display */}
                <div className="flex flex-col justify-center items-center p-8 bg-gradient-to-br from-indigo-50 to-electric-50 rounded-2xl border border-indigo-100 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Calculated RICE Score
                  </span>
                  <span className="mt-3 font-display text-5xl font-extrabold text-indigo-950">
                    {calculatedRiceScore}
                  </span>
                  <p className="mt-3 text-xs text-indigo-800 font-mono bg-white/80 px-3 py-1.5 rounded-lg border border-indigo-200">
                    ({reach} × {impact} × {(confidence * 100).toFixed(0)}%) / {effort} = {calculatedRiceScore}
                  </p>
                  <p className="mt-4 text-xs text-ink-500 max-w-xs">
                    Higher scores reflect stronger opportunities for the product roadmap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRD REPOSITORY */}
          {activeTab === 'prds' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-ink-100 shadow-soft">
                <h2 className="font-display text-sm font-bold text-ink-900">
                  Saved Product Requirements Documents ({prds.length})
                </h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingPrdId(null);
                    setPrdTitle('');
                    setPrdMarkdown('');
                    setShowPrdModal(true);
                  }}
                  className="bg-electric-600 hover:bg-electric-700 text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  New PRD
                </Button>
              </div>

              <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-soft overflow-hidden">
                {prds.map((prd) => (
                  <div key={prd.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-ink-900">{prd.title}</h3>
                        <p className="text-xs text-ink-500 mt-0.5">{prd.problem_statement || 'No description'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={prd.status === 'in_review' ? 'amber' : 'electric'}>
                          {prd.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setEditingPrdId(prd.id);
                            setPrdTitle(prd.title);
                            setPrdMarkdown(prd.raw_markdown || '');
                            setShowPrdModal(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View / Edit
                        </Button>
                        <a
                          href={productService.getPrdExportUrl(prd.id)}
                          download
                          className="inline-flex items-center gap-1 h-8 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </a>
                        <button
                          onClick={() => deletePrdMutation.mutate(prd.id)}
                          className="p-1.5 text-ink-400 hover:text-danger-600 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {prds.length === 0 && (
                  <div className="p-12 text-center text-ink-400 text-sm">
                    No PRDs created yet. Generate one with the Strategy Copilot!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRD Modal Editor */}
          {showPrdModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl flex flex-col shadow-2xl border border-ink-100 overflow-hidden">
                <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-slate-50">
                  <input
                    type="text"
                    value={prdTitle}
                    onChange={(e) => setPrdTitle(e.target.value)}
                    placeholder="PRD Title..."
                    className="font-display text-lg font-bold text-ink-900 bg-transparent border-b border-transparent hover:border-ink-300 focus:border-electric-500 focus:outline-hidden w-2/3"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPrdModal(false)}>
                      Close
                    </Button>
                    <Button
                      size="sm"
                      loading={savePrdMutation.isPending}
                      onClick={() =>
                        savePrdMutation.mutate({
                          title: prdTitle,
                          rawMarkdown: prdMarkdown,
                          problemStatement: prdTitle,
                          solution: 'Documented in PRD body',
                        })
                      }
                      className="bg-electric-600 hover:bg-electric-700 text-white"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save PRD
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                  <textarea
                    rows={20}
                    value={prdMarkdown}
                    onChange={(e) => setPrdMarkdown(e.target.value)}
                    className="w-full font-mono text-xs text-ink-900 bg-slate-50 p-4 rounded-xl border border-ink-200 focus:outline-electric-500"
                  />
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
