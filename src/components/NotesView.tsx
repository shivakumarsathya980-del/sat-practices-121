import React, { useState } from 'react';
import {
  BookMarked,
  Search,
  Bookmark,
  Sparkles,
  Copy,
  Check,
  Plus,
  Loader2,
  Filter,
  Zap,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { NoteItem } from '../types';
import { initialNotes } from '../data/mockNotes';
import { generateStudyNotes } from '../services/api';

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Generator state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSection, setAiSection] = useState<'Math' | 'Reading & Writing'>('Math');
  const [aiLoading, setAiLoading] = useState(false);

  const handleToggleBookmark = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n)));
  };

  const handleCopyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAiNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setAiLoading(true);
    try {
      const generatedNote = await generateStudyNotes({
        topic: aiTopic.trim(),
        section: aiSection,
      });

      setNotes([generatedNote, ...notes]);
      setAiModalOpen(false);
      setAiTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const categories = [
    'All',
    'Formulas',
    'Grammar Rules',
    'Reading Strategies',
    'Desmos Hacks',
    'High Yield Concepts',
    'Bookmarked',
  ];

  const filteredNotes = notes.filter((n) => {
    let matchCat = true;
    if (selectedCategory === 'Bookmarked') {
      matchCat = Boolean(n.isBookmarked);
    } else if (selectedCategory !== 'All') {
      matchCat = n.category === selectedCategory;
    }

    const matchQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCat && matchQuery;
  });

  return (
    <div id="notes-view-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <BookMarked className="w-3.5 h-3.5" />
              <span>High-Yield Cheat Sheets & Notes</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Important SAT Study Notes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated formula vaults, punctuation master rules, Desmos calculator shortcuts, and high-yield concepts.
            </p>
          </div>

          <button
            id="generate-ai-note-btn"
            onClick={() => setAiModalOpen(true)}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate AI Study Note</span>
          </button>
        </div>

        {/* Search Bar & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, formulas, or rules (e.g. 'discriminant', 'semicolon', 'vertex')..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          const isCopied = copiedId === note.id;
          return (
            <div
              key={note.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        note.section === 'Math'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {note.section}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{note.category}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyContent(note.id, `${note.title}\n\n${note.content}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      title="Copy Note"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(note.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100"
                      title="Bookmark Note"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          note.isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{note.title}</h3>
                <p className="text-xs text-slate-600 leading-snug">{note.summary}</p>

                {/* Formatted Content Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {note.content}
                </div>
              </div>

              {/* Tags footer */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                    onClick={() => setSearchQuery(t)}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
          No notes match your search or filter. Try clicking "Generate AI Study Note" above!
        </div>
      )}

      {/* Generate AI Study Note Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Generate AI SAT Study Note</h3>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleGenerateAiNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic or Concept</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Completing the square, Non-essential clauses, or Circle theorems"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SAT Section</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiSection('Math')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      aiSection === 'Math'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Math
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSection('Reading & Writing')}
                    className={`py-2 text-xs font-semibold rounded-lg border ${
                      aiSection === 'Reading & Writing'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Reading & Writing
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{aiLoading ? 'Synthesizing...' : 'Generate Cheat Sheet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
