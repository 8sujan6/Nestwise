"use client";

import { AgentResponse } from "@/lib/types";
import PropertyCard from "./PropertyCard";

interface RecommendationListProps {
  data: AgentResponse;
}

export default function RecommendationList({ data }: RecommendationListProps) {
  const { recommendations, error } = data;

  if (error) {
    return (
      <div
        id="agent-error"
        className="mt-8 p-6 bg-rose-955/30 border border-rose-900/40 rounded-3xl max-w-2xl mx-auto animate-fade-in-up"
      >
        <p className="text-rose-400 font-bold flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Something went wrong
        </p>
        <p className="text-rose-300 text-sm mt-1.5 leading-relaxed">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div
        id="no-results"
        className="mt-8 p-8 bg-[#121214] border border-white/5 rounded-3xl text-center max-w-2xl mx-auto animate-fade-in-up"
      >
        <p className="text-[#999999] font-medium text-sm">
          No properties matched your criteria. Try increasing your budget or reducing filters.
        </p>
      </div>
    );
  }

  return (
    <section id="recommendations" className="mt-10 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
        <h2 className="text-xl font-black text-white tracking-tight">
          {recommendations.length} Match{recommendations.length === 1 ? "" : "es"} Found
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <PropertyCard key={rec.property.id} data={rec} rank={i + 1} activeTab="details" />
        ))}
      </div>
    </section>
  );
}
