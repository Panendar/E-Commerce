import React, { useState } from 'react';

function Login({ onLoginSuccess }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const getErrorMessage = (detail) => {
        if (!detail) return null;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) {
            return detail
                .map((e) => (typeof e?.msg === 'string' ? e.msg : JSON.stringify(e)))
                .join('\n');
        }
        return typeof detail?.message === 'string' ? detail.message : JSON.stringify(detail);
    };

    // need to change the URL since backend is running on different port and i deployed with firebase
    const handleLogin = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username, password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login Successful');
            onLoginSuccess(username);
    } else {
        alert(getErrorMessage(data?.detail) || 'Login failed');
    }
};

    return(
        <div>
            <h2>Login</h2>

            <div>
                <label>UserName</label> <br />
                <input type = "text" value ={username} onChange={(e) => setUsername(e.target.value)}></input>
            </div>
            
            <div>
                <label>Password</label> <br />
                <input type = "text" value ={password} onChange={(e) => setPassword(e.target.value)}></input>
            </div>

            <button onClick={handleLogin} >Login</button>
        </div>


    );
}

export default Login;