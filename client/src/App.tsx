import { useState } from 'react';
import AttendancePanel from './components/AttendancePanel';
import LibraryPanel from './components/LibraryPanel';

function App() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'library'>('attendance');
  const tabs = ['attendance', 'library'] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100">
      {/* Navigation Bar */}
      <nav className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800">Integrated QR System</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Welcome Back, <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-slate-500">Select a module to proceed with daily operations.</p>
        </header>

        {/* Tab Switches */}
        <div className="flex justify-center sm:justify-start gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'attendance' && <AttendancePanel />}
          {activeTab === 'library' && <LibraryPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;
