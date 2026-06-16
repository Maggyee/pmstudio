"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function Tabs({
  tabs,
  defaultValue,
}: {
  tabs: Tab[];
  defaultValue?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue ?? tabs[0]?.id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-4">
      <div className="flex min-h-10 gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "h-8 shrink-0 rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950",
              activeTab === tab.id && "bg-white text-neutral-950 shadow-sm",
            )}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{activeContent}</div>
    </div>
  );
}
