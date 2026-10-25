'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Map,
  Plus,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Kanban,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('board'); // board | list
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [stage, setStage] = useState('next');
  const [priority, setPriority] = useState('medium');
  const [reach, setReach] = useState(1000);
  const [impact, setImpact] = useState(2.0);
  const [confidence, setConfidence] = useState(0.8);
  const [effort, setEffort] = useState(3.0);
  const [owner, setOwner] = useState('Product Lead');

  const { data: roadmapItems = [], isLoading } = useQuery({
    queryKey: ['roadmap', priorityFilter],
    queryFn: () => productService.listRoadmapItems({ priority: priorityFilter || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingItem
        ? productService.updateRoadmapItem(editingItem.id, payload)
        : productService.createRoadmapItem(payload),
    onSuccess: () => {
      setShowItemModal(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteRoadmapItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setProblemStatement('');
    setStage('next');
    setPriority('medium');
    setReach(1000);
    setImpact(2.0);
    setConfidence(0.8);
    setEffort(3.0);
    setOwner('Product Lead');
    setShowItemModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setProblemStatement(item.problem_statement || '');
    setStage(item.stage);
    setPriority(item.priority);
    setReach(item.reach || 1000);
    setImpact(Number(item.impact) || 2.0);
    setConfidence(Number(item.confidence) || 0.8);
    setEffort(Number(item.effort) || 3.0);
    setOwner(item.owner || 'Product Lead');
    setShowItemModal(true);
  };

  const nowItems = roadmapItems.filter((i) => i.stage === 'now');
  const nextItems = roadmapItems.filter((i) => i.stage === 'next');
  const laterItems = roadmapItems.filter((i) => i.stage === 'later');

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
                <span className="text-xs text-ink-500 font-medium">Strategic Delivery & Execution</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                Product Roadmap & Prioritization
              </h1>
              <p className="mt-1 text-sm text-ink-600 max-w-2xl leading-relaxed">
                Strategic Now / Next / Later initiative tracking with quantitative RICE scores, PRD links, and experiment traceability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'board' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-500'
                  )}
                  title="Board View"
                >
                  <Kanban className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-500'
                  )}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-ink-200 text-xs text-ink-700 bg-white"
              >
                <option value="">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <Button
                size="sm"
                onClick={openCreateModal}
                className="bg-electric-600 hover:bg-electric-700 text-white shadow-soft"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Roadmap Initiative
              </Button>

              <a
                href={productService.getRoadmapExportUrl()}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-soft hover:bg-ink-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export Roadmap
              </a>
            </div>
          </div>

          {/* BOARD VIEW */}
          {viewMode === 'board' && (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {/* NOW COLUMN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ink-200 pb-2.5">
                  <span className="font-display text-sm font-bold text-ink-900 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    NOW ({nowItems.length})
                  </span>
                  <span className="text-[11px] text-ink-400">In Active Delivery</span>
                </div>

                <div className="space-y-3">
                  {nowItems.map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => deleteMutation.mutate(item.id)}
                    />
                  ))}
                  {nowItems.length === 0 && (
                    <div className="p-6 text-center text-xs text-ink-400 border border-dashed border-ink-200 rounded-xl">
                      No initiatives in Now
                    </div>
                  )}
                </div>
              </div>

              {/* NEXT COLUMN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ink-200 pb-2.5">
                  <span className="font-display text-sm font-bold text-ink-900 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-electric-500" />
                    NEXT ({nextItems.length})
                  </span>
                  <span className="text-[11px] text-ink-400">Scoped for Next Cycle</span>
                </div>

                <div className="space-y-3">
                  {nextItems.map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => deleteMutation.mutate(item.id)}
                    />
                  ))}
                  {nextItems.length === 0 && (
                    <div className="p-6 text-center text-xs text-ink-400 border border-dashed border-ink-200 rounded-xl">
                      No initiatives in Next
                    </div>
                  )}
                </div>
              </div>

              {/* LATER COLUMN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ink-200 pb-2.5">
                  <span className="font-display text-sm font-bold text-ink-900 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    LATER ({laterItems.length})
                  </span>
                  <span className="text-[11px] text-ink-400">Discovery & Opportunity</span>
                </div>

                <div className="space-y-3">
                  {laterItems.map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => deleteMutation.mutate(item.id)}
                    />
                  ))}
                  {laterItems.length === 0 && (
                    <div className="p-6 text-center text-xs text-ink-400 border border-dashed border-ink-200 rounded-xl">
                      No initiatives in Later
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="mt-8 rounded-xl border border-ink-100 bg-white shadow-soft overflow-hidden divide-y divide-ink-100">
              {roadmapItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.stage === 'now' ? 'emerald' : item.stage === 'next' ? 'electric' : 'outline'}>
                      {item.stage.toUpperCase()}
                    </Badge>
                    <div>
                      <h4 className="font-semibold text-sm text-ink-900">{item.title}</h4>
                      <p className="text-xs text-ink-500 mt-0.5">{item.problem_statement || item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      RICE: {item.rice_score}
                    </span>
                    <Badge variant={item.priority === 'high' ? 'danger' : 'amber'}>
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-ink-400">{item.owner}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(item)} className="p-1 text-ink-400 hover:text-ink-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(item.id)} className="p-1 text-ink-400 hover:text-danger-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Initiative Modal */}
          {showItemModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-ink-100 space-y-4">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  {editingItem ? 'Edit Roadmap Initiative' : 'Create Roadmap Initiative'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-ink-700">Initiative Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Flight Recommendation Explainability Badges"
                      className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ink-700">Problem Statement</label>
                    <textarea
                      rows={2}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="What customer friction or drop-off does this address?"
                      className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-ink-700">Stage</label>
                      <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      >
                        <option value="now">Now (Active)</option>
                        <option value="next">Next (Planned)</option>
                        <option value="later">Later (Discovery)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-ink-700">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-ink-200"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
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

                  {/* RICE Inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-ink-100">
                    <span className="font-semibold text-ink-700 block">RICE Parameters</span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-ink-400 block">Reach</span>
                        <input
                          type="number"
                          value={reach}
                          onChange={(e) => setReach(Number(e.target.value))}
                          className="w-full p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-400 block">Impact (0.5-3.0)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={impact}
                          onChange={(e) => setImpact(Number(e.target.value))}
                          className="w-full p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-400 block">Confidence (0.5-1.0)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={confidence}
                          onChange={(e) => setConfidence(Number(e.target.value))}
                          className="w-full p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-400 block">Effort (weeks)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={effort}
                          onChange={(e) => setEffort(Number(e.target.value))}
                          className="w-full p-1.5 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setShowItemModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={saveMutation.isPending}
                    disabled={!title.trim()}
                    onClick={() =>
                      saveMutation.mutate({
                        title,
                        description,
                        problemStatement,
                        stage,
                        priority,
                        reach,
                        impact,
                        confidence,
                        effort,
                        owner,
                      })
                    }
                    className="bg-electric-600 hover:bg-electric-700 text-white"
                  >
                    Save Initiative
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

function RoadmapCard({ item, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft space-y-3 hover:border-ink-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-ink-900 leading-snug">{item.title}</h3>
        <Badge
          variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'amber' : 'outline'}
          className="text-[10px] shrink-0"
        >
          {item.priority}
        </Badge>
      </div>

      {item.problem_statement && (
        <p className="text-xs text-ink-500 line-clamp-2">{item.problem_statement}</p>
      )}

      {/* Linked Artifacts */}
      {(item.linked_prd_title || item.linked_experiment_name) && (
        <div className="pt-1 flex flex-col gap-1 text-[11px]">
          {item.linked_prd_title && (
            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 truncate block">
              PRD: {item.linked_prd_title}
            </span>
          )}
          {item.linked_experiment_name && (
            <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 truncate block">
              Exp: {item.linked_experiment_name}
            </span>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          RICE: {item.rice_score}
        </span>
        <div className="flex items-center gap-1.5 text-ink-400">
          <span className="text-[11px]">{item.owner}</span>
          <button onClick={onEdit} className="p-1 hover:text-ink-700">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 hover:text-danger-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
