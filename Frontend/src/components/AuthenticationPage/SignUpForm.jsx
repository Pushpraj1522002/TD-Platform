import * as React from "react";
import FormInput from "./FormInput";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleNavigation = () => {
    navigate("/auth/login");
  };

  const [formData, setFormData] = React.useState({
    name:"",
    email: "",
    password: ""
  });

  // Check if there's Google signup data from login page
  React.useEffect(() => {
    const googleSignupData = localStorage.getItem('googleSignupData');
    if (googleSignupData) {
      try {
        const { email, name } = JSON.parse(googleSignupData);
        setFormData(prev => ({
          ...prev,
          email: email || prev.email,
          name: name || prev.name
        }));
        // Clear the stored data
        localStorage.removeItem('googleSignupData');
      } catch (error) {
        console.error('Error parsing Google signup data:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log('handleChange called with:', { id, value });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [id]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    setSuccess(""); // Clear any previous success messages
    
    // Debug: Log the form data
    console.log('Form data before validation:', formData);
    console.log('Form data values:', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    console.log('Form data types:', {
      name: typeof formData.name,
      email: typeof formData.email,
      password: typeof formData.password
    });
    
    // Validate form data
    if (!formData.email || !formData.password || !formData.name) {
      console.log('Validation failed:', {
        email: !formData.email,
        password: !formData.password,
        name: !formData.name
      });
      setError("All fields are required");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      console.log('Sending signup request with data:', formData);
      
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        setSuccess("Signup successful! Redirecting...");
        // Store the token in localStorage if available
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Add a small delay to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Check if the user is already registered and should be redirected to login
        if (data.redirectToLogin) {
          setError("This email is already registered. Redirecting to login...");
          // Store the email in localStorage for the login page
          localStorage.setItem('loginEmail', data.email);
          // Add a small delay to show the message
          setTimeout(() => {
            navigate('/auth/login');
          }, 1500);
          return;
        }
        
        setError(data.error || 'Signup failed. Please try again.');
        console.error('Signup error:', data.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        if (response && response.code) {
          // Send the code to our backend
          const apiResponse = await fetch('http://localhost:3000/api/auth/google/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: response.code })
          });
          
          const data = await apiResponse.json();
          
          if (apiResponse.ok) {
            setSuccess("Signup successful! Redirecting...");
            //Store the token in localStorage
            if(data.taken){
              localStorage.setItem('authToken', data.token);
            }

            //Add a small dalay to show the success message
            setTimeout(()=>{
              navigate('/dashboard');
            }, 1500);
          } else {
            setError(data.error || "Google signup failed. Please try again.");
          }
        }
      } catch (error) {
        setError("Network error during Google signup. Please try again.");
        console.error('Google signup error:', error);
      }
    },
    onError: () => {
      setError("Google signup failed. Please try again.");
    },
    flow: 'auth-code'
  });

  return (
    <div className="rounded-2xl bg-[#1a1a1a] p-8 px-12 shadow-lg mb-8 mt-8  ">
      <form onSubmit={handleSubmit} className="flex flex-col items-start pt-1 my-auto w-full max-w-md ">
        <h1 className="text-5xl font-bold text-white max-md:text-4xl pr-32">
          Welcome!
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
          <div className="grow text-white">Already have an account?</div>
          <button 
            className="font-semibold text-violet-400" 
            tabIndex={0}
            onClick={handleNavigation}
          >
              Log in here
          </button>
        </div>
        <FormInput
          label="Name"
          type="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

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
        
        {/* Add a note about Google signup */}
        <div className="w-full mt-2 text-sm text-stone-300">
          <p>Note: If you want to sign up with Google, please use the "Sign up with Google" button below instead of this form.</p>
        </div>
        
        <div className="flex flex-col pt-7 self-center items-center mt-3 max-w-full text-sm text-white w-[300px]">
          <button 
            type="submit"
            className="px-6 py-3 mt-1 text-sm font-bold text-center text-white bg-violet-400 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.12)] max-md:px-5"
          >
            Sign Up
          </button>

          <div className="flex py-5 items-center gap-5 mt-1 w-full">
            <div className="flex-grow h-px bg-stone-300 opacity-30" />
            <div className="text-center text-sm text-stone-300">or</div>
            <div className="flex-grow h-px bg-stone-300 opacity-30" />
          </div>

          <button
            onClick={() => handleGoogleSignUp()}
            className="flex items-center gap-3.5 px-4 py-2.5 mt-1 text-base font-medium text-white rounded-2xl border border-violet-400 border-solid shadow-[0px_2px_4px_rgba(0,0,0,0.12)] hover:bg-violet-400/10 transition-colors"
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/aefa27f3a4d84b2fb61917384a45b85c/77f5eef20cce35daae6d8f7074e6d05e5e1213978c1b1d16980fdf46d04294db?apiKey=aefa27f3a4d84b2fb61917384a45b85c&"
              alt="Google logo"
              className="object-contain rounded-full w-[19px]"
            />
            <span className="flex-grow text-center">Sign up with Google</span>
          </button>
        </div>

      </form>
    </div>
  );
}