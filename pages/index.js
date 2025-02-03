import CreateNote from '../components/CreateNote';
import AskGemini from '../components/AskGemini';
import UploadNote from '../components/UploadNote';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('userId');
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
            <h1>Notes App</h1>
            
            <div style={{ flex: '1' }}>
                <CreateNote />
            </div>
            
            <div style={{ flex: '1' }}>
                <h2>Ask Gemini</h2>
                <AskGemini />
            </div>

            <UploadNote />
            <button
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
}