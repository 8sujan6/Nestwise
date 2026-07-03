"use client";

import { useState } from "react";
import { RankedProperty } from "@/lib/types";

interface PropertyCardProps {
  data: RankedProperty;
  rank: number;
  activeTab: "details" | "neighborhood" | "commute" | "appreciation";
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black border border-white/10 bg-[#1c1c1f] text-slate-300">
      {type}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-900/10",
    "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-900/10",
    "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-900/10",
  ];
  const style = colors[rank - 1] ?? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-900/10";
  return (
    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-md ${style}`}>
      #{rank}
    </span>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#999999] bg-[#1c1c1f] px-2.5 py-1.5 rounded-xl border border-white/5">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="font-semibold text-white">{value}</span>
      <span className="text-[10px] text-slate-500 font-medium">{label}</span>
    </div>
  );
}

export default function PropertyCard({ data, rank, activeTab }: PropertyCardProps) {
  const { property, reasons, neighborhood, commute, priceHistory } = data;
  const [localTab, setLocalTab] = useState(activeTab);

  const tabs: ("details" | "neighborhood" | "commute" | "appreciation")[] = ["details", "neighborhood", "commute", "appreciation"];

  const handleKeyDown = (e: React.KeyboardEvent, currentIdx: number) => {
    let nextIdx = currentIdx;
    if (e.key === "ArrowRight") {
      nextIdx = (currentIdx + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    setLocalTab(tabs[nextIdx]);
    document.getElementById(`tab-${property.id}-${tabs[nextIdx]}`)?.focus();
  };

  const renderReason = (reason: string, idx: number) => {
    if (reason.startsWith("Selection:")) {
      return (
        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10">
          <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded shrink-0 border border-emerald-500/25">Selection</span>
          <span className="leading-relaxed">{reason.replace("Selection:", "").trim()}</span>
        </li>
      );
    }
    if (reason.startsWith("Trade-offs:")) {
      return (
        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/10">
          <span className="text-[9px] uppercase font-black tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded shrink-0 border border-amber-500/25">Trade-off</span>
          <span className="leading-relaxed">{reason.replace("Trade-offs:", "").trim()}</span>
        </li>
      );
    }
    if (reason.startsWith("Comparison:")) {
      return (
        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-blue-950/20 p-2.5 rounded-xl border border-blue-500/10">
          <span className="text-[9px] uppercase font-black tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded shrink-0 border border-blue-500/25">Comparison</span>
          <span className="leading-relaxed">{reason.replace("Comparison:", "").trim()}</span>
        </li>
      );
    }
    return (
      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-[#1c1c1f] p-2.5 rounded-xl border border-white/5">
        <span className="text-slate-500 mt-0.5 shrink-0">•</span>
        <span className="leading-relaxed">{reason}</span>
      </li>
    );
  };

  return (
    <article
      id={`property-card-${property.id}`}
      className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between animate-fade-in-up"
    >
      <div>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <RankBadge rank={rank} />
            <div>
              <p className="text-xs font-black text-[#999999]">Rank {rank}</p>
            </div>
          </div>
          <TypeBadge type={property.propertyType} />
        </div>

        <div className="mb-5 bg-[#0a0a0b]/60 p-4.5 rounded-xl border border-white/5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-3xl font-black text-white tracking-tight">
              ${(property.listingPrice ?? 0).toLocaleString()}
            </p>
            {property.estimatedValue !== undefined && property.estimatedValue !== null && (
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Est Value</span>
                <span className="text-xs font-bold text-slate-400">${property.estimatedValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <p className="text-xs font-semibold text-slate-300 leading-snug mb-3">
            {property.address}, {property.city}
          </p>

          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            <div className="text-center">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Beds</span>
              <span className="text-sm font-black text-white">{property.bedrooms ?? 0}</span>
            </div>
            <div className="text-center border-l border-r border-white/5">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Baths</span>
              <span className="text-sm font-black text-white">{property.bathrooms ?? 0}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Area</span>
              <span className="text-sm font-black text-white">{(property.squareFeet ?? 0).toLocaleString()} <span className="text-[9px] font-medium text-slate-500">sf</span></span>
            </div>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Property metrics"
          className="flex bg-[#0a0a0b] p-1 rounded-xl border border-white/5 mb-4 gap-1"
        >
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              id={`tab-${property.id}-${tab}`}
              role="tab"
              aria-selected={localTab === tab}
              aria-controls={`panel-${property.id}-${tab}`}
              tabIndex={localTab === tab ? 0 : -1}
              onClick={() => setLocalTab(tab)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all focus:outline-none ${
                localTab === tab
                  ? "bg-white text-black font-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "appreciation" ? "Invest" : tab}
            </button>
          ))}
        </div>

        <div
          id={`panel-${property.id}-${localTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${property.id}-${localTab}`}
          className="min-h-[140px] mb-5 focus:outline-none"
          tabIndex={0}
        >
          {localTab === "details" && (
            <div className="space-y-4">
              {property.description && (
                <p className="text-xs text-slate-300 leading-relaxed italic bg-[#0a0a0b]/40 p-3.5 rounded-2xl border border-white/5">
                  &ldquo;{property.description}&rdquo;
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {property.lotSizeAcres !== undefined && property.lotSizeAcres !== null && property.lotSizeAcres > 0 && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L2 22h20L12 2z"/>
                      </svg>
                    }
                    label="lot acres"
                    value={property.lotSizeAcres}
                  />
                )}
                {property.yearBuilt > 0 && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    }
                    label="built"
                    value={property.yearBuilt}
                  />
                )}
                {property.parkingSpaces > 0 && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-[#0099ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="1" y="3" width="22" height="18" rx="2"/>
                        <path d="M7 9h10"/>
                        <path d="M7 13h10"/>
                      </svg>
                    }
                    label="parking"
                    value={property.parkingSpaces}
                  />
                )}
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  }
                  label="monthly HOA"
                  value={property.hoaFee > 0 ? `$${property.hoaFee}` : "$0"}
                />
                {property.daysOnMarket !== undefined && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    }
                    label="days market"
                    value={property.daysOnMarket}
                  />
                )}
              </div>
            </div>
          )}

          {localTab === "neighborhood" && neighborhood && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>School Rating</span>
                    <span>{neighborhood.schoolRating} / 10</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0099ff] h-full rounded-full"
                      style={{ width: `${(neighborhood.schoolRating ?? 0) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Walkability Score</span>
                    <span>{neighborhood.walkability} / 100</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${neighborhood.walkability ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  }
                  label="crime level"
                  value={neighborhood.crimeLevel}
                />
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                  label="parks"
                  value={neighborhood.parksNearby}
                />
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  }
                  label="dining"
                  value={neighborhood.restaurantsNearby}
                />
                {neighborhood.hospitalDistanceKm !== undefined && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    }
                    label="hosp distance"
                    value={`${neighborhood.hospitalDistanceKm}km`}
                  />
                )}
                {neighborhood.internet && (
                  <InfoChip
                    icon={
                      <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="2"/>
                        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                      </svg>
                    }
                    label="internet"
                    value={neighborhood.internet}
                  />
                )}
              </div>
            </div>
          )}

          {localTab === "commute" && commute && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0a0a0b]/40 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Downtown</span>
                    <span className="text-xs font-bold text-white">{commute.downtownMinutes} mins</span>
                  </div>
                  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <div className="bg-[#0a0a0b]/40 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Airport</span>
                    <span className="text-xs font-bold text-white">{commute.airportMinutes} mins</span>
                  </div>
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className="bg-[#0a0a0b]/40 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Business Dist.</span>
                    <span className="text-xs font-bold text-white">{commute.businessDistrictMinutes} mins</span>
                  </div>
                  <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div className="bg-[#0a0a0b]/40 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">University</span>
                    <span className="text-xs font-bold text-white">{commute.universityMinutes} mins</span>
                  </div>
                  <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {localTab === "appreciation" && priceHistory && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                <div className="bg-emerald-500/10 w-9 h-9 rounded-xl flex items-center justify-center text-emerald-400 text-base shrink-0 border border-emerald-500/20">
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block">5-Year Growth</span>
                  <span className="text-base font-black text-emerald-400">+{priceHistory.fiveYearGrowthPercent}%</span>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Annual Avg</span>
                  <span className="text-xs font-bold text-white">+{priceHistory.averageAnnualGrowthPercent}%/yr</span>
                </div>
              </div>

              <div className="flex gap-2">
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  }
                  label="trend"
                  value={priceHistory.trend}
                />
                <InfoChip
                  icon={
                    <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  }
                  label="rating"
                  value={priceHistory.investmentRating}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="mt-auto border-t border-white/5 pt-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">Agent Justification</span>
          <ul className="space-y-2">
            {reasons.map((reason, i) => renderReason(reason, i))}
          </ul>
        </div>
      )}
    </article>
  );
}
