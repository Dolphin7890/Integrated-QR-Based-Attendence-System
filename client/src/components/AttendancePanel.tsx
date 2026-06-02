import { useCallback, useEffect, useState } from 'react';
import { Card, Button, Badge } from './UI';
import QRScanner from './QRScanner';
import StudentModal from './StudentModal';
import ClassModal from './ClassModal';

const API_URL = 'http://localhost:5000/api';

interface ClassItem {
    ClassID: string;
    ClassName: string;
    Subject: string;
    TeacherID: string;
}

interface AttendanceRecord {
    id: number;
    student_name: string;
    class_name: string;
    class_id: string;
    time: string;
    status: string;
}

const AttendancePanel = () => {
    const [scanning, setScanning] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [showClasses, setShowClasses] = useState(false);
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/history/attendance`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch {
            console.error("Failed to fetch history");
        }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
                // Auto-select first class if available and none selected
                setSelectedClass(current => current || data[0]?.ClassID || '');
            }
        } catch {
            console.error("Failed to fetch classes");
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        fetchClasses();
    }, [fetchClasses, fetchHistory]);

    const handleScan = async (data: string) => {
        if (!selectedClass) {
            setMessage({ type: 'error', text: 'Please select a class first' });
            setScanning(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/attendance/mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_qr: data, class_id: selectedClass })
            });
            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Marked Present: ${result.student.name}` });
                fetchHistory();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to mark attendance' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' });
        }
    };

    return (

        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Control Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-10 backdrop-blur-md bg-white/90">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 truncate">Classroom Attendance</h2>
                    <p className="text-slate-500 text-xs truncate">Active Session: {classes.find(c => c.ClassID === selectedClass)?.ClassName || 'Select Class'}</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <select
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="" disabled>Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.ClassID} value={cls.ClassID}>
                                    {cls.ClassName} ({cls.Subject})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setShowClasses(true)} className="px-3 py-2 text-xs font-medium whitespace-nowrap">Manage Classes</Button>
                        <Button variant="secondary" onClick={() => setShowStudents(true)} className="px-3 py-2 text-xs font-medium whitespace-nowrap">students</Button>
                        <Button
                            onClick={() => {
                                if (!selectedClass) {
                                    setMessage({ type: 'error', text: 'Please select a class' });
                                    setTimeout(() => setMessage(null), 3000);
                                    return;
                                }
                                setScanning(true);
                            }}
                            disabled={!selectedClass}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-md shadow-blue-500/20 ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Scan
                        </Button>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-medium animate-fade-in-down ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {message.text}
                </div>
            )}

            {/* Grouped Attendance Grid */}
            <div className={history.length === 0 ? "" : "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"}>
                {history.length === 0 ? (
                    <Card className="text-center py-12 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No attendance today</h3>
                        <p className="text-slate-500 text-sm mt-1">Select a class and start scanning to see records here</p>
                    </Card>
                ) : (
                    Object.entries(history.reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
                        const className = record.class_name || 'Unknown Class';
                        if (!acc[className]) acc[className] = [];
                        acc[className].push(record);
                        return acc;
                    }, {})).map(([className, records]) => (
                        <Card key={className} className="overflow-hidden border-t-4 border-t-blue-500">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    {className}
                                </h3>
                                <div className="flex gap-2">
                                    <Badge color="blue">{records.length} Present</Badge>
                                    <Button
                                        variant="secondary"
                                        className="text-xs py-0.5 px-2 h-auto"
                                        onClick={() => {
                                            const classId = records[0].class_id;
                                            window.location.href = `${API_URL}/attendance/download/${classId}`;
                                        }}
                                        title="Download Today's Attendance CSV"
                                    >
                                        ⬇ CSV
                                    </Button>
                                </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                            <th className="pb-3 pl-2">Time</th>
                                            <th className="pb-3">Student</th>
                                            <th className="pb-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {records.map((record) => (
                                            <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-2.5 pl-2 text-xs text-slate-500 font-mono">{record.time}</td>
                                                <td className="py-2.5 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{record.student_name}</td>
                                                <td className="py-2.5 text-right"><span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">✓</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {scanning && <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />}
            {showStudents && <StudentModal onClose={() => setShowStudents(false)} />}
            {showClasses && <ClassModal onClose={() => {
                setShowClasses(false);
                fetchClasses(); // Refresh list on close in case new classes were added
            }} />}
        </div>
    );
};

export default AttendancePanel;
