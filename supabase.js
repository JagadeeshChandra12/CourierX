// Supabase configuration
const SUPABASE_URL = 'https://ednxepmtcaqksucceisb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbnhlcG10Y2Fxa3N1Y2NlaXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4ODAzMjYsImV4cCI6MjA2MDQ1NjMyNn0.uqFCgkgEyGtepD9iMwKJzqgCrvT8dVtT_wgRMTSifnc';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase available globally
window.supabase = supabase;

// Define all functions
window.supabaseFunctions = {
    // Auth functions
    async signUp(email, password, name) {
        try {
            console.log('Starting signup process...');
            
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });
            
            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }
            console.log('Auth user created:', authData);

            // 2. Create profile
            if (authData.user) {
                console.log('Attempting to create profile for user:', authData.user.id);
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .upsert([
                        {
                            id: authData.user.id,
                            full_name: name,
                            is_admin: false,
                            updated_at: new Date().toISOString()
                        }
                    ], {
                        onConflict: 'id'
                    })
                    .select();
                
                if (profileError) {
                    console.error('Profile error:', profileError);
                    console.error('Profile error details:', profileError.details);
                    console.error('Profile error hint:', profileError.hint);
                    throw profileError;
                }
                console.log('Profile created:', profileData);
            }

            return authData;
        } catch (error) {
            console.error('Error in signup process:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            throw error;
        }
    },

    async signIn(email, password) {
        try {
            console.log('Starting signin process...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            
            // Store the session
            if (data.session) {
                localStorage.setItem('supabase.auth.token', data.session.access_token);
            }
            
            // Get user profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            if (profileError) {
                console.error('Error fetching profile:', profileError);
            } else {
                console.log('Profile fetched:', profileData);
                localStorage.setItem('userProfile', JSON.stringify(profileData));
            }
            
            return {
                user: data.user,
                session: data.session,
                profile: profileData
            };
        } catch (error) {
            console.error('Error signing in:', error.message);
            throw error;
        }
    },

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear stored session
            localStorage.removeItem('user');
            localStorage.removeItem('supabase.auth.token');
        } catch (error) {
            console.error('Error signing out:', error.message);
            throw error;
        }
    },

    // Booking functions
    async createBooking(bookingData) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating booking:', error.message);
            throw error;
        }
    },

    // Tracking functions
    async getTrackingInfo(trackingId) {
        try {
            const { data, error } = await supabase
                .from('tracking')
                .select('*, bookings(*)')
                .eq('tracking_id', trackingId)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching tracking info:', error.message);
            throw error;
        }
    },

    async createTracking(trackingData) {
        try {
            const { data, error } = await supabase
                .from('tracking')
                .insert([trackingData])
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating tracking:', error.message);
            throw error;
        }
    },

    // Payment functions
    async createPayment(paymentData) {
        try {
            const { data, error } = await supabase
                .from('payments')
                .insert([paymentData])
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating payment:', error.message);
            throw error;
        }
    },

    // Admin functions
    async updateTrackingStatus(trackingId, status) {
        try {
            const { data, error } = await supabase
                .from('tracking')
                .update({ status, updated_at: new Date() })
                .eq('tracking_id', trackingId)
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating tracking status:', error.message);
            throw error;
        }
    },

    // Test function to check if data is being stored
    async testDataStorage() {
        try {
            // 1. Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            if (!user) {
                throw new Error('No user logged in');
            }

            console.log('Current user:', user);

            // 2. Create a test booking
            const bookingData = {
                user_id: user.id,
                sender_name: 'Test Sender',
                sender_phone: '1234567890',
                sender_address: '123 Test St',
                sender_city: 'Test City',
                sender_state: 'Test State',
                sender_pincode: '123456',
                receiver_name: 'Test Receiver',
                receiver_phone: '0987654321',
                receiver_address: '456 Test Ave',
                receiver_city: 'Test City 2',
                receiver_state: 'Test State 2',
                receiver_pincode: '654321',
                package_type: 'Documents',
                weight: 1.5,
                delivery_type: 'express',
                cost: 150.00,
                tracking_id: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
            };

            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select();

            if (bookingError) throw bookingError;
            console.log('Test booking created:', booking);

            // 3. Create tracking entry
            const trackingData = {
                tracking_id: bookingData.tracking_id,
                booking_id: booking[0].booking_id,
                status: 'Pending',
                location: 'Test Location',
                description: 'Package registered'
            };

            const { data: tracking, error: trackingError } = await supabase
                .from('tracking')
                .insert([trackingData])
                .select();

            if (trackingError) throw trackingError;
            console.log('Test tracking created:', tracking);

            // 4. Create payment entry
            const paymentData = {
                booking_id: booking[0].booking_id,
                amount: bookingData.cost,
                payment_status: 'Pending',
                method: 'Test Payment',
                transaction_id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            };

            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                .insert([paymentData])
                .select();

            if (paymentError) throw paymentError;
            console.log('Test payment created:', payment);

            return {
                success: true,
                booking,
                tracking,
                payment
            };
        } catch (error) {
            console.error('Error in test data storage:', error);
            throw error;
        }
    },

    // Google Sign In
    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }
}; 