import { supabase, supabaseAdmin } from '../db/supabase.js';
import { verifyGoogleToken, verifyGoogleCode } from '../lib/googleAuth.js';
import { generateToken } from '../lib/jwt.js';
import { sendResetEmail } from '../lib/email.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try{
        console.log('Signup request body:', req.body);
        const {email, password, name} = req.body;
        
        // Validate required fields
        if (!email || !password || !name) {
            console.log('Missing required fields:', { email, password, name });
            return res.status(400).json({ 
                error: 'Missing required fields. Please provide email, password, and name.' 
            });
        }

        const {data: authData, error: authError} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        })

        if(authError) {
            console.log('Supabase auth error:', authError);
            
            // Check if the error is "User already registered"
            if (authError.message && authError.message.includes('User already registered') || 
                (authError.code === 'user_already_exists')) {
                // Return a specific response for user already registered
                return res.status(409).json({
                    error: 'User already registered',
                    email: email,
                    redirectToLogin: true
                });
            }
            
            throw authError;
        }

        res.json({
            message: 'Signup successful',
            user: authData.user
        })
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
            email,
            password
        })
        
        if(authError) throw authError;

        const {data: profileData, error: profileError} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if(profileError) throw profileError;

        // Generate JWT token
        const token = generateToken(profileData);

        res.json({
            message: 'Login successful',
            user: authData.user,
            profile: profileData,
            token: token
        })
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

export const logout =  async (req, res) => {
    try{
        const {error} = await supabase.auth.signOut();

        if(error) throw error;

        res.json({message: 'Logged out successfully'});
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

export const getMe = async (req, res) => {
    try {
        const {data: {user}, error: authError} = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) throw new Error('User not found');

        const {data: profile, error: profileError} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        res.json({profile});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const OAuthLogin = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Google authorization code is required' });
        }
        
        // Verify the Google code and get user info
        const { payload } = await verifyGoogleCode(code);
        const { email, name, sub: googleId } = payload;
        
        // First check if user exists in Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error('Auth check error:', authError);
            return res.status(404).json({ 
                error: 'User not found. Please sign up first.',
                email,
                name
            });
        }

        const authUser = users.find(user => user.email === email);
        
        if (!authUser) {
            return res.status(404).json({ 
                error: 'User not found. Please sign up first.',
                email,
                name
            });
        }

        // If user exists in Auth, get their profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
        if (profileError) {
            console.error('Profile fetch error:', profileError);
            // If profile doesn't exist but auth does, create the profile
            const { data: newProfile, error: createProfileError } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: authUser.id,
                    email,
                    name
                }])
                .select()
                .single();

            if (createProfileError) {
                throw createProfileError;
            }

            const token = generateToken(newProfile);
            return res.json({
                message: 'Login successful',
                user: newProfile,
                token
            });
        }

        // Generate JWT token
        const token = generateToken(profile);

        res.json({
            message: 'Login successful',
            user: profile,
            token
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ error: error.message });
    }
}

export const OAuthSignup = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Google authorization code is required' });
        }
        
        // Verify the Google code and get user info
        const { payload } = await verifyGoogleCode(code);
        const { email, name, sub: googleId } = payload;
        
        // Check if user already exists in Auth
        const { data: { users }, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authCheckError) {
            throw authCheckError;
        }

        const existingAuthUser = users.find(user => user.email === email);
        
        if (existingAuthUser) {
            // User exists in Auth, get or create their profile
            const { data: existingProfile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', existingAuthUser.id)
                .single();

            if (!profileError && existingProfile) {
                const token = generateToken(existingProfile);
                return res.json({
                    message: 'Login successful (user already exists)',
                    user: existingProfile,
                    token
                });
            }

            // If profile doesn't exist or there was an error, upsert the profile
            const { data: newProfile, error: upsertError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: existingAuthUser.id,
                    email,
                    name
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (upsertError) throw upsertError;

            const token = generateToken(newProfile);
            return res.json({
                message: 'Profile created and login successful',
                user: newProfile,
                token
            });
        }
        
        // Create new user in Supabase Auth using admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                name,
                google_id: googleId
            }
        });
        
        if (authError) throw authError;
        
        // Create profile for the new user using admin client with upsert
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email,
                name
            }, {
                onConflict: 'id'
            })
            .select()
            .single();
        
        if (profileError) {
            console.error('Error creating profile:', profileError);
            throw profileError;
        }
        
        // Generate JWT token
        const token = generateToken(profileData);
        
        res.json({
            message: 'Signup successful',
            user: profileData,
            token
        });
    } catch (error) {
        console.error('Google signup error:', error);
        res.status(400).json({ error: error.message });
    }
}

