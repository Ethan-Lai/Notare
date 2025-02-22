import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useNotes } from '../context/NotesContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { fetchNotes } = useNotes();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email && !username) {
      alert('Please fill in either username or email.');
      return;
    }
    const response = await fetch("/api/authentication/validateAccount", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password
      })
    });
  
    const data = await response.json();
  
    if (response.status == 404) {
      alert('Email does not exist.');
    } else if (response.status == 401) {
      alert('Wrong password/username.');
    } else if (!response.ok){
      alert('Bad!')
    } else {
      if (data && data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
        console.log('Saved userId to localStorage:', localStorage.getItem('userId'));
        alert('Success!');
        router.push('/');
        fetchNotes();
      } else {
        console.error('No user ID found in response');
        alert('Login error: No user ID received');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        <Link href='/signup' className="block text-center text-sm text-blue-600 hover:text-blue-500 mt-4">
          Don't have an Account?
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;