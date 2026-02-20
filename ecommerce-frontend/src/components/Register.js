import React, { useState } from 'react';

function Register( { onRegisterSuccess }) {

    const [firstname, setFirstname] = useState('');
    const [ lastname, setLastname ] = useState('');
    const [ mobilenumber, setMobilenumber ] = useState('');
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmpassword, setConfirmpassword] = useState('');

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

    const handleRegister = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstname,
                lastname,
                mobilenumber,
                username,
                password,
                confirm_password: confirmpassword,
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration Successful');
            onRegisterSuccess();
        } else {
            alert(getErrorMessage(data?.detail) || 'Registeration failed');
        }
    };

    return(
        <div>
            <h2>Register</h2>
            <div>
                <label>FirstName</label> <br />
                <input type="text" value= {firstname} onChange= {(e) => setFirstname(e.target.value)}></input>
            </div>
            <div>
                <label>LastName</label> <br />
                <input type="text" value= {lastname} onChange= {(e) => setLastname(e.target.value)}></input>
            </div>
            <div>
                <label>MobileNumber</label> <br />
                <input type="text" value ={mobilenumber} onChange = {(e) => setMobilenumber(e.target.value)}></input>
            </div>
            <div>
                <label>UserName</label> <br />
                <input type="text" value ={username} onChange = {(e) => setUsername(e.target.value)}></input>
            </div>
            <div>
                <label>password</label> <br />
                <input type="text" value ={password} onChange = {(e) => setPassword(e.target.value)}></input>
            </div>
            <div>
                <label>confirmpassword</label> <br />
                <input type="text" value ={confirmpassword} onChange = {(e) => setConfirmpassword(e.target.value)}></input>
            </div>

            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;