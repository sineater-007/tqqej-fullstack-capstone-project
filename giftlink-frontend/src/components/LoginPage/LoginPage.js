import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import {urlConfig} from '../../config';//Task 1: Import urlConfig from `giftlink-frontend/src/config.js`
import { useAppContext } from '../../context/AuthContext';//Task 2: Import useAppContext `giftlink-frontend/context/AuthContext.js`
import { useNavigate } from 'react-router-dom';//Task 3: Import useNavigate from `react-router-dom` to handle navigation after successful registration.

function LoginPage() {
    //insert code here to create useState hook variables for email, password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [incorrect, setIncorrect] = useState('');//Task 4: Include a state for incorrect password.

    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('bearer-token');
    const { setIsLoggedIn } = useAppContext(); //Task 5: Create a local variable for `navigate`,`bearerToken`   and `setIsLoggedIn`.
    useEffect(() => {
        if (sessionStorage.getItem('auth-token')) {
            navigate('/app')
        }
    }, [navigate])//Task 6. If the bearerToken has a value (user already logged in), navigate to MainPage

    // insert code here to create handleLogin function and include console.log
    const handleLogin = async () => {
        try{
            //first task
            const res = await fetch(`/api/auth/login`, {
            method: 'POST',//Task 7: Set method
            headers: {
                'content-type': 'application/json',
                'Authorization': bearerToken ? `Bearer ${bearerToken}` : '', // Include Bearer token if available
            },//Task 8: Set headers
            body: JSON.stringify({
                email: email,
                password: password,
            })//Task 9: Set body to send user details
            });
            const json = await res.json();// Task 1: Access data coming from fetch API
            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);// Task 2: Set user details
                setIsLoggedIn(true);// Task 3: Set the user's state to log in using the `useAppContext`.
                navigate('/app');// Task 4: Navigate to the MainPage after logging in.
            } else {
                document.getElementById("email").value="";
                document.getElementById("password").value="";
                setIncorrect("Wrong password. Try again.");
                //Below is optional, but recommended - Clear out error message after 2 seconds
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }// Task 5: Clear input and set an error message if the password is incorrect
         }catch (e) {
            console.log("Error fetching details: " + e.message);
        }
    }

        return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="login-card p-4 border rounded">
              <h2 className="text-center mb-4 font-weight-bold">Login</h2>

          {/* insert code here to create input elements for the variables email and  password */}
           <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    id="email"
                    type="text"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); setIncorrect("")}}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {setPassword(e.target.value);setIncorrect("")}}
                    />
                <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{incorrect}</span>// Task 6: Display an error message to the user.
            </div>
          {/* insert code here to create a button that performs the `handleLogin` function on click */}
            <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>
            
                <p className="mt-4 text-center">
                    New here? <a href="/app/register" className="text-primary">Register Here</a>
                </p>

            </div>
          </div>
        </div>
      </div>
    )
}

export default LoginPage;