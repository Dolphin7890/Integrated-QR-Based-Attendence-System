import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card, Button } from './UI';

const API_URL = 'http://localhost:5000/api';

interface Book {
    BookID: string;
    Title: string;
    Author: string;
    Book_QR_Code_Value: string;
}

const BooksPanel = () => {
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
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">Book Management</h2>
                <Button
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_URL}/books/download_all`;
                        link.setAttribute('download', 'books_qrs.zip');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                >
                    Download All QRs
                </Button>
            </div>

            {/* Create Form */}
            <Card>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-slate-500 text-sm mb-1 font-medium">Book Title</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="e.g. Python Mastery"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-slate-500 text-sm mb-1 font-medium">Author</label>
                        <input
                            required
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="e.g. Guido van Rossum"
                        />
                    </div>
                    <Button disabled={loading} className="bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 w-full sm:w-auto text-white">
                        {loading ? 'Saving...' : 'Add Book'}
                    </Button>
                </form>
            </Card>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map(b => (
                    <Card key={b.BookID} className="flex justify-between items-center hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
                        <div>
                            <p className="font-bold text-lg text-slate-800">{b.Title}</p>
                            <p className="text-sm text-slate-500">by {b.Author}</p>
                            <p className="text-xs text-slate-400 font-mono mt-1">{b.BookID}</p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setShowQR(b)}
                            className="text-sm px-3 py-1"
                        >
                            View QR
                        </Button>
                    </Card>
                ))}
            </div>

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowQR(null)}>
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900">{showQR.Title}</h3>
                        <p className="text-slate-500 text-sm">by {showQR.Author}</p>
                        <div className="mx-auto bg-white p-2">
                            <QRCode value={showQR.Book_QR_Code_Value} size={200} />
                        </div>
                        <p className="font-mono text-sm text-slate-500">{showQR.Book_QR_Code_Value}</p>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => window.print()} className="bg-slate-900 text-white hover:bg-slate-800">Print</Button>
                            <Button onClick={() => setShowQR(null)} variant="secondary" className="bg-slate-200 text-slate-800 hover:bg-slate-300 border-transparent">Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPanel;
