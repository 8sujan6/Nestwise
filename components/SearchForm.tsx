"use client";

import { useState } from "react";
import { SearchFormData, Priority } from "@/lib/types";

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading: boolean;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; icon: React.ReactNode }[] = [
  {
    value: "good_schools",
    label: "Good Schools",
    icon: (
      <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    ),
  },
  {
    value: "low_crime",
    label: "Low Crime",
    icon: (
      <svg className="w-3.5 h-3.5 text-[#0099ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/>
      </svg>
    ),
  },
  {
    value: "walkability",
    label: "Walkability",
    icon: (
      <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5.5 8.5 6-6 6 6"/>
        <path d="M11.5 2.5v16"/>
        <path d="M17.5 14.5h-12"/>
      </svg>
    ),
  },
  {
    value: "investment_potential",
    label: "Investment",
    icon: (
      <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
];

const CITIES = ["Austin", "Dallas", "Houston", "San Antonio"];

const PROPERTY_TYPES = [
  "Any",
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [form, setForm] = useState<SearchFormData>({
    city: "Austin",
    budget: 600000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "Any",
    maxCommuteTime: 30,
    priorities: [],
  });

  const [budgetDisplay, setBudgetDisplay] = useState("600,000");
  const [errors, setErrors] = useState<{ city?: string; budget?: string; bedrooms?: string; bathrooms?: string; commute?: string }>({});

  function handleSliderChange(val: number): void {
    setForm((prev) => ({ ...prev, budget: val }));
    setBudgetDisplay(val.toLocaleString());
    if (errors.budget) setErrors((prev) => ({ ...prev, budget: undefined }));
  }

  function handleInputChange(valStr: string): void {
    const cleanDigits = valStr.replace(/\D/g, "");
    if (!cleanDigits) {
      setBudgetDisplay("");
      setForm((prev) => ({ ...prev, budget: 0 }));
      return;
    }
    const num = parseInt(cleanDigits, 10);
    setBudgetDisplay(num.toLocaleString());
    setForm((prev) => ({ ...prev, budget: num }));
    if (errors.budget) setErrors((prev) => ({ ...prev, budget: undefined }));
  }

  function togglePriority(p: Priority): void {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter((x) => x !== p)
        : [...prev.priorities, p],
    }));
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!form.city) {
      newErrors.city = "City selection is required.";
    }
    if (form.budget <= 0) {
      newErrors.budget = "Budget must be greater than zero.";
    } else if (form.budget < 50000) {
      newErrors.budget = "Minimum budget is $50,000.";
    }
    if (form.bedrooms <= 0) {
      newErrors.bedrooms = "Bedrooms must be at least 1.";
    }
    if (form.bathrooms <= 0) {
      newErrors.bathrooms = "Bathrooms must be at least 1.";
    }
    if (form.maxCommuteTime < 5 || form.maxCommuteTime > 120) {
      newErrors.commute = "Commute time must be between 5 and 120 minutes.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSearch(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-1.5" htmlFor="city">
            City
          </label>
          <select
            id="city"
            value={form.city}
            onChange={(e) => {
              setForm({ ...form, city: e.target.value });
              if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
            }}
            className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 bg-[#1c1c1f] text-white ${
              errors.city ? "border-rose-500 focus:ring-rose-500/50" : "border-white/10 focus:ring-[#0099ff]/50"
            }`}
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-[#1c1c1f] text-white">
                {c}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-[10px] font-bold text-rose-400 mt-1">{errors.city}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#999999]" htmlFor="budget-input">
            Max Budget
          </label>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                id="budget-input"
                type="text"
                inputMode="numeric"
                value={budgetDisplay}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g. 600,000"
                className={`border rounded-xl pl-7 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-1 bg-[#1c1c1f] text-white ${
                  errors.budget ? "border-rose-500 focus:ring-rose-500/50" : "border-white/10 focus:ring-[#0099ff]/50"
                }`}
              />
            </div>
            <input
              id="budget-slider"
              type="range"
              min={100000}
              max={1500000}
              step={25000}
              value={form.budget > 1500000 ? 1500000 : form.budget < 100000 ? 100000 : form.budget}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-1 bg-[#1c1c1f] rounded-lg appearance-none cursor-pointer accent-[#0099ff]"
            />
          </div>
          {errors.budget && <p className="text-[10px] font-bold text-rose-400 mt-1">{errors.budget}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-1.5"
            htmlFor="bedrooms"
          >
            Min Bedrooms
          </label>
          <select
            id="bedrooms"
            value={form.bedrooms}
            onChange={(e) => {
              setForm({ ...form, bedrooms: Number(e.target.value) });
              if (errors.bedrooms) setErrors((prev) => ({ ...prev, bedrooms: undefined }));
            }}
            className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 bg-[#1c1c1f] text-white ${
              errors.bedrooms ? "border-rose-500 focus:ring-rose-500/50" : "border-white/10 focus:ring-[#0099ff]/50"
            }`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n} className="bg-[#1c1c1f] text-white">
                {n}+ Bedrooms
              </option>
            ))}
          </select>
          {errors.bedrooms && <p className="text-[10px] font-bold text-rose-400 mt-1">{errors.bedrooms}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-1.5"
            htmlFor="bathrooms"
          >
            Min Bathrooms
          </label>
          <select
            id="bathrooms"
            value={form.bathrooms}
            onChange={(e) => {
              setForm({ ...form, bathrooms: Number(e.target.value) });
              if (errors.bathrooms) setErrors((prev) => ({ ...prev, bathrooms: undefined }));
            }}
            className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 bg-[#1c1c1f] text-white ${
              errors.bathrooms ? "border-rose-500 focus:ring-rose-500/50" : "border-white/10 focus:ring-[#0099ff]/50"
            }`}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n} className="bg-[#1c1c1f] text-white">
                {n}+ Bathrooms
              </option>
            ))}
          </select>
          {errors.bathrooms && <p className="text-[10px] font-bold text-rose-400 mt-1">{errors.bathrooms}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-1.5"
            htmlFor="propertyType"
          >
            Property Type
          </label>
          <select
            id="propertyType"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
            className="border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0099ff]/50 focus:border-[#0099ff] bg-[#1c1c1f] text-white"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#1c1c1f] text-white">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-1.5"
            htmlFor="commute"
          >
            Max Commute Time
          </label>
          <select
            id="commute"
            value={form.maxCommuteTime}
            onChange={(e) => {
              setForm({ ...form, maxCommuteTime: Number(e.target.value) });
              if (errors.commute) setErrors((prev) => ({ ...prev, commute: undefined }));
            }}
            className={`border rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-1 bg-[#1c1c1f] text-white ${
              errors.commute ? "border-rose-500 focus:ring-rose-500/50" : "border-white/10 focus:ring-[#0099ff]/50"
            }`}
          >
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <option key={mins} value={mins} className="bg-[#1c1c1f] text-white">
                {mins} Minutes
              </option>
            ))}
          </select>
          {errors.commute && <p className="text-[10px] font-bold text-rose-400 mt-1">{errors.commute}</p>}
        </div>
      </div>

      <div className="mt-6 border-t border-white/5 pt-6">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#999999] mb-3">
          My Priorities{" "}
          <span className="text-slate-500 font-normal lowercase">(select all that apply)</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {PRIORITY_OPTIONS.map((opt) => {
            const selected = form.priorities.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                id={`priority-${opt.value}`}
                onClick={() => togglePriority(opt.value)}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  selected
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-[#0a0a0b] text-[#999999] border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          id="find-properties-btn"
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl hover:scale-95 duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer transition-transform"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Search Properties"
          )}
        </button>
      </div>
    </form>
  );
}
