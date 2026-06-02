import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Button } from './UI';

const API_URL = 'http://localhost:5000/api';

interface Student {
    StudentID: string;
    Name: string;
    Email: string;
    QR_Code_Value: string;
}

interface StudentModalProps {
    onClose: () => void;
}

const StudentModal = ({ onClose }: StudentModalProps) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState<Student | null>(null);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_URL}/students`);
            if (res.ok) setStudents(await res.json());
        } catch {
            console.error("Failed to fetch students");
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            if (res.ok) {
                setName('');
                setEmail('');
                fetchStudents();
            }
        } catch {
            alert("Failed to create student");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Manage Students</h2>
                    <Button variant="secondary" onClick={onClose} className="text-sm py-1 px-3">
                        Close
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Create Form */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Student</h3>
                        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Full Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Email (Optional)</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="student@example.com"
                                />
                            </div>
                            <Button disabled={loading} className="bg-green-600 hover:bg-green-700 shadow-green-500/20 w-full sm:w-auto text-white">
                                {loading ? 'Saving...' : 'Add Student'}
                            </Button>
                        </form>
                    </div>

                    {/* List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-700">Registered Students</h3>
                            <Button onClick={() => window.open(`${API_URL}/students/qrs/download`, '_blank')} className="text-xs py-2 bg-slate-800 hover:bg-slate-900 text-white shadow-slate-500/20">
                                Download All QRs
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {students.map(s => (
                                <div key={s.StudentID} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-slate-800">{s.Name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{s.StudentID}</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowQR(s)}
                                        className="text-xs px-2 py-1"
                                    >
                                        View QR
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* QR Overlay */}
                {showQR && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4">
                        <div className="text-center space-y-6 max-w-sm w-full animate-fade-in-up">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{showQR.Name}</h3>
                                <p className="text-slate-500 font-mono">{showQR.StudentID}</p>
                            </div>
                            <div className="mx-auto bg-white p-4 rounded-xl border-2 border-slate-100 inline-block shadow-sm" id="qr-container">
                                <QRCode id={`qr-${showQR.StudentID}`} value={showQR.QR_Code_Value} size={200} />
                            </div>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => {
                                    const svg = document.getElementById(`qr-${showQR.StudentID}`);
                                    if (svg) {
                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const canvas = document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx?.drawImage(img, 0, 0);
                                            const pngFile = canvas.toDataURL("image/png");
                                            const downloadLink = document.createElement("a");
                                            downloadLink.download = `${showQR.Name}_QR.png`;
                                            downloadLink.href = pngFile;
                                            downloadLink.click();
                                        };
                                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                    }
                                }} className="bg-slate-800 text-white hover:bg-slate-900">Save QR Image</Button>
                                <Button onClick={() => setShowQR(null)} variant="secondary">Back</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentModal;
