// src/components/character/shared/CharacterTabs.tsx
'use client';

export interface TabDefinition {
  id: string;
  label: string;
  icon: string;
}

interface CharacterTabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function CharacterTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: CharacterTabsProps) {
  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition rounded-t-lg flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="tab-content">{children}</div>
    </div>
  );
}