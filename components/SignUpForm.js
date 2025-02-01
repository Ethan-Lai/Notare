import { useState } from 'react';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !password) {
      alert('Please fill in all fields');
      return;
    }

    const response = await fetch("/api/authentication/createAccount", {
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
  
      if (response.status == 409) {
        alert('Conflict!');
      } else if (!response.ok) {
        alert('Bad.');
      } else {
        alert('Success!')
      }
    };

  return (
    <div className="signup-container">
      <h2>SignUp</h2>
      <form onSubmit={handleSubmit} className="signup-form">
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpForm;
