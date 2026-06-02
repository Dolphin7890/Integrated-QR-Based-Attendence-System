import { useState, useEffect } from 'react';
import { Card, Button, Badge } from './UI';
import QRScanner from './QRScanner';
import BookModal from './BookModal';

const API_URL = 'http://localhost:5000/api';

interface LibraryHistoryItem {
    id: number;
    student_name: string;
    book_title: string;
    issue_date: string;
    return_date: string;
}

interface LibraryDailyItem extends LibraryHistoryItem {
    type: 'Issued' | 'Returned';
}

const LibraryPanel = () => {
    const [mode, setMode] = useState<'issue' | 'return'>('issue');
    const [scanning, setScanning] = useState<'student' | 'book' | null>(null);
    const [showBooks, setShowBooks] = useState(false);
    const [txData, setTxData] = useState<{ student_qr?: string, book_qr?: string }>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [history, setHistory] = useState<LibraryHistoryItem[]>([]);
    const [daily, setDaily] = useState<LibraryDailyItem[]>([]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/history/library`);
            if (res.ok) setHistory(await res.json());

            const dailyRes = await fetch(`${API_URL}/library/daily`);
            if (dailyRes.ok) setDaily(await dailyRes.json());
        } catch { console.error("Failed to fetch library history"); }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleScan = async (data: string) => {
        const step = scanning;

        if (mode === 'issue') {
            if (step === 'student') {
                // VALIDATION: Check if it's actually a student QR
                if (!data.includes('QR-S-') && !data.includes('S-')) {
                    setMessage({ type: 'error', text: 'Invalid QR. Please scan a Student ID.' });
                    return;
                }

                setTxData({ ...txData, student_qr: data });
                setMessage({ type: 'success', text: 'Student scanned. Now scan the book.' });
                setScanning('book');
            } else if (step === 'book') {
                // VALIDATION: Check if it's actually a book QR
                if (!data.includes('QR-B-') && !data.includes('B-')) {
                    setMessage({ type: 'error', text: 'Invalid QR. Please scan a Book.' });
                    return;
                }

                // Perform Issue
                try {
                    const res = await fetch(`${API_URL}/library/issue`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            student_qr: txData.student_qr,
                            book_qr: data
                        })
                    });
                    const result = await res.json();
                    if (res.ok) {
                        setMessage({ type: 'success', text: `Issued "${result.book}" to ${result.student}` });
                        fetchHistory();
                    } else {
                        setMessage({ type: 'error', text: result.error || 'Failed to issue book' });
                    }
                } catch { setMessage({ type: 'error', text: 'Network error' }); }

                // Reset to student scan for next transaction if continuous
                setTimeout(() => {
                    setScanning('student');
                    setTxData({});
                    setMessage({ type: 'success', text: 'Ready for next student.' });
                }, 3000);
            }
        } else {
            // Return mode
            if (!data.includes('QR-B-') && !data.includes('B-')) {
                setMessage({ type: 'error', text: 'Invalid QR. Please scan a Book.' });
                return;
            }
            try {
                const res = await fetch(`${API_URL}/library/return`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ book_qr: data })
                });
                const result = await res.json();
                if (res.ok) {
                    setMessage({ type: 'success', text: `Returned "${result.book}"` });
                    fetchHistory();
                } else {
                    setMessage({ type: 'error', text: result.error || 'Failed to return book' });
                }
            } catch { setMessage({ type: 'error', text: 'Network error' }); }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Control Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-10 backdrop-blur-md bg-white/90">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 truncate">Library Management</h2>
                    <p className="text-slate-500 text-xs truncate">Current Mode: <span className="font-medium text-blue-600">{mode === 'issue' ? 'Issue Book' : 'Return Book'}</span></p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setMode('issue')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${mode === 'issue' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Issue
                        </button>
                        <button
                            onClick={() => setMode('return')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${mode === 'return' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Return
                        </button>
                    </div>
                    <Button variant="secondary" onClick={() => setShowBooks(true)} className="px-3 py-2 text-xs font-medium whitespace-nowrap">Manage Books</Button>
                </div>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-medium animate-fade-in-down ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Action Console */}
                <Card className={`border-t-4 ${mode === 'issue' ? 'border-t-blue-500' : 'border-t-purple-500'} min-h-[400px] flex flex-col justify-center`}>
                    {mode === 'issue' ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 shadow-sm transition-transform hover:scale-110 duration-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Issue a Book</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed">Scan the student's ID card first, followed by the book's QR code.</p>
                            </div>
                            <Button onClick={() => setScanning('student')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-sm font-bold uppercase tracking-wider rounded-full hover:-translate-y-1 transition-all">
                                Start Transaction
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600 shadow-sm transition-transform hover:scale-110 duration-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Return a Book</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 leading-relaxed">Simply scan the book's QR code to process the return instantly.</p>
                            </div>
                            <Button onClick={() => setScanning('book')} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 text-sm font-bold uppercase tracking-wider rounded-full hover:-translate-y-1 transition-all">
                                Scan Book
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Activity Feed */}
                <div className="space-y-6">
                    {/* Today's Activity */}
                    <Card>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Today's Logs
                            </h3>
                            <Badge color="blue">{daily.length} Txns</Badge>
                        </div>
                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            <table className="w-full text-left text-sm font-medium">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                        <th className="pb-3 pl-2">Book</th>
                                        <th className="pb-3 text-center">Action</th>
                                        <th className="pb-3 text-right pr-2">Student</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {daily.map((t) => (
                                        <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 pl-2 font-medium text-slate-700 truncate max-w-[120px]">{t.book_title}</td>
                                            <td className="py-2.5 text-center">
                                                <Badge color={t.type === 'Returned' ? 'green' : 'blue'}>{t.type}</Badge>
                                            </td>
                                            <td className="py-2.5 text-right pr-2 text-slate-500 text-xs font-mono truncate max-w-[100px]">{t.student_name}</td>
                                        </tr>
                                    ))}
                                    {daily.length === 0 && (
                                        <tr><td colSpan={3} className="py-8 text-center text-slate-400 text-xs italic">No activity recorded today</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Recent Transactions Table */}
                    <Card>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">History</h3>
                        </div>
                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            <table className="w-full text-left text-sm font-medium">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                        <th className="pb-3 pl-2">Book</th>
                                        <th className="pb-3">Issued</th>
                                        <th className="pb-3 text-right">Returned</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {history.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 pl-2 font-medium text-slate-700 truncate max-w-[120px]">{t.book_title}</td>
                                            <td className="py-2.5 text-slate-500 text-xs">{t.issue_date.split(' ')[0]}</td>
                                            <td className="py-2.5 text-right">
                                                {t.return_date !== 'Not Returned' ? (
                                                    <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">{t.return_date.split(' ')[0]}</span>
                                                ) : (
                                                    <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded-full">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan={3} className="py-8 text-center text-slate-400 text-xs italic">No history available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {scanning && (
                <QRScanner
                    onScan={handleScan}
                    onClose={() => { setScanning(null); setTxData({}); }}
                />
            )}
            {showBooks && <BookModal onClose={() => setShowBooks(false)} />}
        </div>
    );
};

export default LibraryPanel;
