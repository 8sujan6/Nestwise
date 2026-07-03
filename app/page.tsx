"use client";

import { useState, useEffect, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import RecommendationList from "@/components/RecommendationList";
import { SearchFormData, AgentResponse, ChatMessage } from "@/lib/types";
import { GroqMessage } from "@/lib/groq";
import {
  filterMockListings,
  getMockNeighborhoodInfo,
  getMockCommuteTime,
  getMockPriceHistory,
} from "@/lib/mockData";

const STATUS_MESSAGES: Record<string, string> = {
  searching: "Searching property listings...",
  neighborhood: "Analyzing neighborhood statistics...",
  commute: "Calculating commute routes...",
  investment: "Projecting investment growth...",
  ranking: "Evaluating and ranking candidates...",
};

const CHAT_PRIORITIES = [
  {
    value: "schools",
    label: "Schools",
    phrase: "focuses on good schools",
    icon: (
      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    ),
  },
  {
    value: "crime",
    label: "Safety",
    phrase: "safe neighborhood with low crime",
    icon: (
      <svg className="w-3.5 h-3.5 text-[#0099ff] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/>
      </svg>
    ),
  },
  {
    value: "walkability",
    label: "Walkability",
    phrase: "highly walkable area",
    icon: (
      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5.5 8.5 6-6 6 6"/>
        <path d="M11.5 2.5v16"/>
        <path d="M17.5 14.5h-12"/>
      </svg>
    ),
  },
  {
    value: "investment",
    label: "Investment",
    phrase: "strong investment growth potential",
    icon: (
      <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [rawHistory, setRawHistory] = useState<GroqMessage[]>([]);
  const [filterRecommendations, setFilterRecommendations] = useState<AgentResponse | null>(null);
  const [chatRecommendations, setChatRecommendations] = useState<AgentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [leftPanelMode, setLeftPanelMode] = useState<"filter" | "chat">("filter");
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const [lastSentText, setLastSentText] = useState("");

  const [activePreferences, setActivePreferences] = useState<SearchFormData>({
    city: "Austin",
    budget: 600000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "Any",
    maxCommuteTime: 30,
    priorities: [],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  async function submitQuery(userText: string, preferencesOverride?: SearchFormData) {
    const prefs = preferencesOverride || activePreferences;
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus("searching");
    setLastSentText(userText);

    const newChatHistory = [...chatHistory];
    const userMsgId = Math.random().toString(36).substring(7);
    newChatHistory.push({
      id: userMsgId,
      role: "user",
      content: userText,
    });
    setChatHistory(newChatHistory);

    const nextRawHistory = [...rawHistory, { role: "user", content: userText } as GroqMessage];
    setRawHistory(nextRawHistory);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextRawHistory,
          currentPreferences: prefs,
        }),
      });

      if (!res.ok) {
        setErrorMessage("Unable to contact the AI service. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      if (!res.body) {
        throw new Error("No response body received from the server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "progress") {
              setLoadingStatus(parsed.status);
            } else if (parsed.type === "result") {
              if (parsed.data.error) {
                setErrorMessage(parsed.data.error);
              } else {
                const responseData: AgentResponse & { history?: GroqMessage[] } = parsed.data;
                setChatRecommendations({
                  recommendations: responseData.recommendations,
                  summary: responseData.summary,
                  error: responseData.error,
                });

                if (responseData.history) {
                  setRawHistory(responseData.history);
                }

                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(7),
                    role: "assistant",
                    content: responseData.summary,
                    recommendations: responseData.recommendations,
                  },
                ]);
              }
            }
          } catch (e) {
            console.error("Failed to parse stream line:", e);
          }
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormSearch(data: SearchFormData): void {
    setActivePreferences(data);
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStatus("searching");

    try {
      const listings = filterMockListings(
        data.city,
        undefined,
        data.budget,
        data.bedrooms,
        data.bathrooms,
        data.propertyType
      );

      const recommendations = listings.map((p) => {
        let neighborhood;
        let commute;
        let priceHistory;

        try {
          neighborhood = getMockNeighborhoodInfo(p.id);
        } catch {}
        try {
          commute = getMockCommuteTime(p.id);
        } catch {}
        try {
          priceHistory = getMockPriceHistory(p.id);
        } catch {}

        return {
          property: p,
          score: 100,
          reasons: ["Matches specified search preferences criteria."],
          neighborhood,
          commute,
          priceHistory,
        };
      });

      setFilterRecommendations({
        recommendations,
        summary: `Direct Search: Found ${listings.length} matches in ${data.city}.`,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No properties found matching active filters.");
      setFilterRecommendations(null);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  }

  function handleSendChat(e: React.FormEvent): void {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userText = inputValue;
    setInputValue("");
    setSelectedPills([]);
    submitQuery(userText);
  }

  function handlePillClick(pill: typeof CHAT_PRIORITIES[number]): void {
    const isSelected = selectedPills.includes(pill.value);
    let newPills: string[];
    let newInputValue = inputValue;

    if (isSelected) {
      newPills = selectedPills.filter((v) => v !== pill.value);
      const escaped = pill.phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(,\\s*)?${escaped}(\\s*,)?|${escaped}`, "gi");
      newInputValue = newInputValue.replace(regex, "").trim();
      newInputValue = newInputValue.replace(/^,\s*|,\s*$/g, "").replace(/,\s*,/g, ",").trim();
    } else {
      newPills = [...selectedPills, pill.value];
      if (newInputValue.trim()) {
        newInputValue = `${newInputValue.trim()}, ${pill.phrase}`;
      } else {
        newInputValue = pill.phrase;
      }
    }

    setSelectedPills(newPills);
    setInputValue(newInputValue);
  }

  function handleTryAgain(): void {
    if (lastSentText) {
      setChatHistory((prev) => prev.slice(0, -1));
      setRawHistory((prev) => prev.slice(0, -1));
      submitQuery(lastSentText);
    }
  }

  function handleReset(): void {
    setChatHistory([]);
    setRawHistory([]);
    setFilterRecommendations(null);
    setChatRecommendations(null);
    setErrorMessage(null);
    setIsLoading(false);
    setLoadingStatus("");
    setLeftPanelMode("filter");
    setSelectedPills([]);
    setLastSentText("");
    setActivePreferences({
      city: "Austin",
      budget: 600000,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: "Any",
      maxCommuteTime: 30,
      priorities: [],
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white flex flex-col pb-16">
      <header className="bg-[#0a0a0b] border-b border-white/5 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#0099ff]/50 rounded-xl p-1 cursor-pointer"
            aria-label="Reset Nestwise Search"
          >
            <svg
              className="w-6 h-6 text-[#0099ff]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Nestwise</h1>
              <p className="text-[10px] text-[#999999] font-medium">
                Personalized Real Estate Search
              </p>
            </div>
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 hover:text-rose-200 cursor-pointer"
          >
            New Conversation
          </button>
        </div>
      </header>

      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Top Section: Conversational Chat Interface OR Structured Filter Form */}
        <div className={`max-w-4xl w-full mx-auto flex flex-col bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-lg ${leftPanelMode === "chat" ? "h-[460px] lg:h-[480px]" : "h-auto"}`}>
          {/* Segmented Controller Tab Selector */}
          <div className="bg-[#0e0e10] border-b border-white/5 p-3 flex justify-center shrink-0">
            <div className="flex items-center gap-1.5 bg-[#0a0a0b] p-1 rounded-full border border-white/5">
              <button
                onClick={() => setLeftPanelMode("filter")}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  leftPanelMode === "filter"
                    ? "bg-white text-black font-black shadow-sm"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setLeftPanelMode("chat")}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  leftPanelMode === "chat"
                    ? "bg-white text-black font-black shadow-sm"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                Assistant
              </button>
            </div>
          </div>

          {leftPanelMode === "filter" ? (
            <div className="p-6">
              <SearchForm onSearch={handleFormSearch} isLoading={isLoading} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <svg className="w-12 h-12 mb-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p className="text-sm font-bold text-slate-400">Nestwise Advisor Chat</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Describe what you are looking for in plain English, or select one of the priorities shortcut buttons below.
                    </p>
                  </div>
                )}

                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4.5 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-white text-black font-semibold rounded-br-none shadow"
                          : "bg-[#1c1c1f] text-slate-200 rounded-bl-none border border-white/5 font-medium"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-none px-4.5 py-3 bg-[#1c1c1f] border border-white/5 text-slate-400 flex items-center gap-3">
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-white/5 border-t-white animate-spin shrink-0" />
                      <span className="text-xs font-semibold animate-pulse">
                        {STATUS_MESSAGES[loadingStatus] || "Finding matching homes..."}
                      </span>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-rose-955/30 border border-rose-900/40 rounded-xl text-rose-300 text-xs font-bold leading-relaxed flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                    {lastSentText && (
                      <button
                        onClick={handleTryAgain}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Container */}
              <div className="p-4 border-t border-white/5 bg-[#0e0e10] flex flex-col gap-3 shrink-0">
                {/* Priorities Selectors */}
                <div className="flex flex-wrap gap-2">
                  {CHAT_PRIORITIES.map((pill) => {
                    const active = selectedPills.includes(pill.value);
                    return (
                      <button
                        key={pill.value}
                        type="button"
                        onClick={() => handlePillClick(pill)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? "bg-white text-black border-white font-black shadow-sm"
                            : "bg-[#1c1c1f] text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {pill.icon}
                        <span>{pill.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question or request adjustments (e.g. 'Show me only condos' or 'Why is B ranked above A?')..."
                    disabled={isLoading}
                    className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0099ff]/50 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-white text-black p-2.5 rounded-xl hover:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Full Width Active Shortlist Panel */}
        {leftPanelMode === "filter" && filterRecommendations && (
          <div className="w-full bg-[#121214] border border-white/10 rounded-2xl shadow-lg p-6">
            <RecommendationList data={filterRecommendations} />
          </div>
        )}

        {leftPanelMode === "chat" && chatRecommendations && (
          <div className="w-full bg-[#121214] border border-white/10 rounded-2xl shadow-lg p-6">
            <RecommendationList data={chatRecommendations} />
          </div>
        )}
      </div>
    </main>
  );
}