// export const setPassword = async (req, res) => {
//     try {
//         const { email, password } = req.body;
        
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email and password are required' });
//         }
        
//         // Check if user exists
//         const { data: existingUser, error: userError } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('email', email)
//             .single();
            
//         if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
//             throw userError;
//         }
//         if (!existingUser) {
//             return res.status(404).json({ error: 'User not found' });
//         }
        
//         // Update the user's password in Supabase Auth
//         const { error: updateError } = await supabase.auth.admin.updateUserById(
//             existingUser.id,
//             { password: password }
//         );
        
//         if (updateError) {
//             console.error('Error updating password:', updateError);
            
//             // If admin update fails, try to sign in and update password
//             const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//                 email,
//                 password: 'google-auth' // Use a default password for Google users
//             });
            
//             if (authError) {
//                 throw new Error('Failed to update password. Please try again or contact support.');
//             }
            
//             // Now update the password
//             const { error: passwordError } = await supabase.auth.updateUser({
//                 password: password
//             });
            
//             if (passwordError) throw passwordError;
//         }
        
//         res.json({
//             message: 'Password set successfully. You can now log in with email and password.'
//         });
//     } catch (error) {
//         console.error('Set password error:', error);
//         res.status(400).json({ error: error.message });
//     }
// }


// ... existing code ...

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
  
    // 1. Find user in Supabase Auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error('Auth error:', authError);
        return res.status(500).json({ error: 'Internal error' });
    }
  
    const authUser = users.find(user => user.email === email);
    if (!authUser) return res.status(404).json({ error: 'User not found' });
  
    // 2. Ensure profile exists (use upsert and admin client)
    let { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
  
    if (profileError || !userProfile) {
      // Create or update profile if missing
      const { data: newProfile, error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert([{ id: authUser.id, email: authUser.email, name: authUser.user_metadata?.name || '' }], { onConflict: 'id' })
        .select()
        .single();
      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        return res.status(500).json({ error: 'Could not create user profile' });
      }
      userProfile = newProfile;
    }
  
    // 3. Generate token
    const token = jwt.sign({ id: authUser.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    // 4. Store token in profile (use admin client for RLS safety)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ reset_token: token, reset_token_expiry: new Date(Date.now() + 3600000) })
      .eq('id', authUser.id);
    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ error: 'Could not update user profile with reset token' });
    }
  
    // 5. Send email
    const resetLink = `http://localhost:5173/reset-password?token=${token}`; // Adjust for your frontend URL
    await sendResetEmail(email, resetLink);
  
    res.json({ message: 'Password reset email sent' });
};
  


export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
  
      console.log('Payload:', payload, 'Token:', token);
  
      // Find user by id and token
      const { data: user, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', payload.id)
        .eq('reset_token', token)
        .single();
  
      console.log('User from DB:', user, 'Error:', error);
  
      if (error || !user) return res.status(400).json({ error: 'Invalid or expired token' });
  
      // Update password in Supabase Auth
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
  
      // Clear token
      await supabaseAdmin
        .from('profiles')
        .update({ reset_token: null, reset_token_expiry: null })
        .eq('id', user.id);
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(400).json({ error: 'Invalid or expired token' });
    }
  };