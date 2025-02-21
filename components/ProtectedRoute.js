import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    // Show loading or nothing while checking authentication
    if (!authorized) {
        return null;
    }

    return children;
}