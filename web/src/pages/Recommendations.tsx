import React, { useState } from 'react';
import { Lightbulb, Filter, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { RecommendationCard } from '../components/Dashboard/RecommendationCard';
import { useRecommendations } from '../hooks/useDashboard';
import { RecommendationCategory, RecommendationPriority } from '../types';

const CATEGORY_OPTIONS: Array<{ value: 'all' | RecommendationCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'phone', label: 'Phone' },
  { value: 'activity', label: 'Activity' },
  { value: 'mental', label: 'Mental Health' },
  { value: 'social', label: 'Social' },
  { value: 'nutrition', label: 'Nutrition' },
];

// Extended mock recommendations
const EXTRA_RECOMMENDATIONS = [
  {
    id: 4,
    title: 'Practice Mindfulness Meditation',
    description: 'Daily 10-minute meditation sessions can reduce cortisol levels by up to 20%.',
    category: 'mental' as RecommendationCategory,
    priority: 'medium' as RecommendationPriority,
    action_steps: [
      'Download a meditation app (Headspace, Calm)',
      'Schedule 10 minutes after waking up',
      'Start with breath awareness exercises',
      'Track your sessions in the app',
    ],
    estimated_impact: 'Medium - reduces stress by 20%',
    time_to_implement: '1-2 weeks',
  },
  {
    id: 5,
    title: 'Optimize Your Work Environment',
    description: 'A well-organized workspace reduces mental fatigue and improves focus.',
    category: 'activity' as RecommendationCategory,
    priority: 'low' as RecommendationPriority,
    action_steps: [
      'Keep desk clean and clutter-free',
      'Adjust monitor height to eye level',
      'Use the Pomodoro technique (25min work / 5min break)',
      'Add a plant to your workspace',
    ],
    estimated_impact: 'Low - improves focus by 10%',
    time_to_implement: 'Immediate',
  },
  {
    id: 6,
    title: 'Limit Social Media Consumption',
    description: 'Excessive social media usage is linked to increased anxiety and comparison behaviors.',
    category: 'phone' as RecommendationCategory,
    priority: 'high' as RecommendationPriority,
    action_steps: [
      'Delete social media apps from your phone',
      'Set a 15-minute daily limit',
      'Use website blockers during work hours',
      'Replace scrolling with reading or journaling',
    ],
    estimated_impact: 'High - reduces anxiety by 30%',
    time_to_implement: 'Immediate',
  },
  {
    id: 7,
    title: 'Build a Morning Routine',
    description: 'A consistent morning routine sets a positive tone for the entire day.',
    category: 'mental' as RecommendationCategory,
    priority: 'medium' as RecommendationPriority,
    action_steps: [
      'Wake up at the same time daily',
      'Avoid phone for the first 30 minutes',
      'Do light stretching or yoga',
      'Write 3 things you are grateful for',
    ],
    estimated_impact: 'Medium - improves mood by 25%',
    time_to_implement: '2-3 weeks',
  },
  {
    id: 8,
    title: 'Stay Hydrated',
    description: 'Dehydration is a hidden factor in cognitive decline and burnout.',
    category: 'nutrition' as RecommendationCategory,
    priority: 'low' as RecommendationPriority,
    action_steps: [
      'Start day with 2 glasses of water',
      'Use a water tracking app',
      'Keep a water bottle at your desk',
      'Replace one daily coffee with herbal tea',
    ],
    estimated_impact: 'Low - improves energy by 12%',
    time_to_implement: 'Immediate',
  },
];

export const Recommendations: React.FC = () => {
  const { data: apiRecs, isLoading } = useRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<'all' | RecommendationCategory>('all');
  const [sortByPriority, setSortByPriority] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  // apiRecs may arrive as an object if the API wraps the array — guard here too
  const safeApiRecs = Array.isArray(apiRecs) ? apiRecs : [];
  const allRecs = safeApiRecs.length > 0
    ? safeApiRecs                          // real AI data — show only GPT recommendations
    : EXTRA_RECOMMENDATIONS;              // fallback if API not available

  const priorityOrder: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };

  const filtered = allRecs
    .filter((r) => selectedCategory === 'all' || r.category === selectedCategory)
    .sort((a, b) =>
      sortByPriority
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : 0
    )
    .map((r) => ({ ...r, completed: completedIds.has(r.id || 0) }));

  const handleComplete = (id: number) => {
    setCompletedIds((prev) => new Set([...prev, id]));
  };

  const highCount = filtered.filter((r) => r.priority === 'high' && !r.completed).length;
  const medCount = filtered.filter((r) => r.priority === 'medium' && !r.completed).length;
  const completedCount = completedIds.size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{highCount}</p>
              <p className="text-xs text-slate-400">High Priority</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{medCount}</p>
              <p className="text-xs text-slate-400">Medium Priority</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round((completedCount / allRecs.length) * 100)}%
              </p>
              <p className="text-xs text-slate-400">Completion Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress bar */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-sm text-slate-300 font-medium">Overall Progress</span>
          <span className="text-sm text-indigo-400 font-semibold">
            {completedCount}/{allRecs.length} completed
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / allRecs.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortByPriority(!sortByPriority)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Sort: {sortByPriority ? 'Priority' : 'Default'}
        </button>
      </div>

      {/* Recommendation cards */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onComplete={handleComplete}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Lightbulb size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No recommendations in this category yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
