import { useState } from 'react';
import { useRouter } from 'next/router';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      alert('Please fill in all fields');
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
  
      if (response.status == 404) {
        alert('Email does not exist.');
      } else if (response.status == 401) {
        alert('Wrong password/username.');
      } else if (!response.ok){
        alert('Bad!')
      } else {
        alert('Success!');
        router.push('/');
      }
    };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
