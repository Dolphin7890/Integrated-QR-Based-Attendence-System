import { useState, useEffect } from 'react';
import { Button } from './UI';

const API_URL = 'http://localhost:5000/api';

interface ClassItem {
    ClassID: string;
    ClassName: string;
    Subject: string;
    TeacherID: string;
}

interface ClassModalProps {
    onClose: () => void;
}

const ClassModal = ({ onClose }: ClassModalProps) => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (res.ok) setClasses(await res.json());
        } catch {
            console.error("Failed to fetch classes");
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    className,
                    subject,
                    teacherId
                })
            });
            if (res.ok) {
                setClassName('');
                setSubject('');
                setTeacherId('');
                fetchClasses();
            } else {
                alert("Failed to create class");
            }
        } catch {
            alert("Network error");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Manage Classes</h2>
                    <Button variant="secondary" onClick={onClose} className="text-sm py-1 px-3">
                        Close
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Create Form */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Class</h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Class Name</label>
                                <input
                                    required
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Intro to CS"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Subject Code</label>
                                <input
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. CS-101"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Teacher ID</label>
                                <input
                                    required
                                    value={teacherId}
                                    onChange={(e) => setTeacherId(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. T-005"
                                />
                            </div>
                            <div className="sm:col-span-3 flex justify-end mt-2">
                                <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 w-full sm:w-auto text-white">
                                    {loading ? 'Creating...' : 'Create Class'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Existing Classes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map(cls => (
                                <div key={cls.ClassID} className="p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{cls.ClassName}</p>
                                            <p className="text-sm text-slate-500 font-medium">{cls.Subject}</p>
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">
                                            {cls.TeacherID}
                                        </span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 font-mono">
                                        ID: {cls.ClassID}
                                    </div>
                                </div>
                            ))}
                            {classes.length === 0 && (
                                <p className="text-slate-500 col-span-2 text-center py-8">No classes found. Create one above.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassModal;
