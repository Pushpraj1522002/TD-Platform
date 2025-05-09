import * as React from "react";
import FormInput from "./FormInput";
import { useNavigate, Link } from "react-router-dom";
import {useGoogleLogin} from "@react-oauth/google";

export default function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleNavigation = () => {
    navigate("/auth/signup");
  };

  const [formData, setFormData] = React.useState({
    email: "",
    password: ""
  });

  // Check if there's an email stored in localStorage (from signup redirect)
  React.useEffect(() => {
    const storedEmail = localStorage.getItem('loginEmail');
    if (storedEmail) {
      setFormData(prev => ({
        ...prev,
        email: storedEmail
      }));
      // Clear the stored email
      localStorage.removeItem('loginEmail');
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate form data
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Login successful! Redirecting...");
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Add a small delay to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
        console.error('Login failed:', data.error);
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error('Login error:', error);
    }
  };
  
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        if (response && response.code) {
          // Send the code to our backend
          const apiResponse = await fetch('http://localhost:3000/api/auth/google/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: response.code })
          });
          
          const data = await apiResponse.json();
          
          if (apiResponse.ok) {
            setSuccess("Login successful! Redirecting...");
            // Store the token in localStorage
            if (data.token) {
              localStorage.setItem('authToken', data.token);
            }
            // Add a small delay to show the success message
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else {
            // If user doesn't exist, redirect to signup
            if (apiResponse.status === 404) {
              setError("Account not found. Please sign up first.");
              // Store the Google data for signup
              localStorage.setItem('googleSignupData', JSON.stringify({
                email: data.email,
                name: data.name
              }));
              // Redirect to signup page
              setTimeout(() => {
                navigate('/auth/signup');
              }, 1500);
            } else {
              // Handle other errors, including the case where user already exists
              if (data.error && data.error.includes('already registered')) {
                setError("This email is already registered. Please use your password to log in or reset your password.");
                // Clear the form data to encourage using password login
                setFormData({
                  email: data.email || "",
                  password: ""
                });
              } else {
                setError(data.error || "Google login failed. Please try again.");
              }
            }
          }
        }
      } catch (error) {
        setError("Network error during Google login. Please try again.");
        console.error('Google login error:', error);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    },
    flow: 'auth-code'
  });

  return (
    <div className="rounded-2xl bg-[#1a1a1a] p-8 px-12 shadow-lg mb-8 mt-8  ">
      <form onSubmit={handleSubmit} className="flex flex-col items-start pt-1 my-auto w-full max-w-md">
        <h1 className="text-5xl font-bold text-white max-md:text-4xl">
          Welcome Back!
        </h1>
        
        {error && (
          <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="w-full mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500 text-sm">
            {success}
          </div>
        )}
        
        <div className="flex gap-1.5 mt-3 text-base">
          <div className="grow text-white">New here?</div>
          <button className="font-semibold text-violet-400" tabIndex={0} onClick={handleNavigation}>Sign Up here</button>
        </div>

        <FormInput
          label="Email"
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Password"
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="flex pt-3 self-end text-sm font-medium text-white hover:text-violet-400 transition-colors">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        
        <div className="w-full mt-2 text-sm text-stone-300">
          <p>Note: If you signed up with Google, please use the "Login with Google" button below instead of this form.</p>
        </div>
        
        <div className="flex flex-col pt-7 self-center items-center mt-3 max-w-full text-sm text-white w-[300px]">
          <button 
            type="submit"
            className="px-6 py-3 mt-4 text-sm font-bold text-center text-white bg-violet-400 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.12)] max-md:px-5"
          >
            Log In
          </button>

          <div className="flex py-5 items-center gap-5 mt-4 w-full">
            <div className="flex-grow h-px bg-stone-300 opacity-30" />
            <div className="text-center text-sm text-stone-300">or</div>
            <div className="flex-grow h-px bg-stone-300 opacity-30" />
          </div>

          <button
            onClick={() => handleGoogleLogin()}
            className="flex items-center gap-3.5 px-4 py-2.5 mt-4 text-base font-medium text-white rounded-2xl border border-violet-400 border-solid shadow-[0px_2px_4px_rgba(0,0,0,0.12)] hover:bg-violet-400/10 transition-colors"
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/aefa27f3a4d84b2fb61917384a45b85c/77f5eef20cce35daae6d8f7074e6d05e5e1213978c1b1d16980fdf46d04294db?apiKey=aefa27f3a4d84b2fb61917384a45b85c&"
              alt="Google logo"
              className="object-contain rounded-full w-[19px]"
            />
            <span className="flex-grow text-center">Login with Google</span>
          </button>
        </div>

      </form>
    </div>
  );
}