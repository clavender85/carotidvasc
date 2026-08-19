import React, { useState } from 'react';
import { ClinicalContextItem, ClinicalContextCategory, ContextOption } from '../../types/clinicalContext';
import { Search, Plus, X, Check, Tag } from 'lucide-react';

interface ContextMultiSelectProps {
  category: ClinicalContextCategory;
  title: string;
  selectedItems: ClinicalContextItem[];
  availableOptions: ContextOption[];
  onAddItem: (item: Omit<ClinicalContextItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
  placeholder?: string;
  badgeColor?: string;
}

export const ContextMultiSelect: React.FC<ContextMultiSelectProps> = ({
  category,
  title,
  selectedItems,
  availableOptions,
  onAddItem,
  onRemoveItem,
  placeholder = 'Search or add custom item...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const selectedLabels = new Set(selectedItems.map(i => i.label.toLowerCase().trim()));

  const handleToggleOption = (opt: ContextOption) => {
    const isSelected = selectedLabels.has(opt.label.toLowerCase().trim());
    if (isSelected) {
      const existing = selectedItems.find(i => i.label.toLowerCase().trim() === opt.label.toLowerCase().trim());
      if (existing) onRemoveItem(existing.id);
    } else {
      onAddItem({
        category,
        label: opt.label,
        source: 'manual',
      });
    }
  };

  const handleAddCustom = (textToAdd?: string) => {
    const raw = (textToAdd || searchTerm).trim();
    if (!raw) return;
    if (selectedLabels.has(raw.toLowerCase())) {
      setSearchTerm('');
      return;
    }

    onAddItem({
      category,
      label: raw,
      source: 'manual',
    });
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  // Filter options for search dropdown
  const filteredOptions = searchTerm.trim()
    ? availableOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.shortLabel && opt.shortLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const showCustomOption = searchTerm.trim().length > 0 &&
    !availableOptions.some(o => o.label.toLowerCase() === searchTerm.toLowerCase().trim()) &&
    !selectedLabels.has(searchTerm.toLowerCase().trim());

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-cyan-400" />
          <span>{title}</span>
          <span className="text-[10px] text-slate-500 font-mono">({selectedItems.length})</span>
        </label>
      </div>

      {/* Selected Chips List */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#080d19] border border-slate-800/80">
          {selectedItems.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/70 border border-cyan-700/80 text-cyan-200 text-xs font-semibold shadow-xs"
            >
              <span>{item.label}</span>
              {item.side && (
                <span className="text-[10px] text-cyan-400 font-mono">
                  [{item.side}]
                </span>
              )}
              {item.date && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ({item.date})
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="text-cyan-400 hover:text-cyan-100 p-0.5 rounded transition-colors cursor-pointer"
                title={`Remove ${item.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Select Chips Grid */}
      <div className="flex flex-wrap gap-1.5">
        {availableOptions.map(opt => {
          const isSelected = selectedLabels.has(opt.label.toLowerCase().trim());
          const displayLabel = opt.shortLabel || opt.label;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleToggleOption(opt)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-600 text-slate-950 border-cyan-500 font-bold shadow-xs'
                  : 'bg-[#0f172a] text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:text-slate-100'
              }`}
              title={opt.label}
            >
              {isSelected ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <Plus className="w-3 h-3 text-slate-500" />
              )}
              <span>{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Custom Item Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearching(true)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#080d19] border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          {searchTerm.trim() && (
            <button
              type="button"
              onClick={() => handleAddCustom()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 text-slate-950 text-xs font-bold hover:bg-cyan-500 cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Search Autocomplete Dropdown */}
        {searchTerm.trim() && (filteredOptions.length > 0 || showCustomOption) && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {filteredOptions.map(opt => {
              const isSelected = selectedLabels.has(opt.label.toLowerCase().trim());
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    handleToggleOption(opt);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border-b border-slate-800/60 hover:bg-slate-800 cursor-pointer ${
                    isSelected ? 'bg-cyan-950/40 text-cyan-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected ? (
                    <span className="text-[10px] text-cyan-400 font-mono">Selected</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">+ Select</span>
                  )}
                </button>
              );
            })}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleAddCustom()}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-1.5 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/50 cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add custom: "{searchTerm.trim()}"</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
