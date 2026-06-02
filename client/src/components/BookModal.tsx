import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Button } from './UI';

const API_URL = 'http://localhost:5000/api';

interface Book {
    BookID: string;
    Title: string;
    Author: string;
    Book_QR_Code_Value: string;
}

interface BookModalProps {
    onClose: () => void;
}

const BookModal = ({ onClose }: BookModalProps) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState<Book | null>(null);

    const fetchBooks = async () => {
        try {
            const res = await fetch(`${API_URL}/books`);
            if (res.ok) setBooks(await res.json());
        } catch {
            console.error("Failed to fetch books");
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, author })
            });
            if (res.ok) {
                setTitle('');
                setAuthor('');
                fetchBooks();
            }
        } catch {
            alert("Failed to create book");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Manage Books</h2>
                    <Button variant="secondary" onClick={onClose} className="text-sm py-1 px-3">
                        Close
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Create Form */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Book</h3>
                        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Book Title</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="e.g. Python Mastery"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-slate-500 text-sm mb-1 font-medium">Author</label>
                                <input
                                    required
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="e.g. Guido van Rossum"
                                />
                            </div>
                            <Button disabled={loading} className="bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 w-full sm:w-auto text-white">
                                {loading ? 'Saving...' : 'Add Book'}
                            </Button>
                        </form>
                    </div>

                    {/* List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-700">Library Catalog</h3>
                            <Button onClick={() => window.open(`${API_URL}/books/qrs/download`, '_blank')} className="text-xs py-2 bg-slate-800 hover:bg-slate-900 text-white shadow-slate-500/20">
                                Download All QRs
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {books.map(b => (
                                <div key={b.BookID} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{b.Title}</p>
                                        <p className="text-xs text-slate-500 truncate">by {b.Author}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{b.BookID}</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowQR(b)}
                                        className="text-xs px-2 py-1 ml-2 shrink-0"
                                    >
                                        QR
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
                                <h3 className="text-2xl font-bold text-slate-900">{showQR.Title}</h3>
                                <p className="text-slate-500 text-sm">by {showQR.Author}</p>
                            </div>
                            <div className="mx-auto bg-white p-4 rounded-xl border-2 border-slate-100 inline-block shadow-sm" id="book-qr-container">
                                <QRCode id={`book-qr-${showQR.BookID}`} value={showQR.Book_QR_Code_Value} size={200} />
                            </div>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => {
                                    const svg = document.getElementById(`book-qr-${showQR.BookID}`);
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
                                            downloadLink.download = `${showQR.Title.substring(0, 10)}_QR.png`;
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

export default BookModal;
