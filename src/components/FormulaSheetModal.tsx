import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="formula-sheet-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div id="formula-sheet-modal-card" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">College Board Digital SAT® Math Reference Sheet</h2>
          </div>
          <button
            id="close-formula-sheet-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs">
            <span className="font-semibold">Official Exam Note:</span> These formulas are provided on every section of the Digital SAT Math. There are 360 degrees in a circle. The number of radians in a circle is 2π. The sum of the measures in degrees of the angles of a triangle is 180.
          </div>

          {/* 2D Area & Perimeter Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">2D Geometry & Trigonometry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Circle</div>
                <div className="text-indigo-600 font-mono font-medium">A = πr²</div>
                <div className="text-slate-600 font-mono text-xs">C = 2πr = πd</div>
                <div className="text-slate-400 text-xs mt-2">r = radius, d = diameter</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Rectangle</div>
                <div className="text-indigo-600 font-mono font-medium">A = l · w</div>
                <div className="text-slate-600 font-mono text-xs">P = 2l + 2w</div>
                <div className="text-slate-400 text-xs mt-2">l = length, w = width</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Triangle</div>
                <div className="text-indigo-600 font-mono font-medium">A = ½ · b · h</div>
                <div className="text-slate-600 font-mono text-xs">a² + b² = c²</div>
                <div className="text-slate-400 text-xs mt-2">b = base, h = height, c = hypotenuse</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Right Triangles</div>
                <div className="text-indigo-600 font-mono font-medium">sin θ = opp/hyp</div>
                <div className="text-slate-600 font-mono text-xs">cos θ = adj/hyp</div>
                <div className="text-slate-600 font-mono text-xs">tan θ = opp/adj</div>
              </div>
            </div>
          </div>

          {/* Special Right Triangles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Special Right Triangles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 mb-1">30° - 60° - 90° Triangle</div>
                  <div className="text-slate-700 text-xs space-y-0.5">
                    <div>• Side opposite 30° = <span className="font-mono font-semibold text-indigo-700">x</span></div>
                    <div>• Side opposite 60° = <span className="font-mono font-semibold text-indigo-700">x√3</span></div>
                    <div>• Hypotenuse (opposite 90°) = <span className="font-mono font-semibold text-indigo-700">2x</span></div>
                  </div>
                </div>
                <div className="w-20 h-16 border-b-2 border-l-2 border-indigo-400 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-indigo-800 font-mono">2x</div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 mb-1">45° - 45° - 90° Triangle</div>
                  <div className="text-slate-700 text-xs space-y-0.5">
                    <div>• Legs (opposite 45°) = <span className="font-mono font-semibold text-indigo-700">x</span> each</div>
                    <div>• Hypotenuse (opposite 90°) = <span className="font-mono font-semibold text-indigo-700">x√2</span></div>
                  </div>
                </div>
                <div className="w-16 h-16 border-b-2 border-l-2 border-indigo-400 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-indigo-800 font-mono">x√2</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Volumes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">3D Solid Volumes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs mb-1">Rectangular Prism</div>
                <div className="text-indigo-600 font-mono font-semibold text-xs">V = l · w · h</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs mb-1">Right Cylinder</div>
                <div className="text-indigo-600 font-mono font-semibold text-xs">V = πr²h</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs mb-1">Sphere</div>
                <div className="text-indigo-600 font-mono font-semibold text-xs">V = ⁴⁄₃πr³</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 text-xs mb-1">Right Cone</div>
                <div className="text-indigo-600 font-mono font-semibold text-xs">V = ⅓πr²h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            id="formula-sheet-got-it-btn"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
          >
            Close Reference Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
