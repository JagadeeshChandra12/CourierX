// Add debugging
console.log('Admin.js loaded');

// Check if Supabase is available
if (!window.supabase) {
    console.error('Supabase client not found!');
    document.getElementById('errorDisplay').style.display = 'block';
    document.getElementById('errorDisplay').textContent = 'Error: Supabase client not initialized properly';
}

// Check admin access and initialize page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');
    try {
        console.log('Checking Supabase session...');
        const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
        }

        console.log('Session:', session);

        if (!session) {
            console.log('No active session, redirecting to signin...');
            window.location.href = 'signin.html?redirect=admin.html';
            return;
        }

        // Get user's name
        console.log('Fetching user profile...');
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
        }

        console.log('Profile:', profile);
        document.getElementById('adminName').textContent = profile?.full_name || 'Admin';
        
        await loadDashboardStats();
        await initializeRealTimeUpdates();
        showTab('bookings');
    } catch (error) {
        console.error('Error initializing admin page:', error);
        document.getElementById('errorDisplay').style.display = 'block';
        document.getElementById('errorDisplay').innerHTML = `Error loading admin dashboard: ${error.message}<br>Please check the console for more details.`;
    }
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get bookings count
        const { data: bookings, error: bookingsError } = await window.supabase
            .from('bookings')
            .select('*');

        if (bookingsError) throw bookingsError;

        // Get completed payments with full details
        const { data: payments, error: paymentsError } = await window.supabase
            .from('payments')
            .select('amount, status')
            .or('status.eq.COMPLETED,status.eq.completed');  // Check for both cases

        if (paymentsError) throw paymentsError;

        console.log('Fetched payments:', payments); // Debug log

        // Calculate active deliveries
        const activeDeliveries = bookings.filter(b => 
            ['pending', 'in_transit', 'out_for_delivery'].includes(b.status)).length;

        // Calculate total revenue from actual payments
        const totalRevenue = payments ? payments.reduce((sum, payment) => {
            // Convert string amount to number and handle any potential invalid values
            const amount = parseFloat(payment.amount) || 0;
            return sum + amount;
        }, 0) : 0;

        console.log('Calculated total revenue:', totalRevenue); // Debug log

        // Update dashboard with formatted revenue
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('activeDeliveries').textContent = activeDeliveries;
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

        // Refresh current tab if it's bookings or payments
        const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
        if (activeTab === 'bookings' || activeTab === 'payments') {
            showTab(activeTab);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        document.getElementById('errorDisplay').style.display = 'block';
        document.getElementById('errorDisplay').textContent = `Error loading dashboard stats: ${error.message}`;
    }
}

// Handle tab switching and data loading
async function showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '<div class="loading">Loading data...</div>';

    try {
        let data;
        if (tabName === 'bookings') {
            const { data: bookings } = await window.supabase.from('bookings').select('*').order('created_at', { ascending: false });
            data = generateBookingsTable(bookings);
        } else if (tabName === 'users') {
            const { data: users } = await window.supabase.from('profiles').select('*').order('created_at', { ascending: false });
            data = generateUsersTable(users);
        } else if (tabName === 'tracking') {
            const { data: tracking, error } = await window.supabase
                .from('tracking')
                .select(`
                    *,
                    bookings (
                        tracking_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            data = generateTrackingTable(tracking);
        } else if (tabName === 'payments') {
            const { data: payments, error } = await window.supabase
                .from('payments')
                .select(`
                    *,
                    bookings (
                        tracking_id,
                        sender_name,
                        receiver_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            data = generatePaymentsTable(payments);
        }
        tableContainer.innerHTML = data;
    } catch (error) {
        console.error('Error loading tab data:', error);
        tableContainer.innerHTML = '<div class="error">Error loading data: ' + error.message + '</div>';
    }
}

// Status options
const STATUS_OPTIONS = [
    'pending',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'cancelled'
];

function generateBookingsTable(bookings) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Tracking ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(b => `
                    <tr>
                        <td>${b.tracking_id || 'N/A'}</td>
                        <td>${b.sender_name || 'N/A'}<br><small>${b.sender_phone || 'N/A'}</small></td>
                        <td>${b.receiver_name || 'N/A'}<br><small>${b.receiver_phone || 'N/A'}</small></td>
                        <td>
                            <select class="status-select" onchange="updateBookingStatus('${b.id}', this.value)">
                                ${STATUS_OPTIONS.map(status => `
                                    <option value="${status}" ${b.status === status ? 'selected' : ''}>
                                        ${status.replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                        <td>
                            <button class="btn-action" onclick="viewBookingDetails('${b.id}')">View Details</button>
                            <button class="btn-action btn-warning" onclick="deleteBooking('${b.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateUsersTable(users) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr>
                        <td>${u.full_name || 'N/A'}</td>
                        <td>${u.email || 'N/A'}</td>
                        <td>${u.phone || 'N/A'}</td>
                        <td>
                            <span class="status-badge ${u.is_blocked ? 'cancelled' : 'delivered'}">
                                ${u.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-action" onclick="viewUserDetails('${u.id}')">View Details</button>
                            <button class="btn-action" onclick="viewUserBookings('${u.id}')">View Bookings</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateTrackingTable(tracking) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Tracking ID</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tracking.map(t => `
                    <tr>
                        <td>${t.bookings?.tracking_id || 'N/A'}</td>
                        <td>
                            <select class="status-select" onchange="updateStatus('${t.id}', this.value)">
                                ${STATUS_OPTIONS.map(status => `
                                    <option value="${status}" ${t.status === status ? 'selected' : ''}>
                                        ${status.replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                        <td>${t.location || 'N/A'}</td>
                        <td>${new Date(t.created_at).toLocaleString('en-IN')}</td>
                        <td>
                            <button class="btn-action" onclick="updateLocation('${t.id}')">Update Location</button>
                            <button class="btn-action" onclick="viewTrackingHistory('${t.id}')">View History</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generatePaymentsTable(payments) {
    return `
        <div class="table-container">
            <h2>Payments Management</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tracking ID</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(p => `
                        <tr>
                            <td>${p.bookings?.tracking_id || 'N/A'}</td>
                            <td>₹${p.amount?.toFixed(2) || '0.00'}</td>
                            <td>
                                <span class="status-badge ${p.status?.toLowerCase()}">${p.status || 'N/A'}</span>
                            </td>
                            <td>${p.payment_method || 'N/A'}</td>
                            <td>${new Date(p.created_at).toLocaleString('en-IN')}</td>
                            <td>
                                <button class="btn-action" onclick="viewPaymentDetails('${p.id}')">View Details</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Initialize search functionality
function initializeSearchFunctionality(tabName) {
    const searchInput = document.querySelector('.search-input');
    const rows = document.querySelectorAll('.data-table tbody tr');

    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });
    });
}

// View booking details
async function viewBookingDetails(id) {
    try {
        console.log('Fetching booking details for ID:', id);
        
        // First, get the booking details
        const { data: booking, error: bookingError } = await window.supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();
            
        if (bookingError) {
            console.error('Booking fetch error:', bookingError);
            throw bookingError;
        }

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Get tracking history
        const { data: tracking, error: trackingError } = await window.supabase
            .from('tracking')
            .select('*')
            .eq('booking_id', id)
            .order('created_at', { ascending: false });

        if (trackingError) {
            console.error('Tracking fetch error:', trackingError);
            throw trackingError;
        }

        console.log('Fetched booking:', booking);
        console.log('Fetched tracking:', tracking);

        // Format the details
        const detailsHTML = `
            <div class="details-grid">
                <div class="details-item">
                    <label>Tracking ID</label>
                    <span>${booking.tracking_id || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Created Date</label>
                    <span>${new Date(booking.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div class="details-item">
                    <label>Sender Details</label>
                    <span>
                        ${booking.sender_name || 'N/A'}<br>
                        Phone: ${booking.sender_phone || 'N/A'}<br>
                        Address: ${booking.sender_address || 'N/A'}<br>
                        ${booking.sender_city || 'N/A'}, ${booking.sender_state || 'N/A'} - ${booking.sender_pincode || 'N/A'}
                    </span>
                </div>
                <div class="details-item">
                    <label>Receiver Details</label>
                    <span>
                        ${booking.receiver_name || 'N/A'}<br>
                        Phone: ${booking.receiver_phone || 'N/A'}<br>
                        Address: ${booking.receiver_address || 'N/A'}<br>
                        ${booking.receiver_city || 'N/A'}, ${booking.receiver_state || 'N/A'} - ${booking.receiver_pincode || 'N/A'}
                    </span>
                </div>
                <div class="details-item">
                    <label>Package Details</label>
                    <span>
                        Type: ${booking.package_type || 'N/A'}<br>
                        Weight: ${booking.weight ? booking.weight + ' kg' : 'N/A'}<br>
                        Cost: ₹${booking.cost ? booking.cost.toFixed(2) : '0.00'}
                    </span>
                </div>
                <div class="details-item">
                    <label>Current Status</label>
                    <span>
                        <select class="status-select" onchange="updateBookingStatus('${booking.id}', this.value)">
                            ${STATUS_OPTIONS.map(status => `
                                <option value="${status}" ${booking.status === status ? 'selected' : ''}>
                                    ${status.replace(/_/g, ' ').toUpperCase()}
                                </option>
                            `).join('')}
                        </select>
                    </span>
                </div>
            </div>
            ${tracking && tracking.length > 0 ? `
                <div class="tracking-history">
                    <h3>Tracking History</h3>
                    ${tracking.map(t => `
                        <div class="history-item">
                            <div>
                                <strong>${t.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</strong><br>
                                <small>${t.location || 'N/A'}</small>
                            </div>
                            <div>
                                <small>${new Date(t.created_at).toLocaleString('en-IN')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-history">No tracking history available</p>'}
        `;

        // Show details section
        document.getElementById('detailsTitle').textContent = `Booking Details - ${booking.tracking_id || id}`;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsSection').classList.add('active');

    } catch (error) {
        console.error('Error viewing booking:', error);
        const errorMessage = `
            <div class="error-message">
                <h3>Error Loading Booking Details</h3>
                <p>${error.message}</p>
                <div class="action-buttons">
                    <button class="btn-action" onclick="closeDetails()">Close</button>
                    <button class="btn-action" onclick="viewBookingDetails('${id}')">Retry</button>
                </div>
            </div>
        `;
        document.getElementById('detailsContent').innerHTML = errorMessage;
        document.getElementById('detailsSection').classList.add('active');
    }
}

// Close details section
function closeDetails() {
    document.getElementById('detailsSection').classList.remove('active');
}

// Update booking status
async function updateBookingStatus(id, newStatus) {
    try {
        console.log('Updating booking status:', id, newStatus);
        
        // Update the booking status
        const { error: bookingError } = await window.supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);
            
        if (bookingError) throw bookingError;

        // Add tracking entry
        const { error: trackingError } = await window.supabase
            .from('tracking')
            .insert([{
                booking_id: id,
                status: newStatus,
                location: 'Status updated'
            }]);

        if (trackingError) throw trackingError;

        // Refresh the current tab
        showTab('bookings');
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status: ' + error.message);
    }
}

// Update location
async function updateLocation(id) {
    const newLocation = prompt('Enter new location:');
    if (!newLocation) return;
    
    try {
        // First get the current tracking record
        const { data: tracking, error: fetchError } = await window.supabase
            .from('tracking')
            .select('booking_id, status')
            .eq('id', id)
            .single();
            
        if (fetchError) throw fetchError;

        // Insert new tracking entry
        const { error: insertError } = await window.supabase
            .from('tracking')
            .insert([{
                booking_id: tracking.booking_id,
                status: tracking.status,
                location: newLocation
            }]);
            
        if (insertError) throw insertError;
        
        showTab('tracking');
    } catch (error) {
        console.error('Error updating location:', error);
        alert('Error updating location: ' + error.message);
    }
}

// Toggle admin status
async function toggleAdminStatus(id, isAdmin) {
    await window.supabase.from('profiles').update({ is_admin: !isAdmin }).eq('id', id);
    showTab('users');
}

// Sign out function
async function signOut() {
    await window.supabase.auth.signOut();
    window.location.href = 'signin.html';
}

// New action functions
async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        console.log('Deleting booking:', id);

        // First delete related tracking records
        const { error: trackingError } = await window.supabase
            .from('tracking')
            .delete()
            .eq('booking_id', id);

        if (trackingError) {
            console.error('Error deleting tracking:', trackingError);
            throw trackingError;
        }

        // Then delete the booking
        const { error: bookingError } = await window.supabase
            .from('bookings')
            .delete()
            .eq('id', id);
            
        if (bookingError) {
            console.error('Error deleting booking:', bookingError);
            throw bookingError;
        }
        
        // Refresh the bookings table
        showTab('bookings');
        alert('Booking deleted successfully');
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking: ' + error.message);
    }
}

async function viewUserDetails(id) {
    try {
        console.log('Fetching user details for ID:', id);
        
        // Get user profile
        const { data: user, error: userError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
            
        if (userError) {
            console.error('User fetch error:', userError);
            throw userError;
        }

        if (!user) {
            throw new Error('User not found');
        }

        // Get user's bookings count
        const { count: bookingsCount, error: countError } = await window.supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('user_id', id);

        if (countError) {
            console.error('Bookings count error:', countError);
            throw countError;
        }

        console.log('Fetched user:', user);

        // Format the details
        const detailsHTML = `
            <div class="details-grid">
                <div class="details-item">
                    <label>Full Name</label>
                    <span>${user.full_name || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Email</label>
                    <span>${user.email || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Phone</label>
                    <span>${user.phone || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Total Bookings</label>
                    <span>${bookingsCount || 0}</span>
                </div>
                <div class="details-item">
                    <label>Account Status</label>
                    <span>
                        <select class="status-select" onchange="updateUserStatus('${user.id}', this.value)">
                            <option value="active" ${!user.is_blocked ? 'selected' : ''}>Active</option>
                            <option value="blocked" ${user.is_blocked ? 'selected' : ''}>Blocked</option>
                        </select>
                    </span>
                </div>
                <div class="details-item">
                    <label>Member Since</label>
                    <span>${new Date(user.created_at).toLocaleString('en-IN')}</span>
                </div>
            </div>
            <div class="action-buttons" style="margin-top: 1rem;">
                <button class="btn-action" onclick="viewUserBookings('${user.id}')">View Bookings</button>
            </div>
        `;

        // Show details section
        document.getElementById('detailsTitle').textContent = `User Details - ${user.full_name || user.email}`;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsSection').classList.add('active');

    } catch (error) {
        console.error('Error viewing user:', error);
        const errorMessage = `
            <div class="error-message">
                <h3>Error Loading User Details</h3>
                <p>${error.message}</p>
                <div class="action-buttons">
                    <button class="btn-action" onclick="closeDetails()">Close</button>
                    <button class="btn-action" onclick="viewUserDetails('${id}')">Retry</button>
                </div>
            </div>
        `;
        document.getElementById('detailsContent').innerHTML = errorMessage;
        document.getElementById('detailsSection').classList.add('active');
    }
}

async function viewUserBookings(id) {
    try {
        console.log('Fetching bookings for user ID:', id);
        
        // Get user's bookings
        const { data: bookings, error: bookingsError } = await window.supabase
            .from('bookings')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        if (bookingsError) {
            console.error('Bookings fetch error:', bookingsError);
            throw bookingsError;
        }

        // Get user name
        const { data: user, error: userError } = await window.supabase
            .from('profiles')
            .select('full_name')
            .eq('id', id)
            .single();

        if (userError) {
            console.error('User fetch error:', userError);
            throw userError;
        }

        console.log('Fetched bookings:', bookings);

        // Format the details
        const detailsHTML = `
            <div class="details-header" style="margin-bottom: 1.5rem;">
                <h3>Bookings for ${user?.full_name || 'User'}</h3>
                <p>Total Bookings: ${bookings?.length || 0}</p>
            </div>
            ${bookings && bookings.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tracking ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(b => `
                            <tr>
                                <td>${b.tracking_id || 'N/A'}</td>
                                <td>${new Date(b.created_at).toLocaleString('en-IN')}</td>
                                <td>
                                    <span class="status-badge ${b.status?.toLowerCase()}">${b.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</span>
                                </td>
                                <td>₹${b.cost?.toFixed(2) || '0.00'}</td>
                                <td>
                                    <button class="btn-action" onclick="viewBookingDetails('${b.id}')">View Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-bookings">No bookings found for this user</p>'}
            <div class="action-buttons" style="margin-top: 1rem;">
                <button class="btn-action" onclick="viewUserDetails('${id}')">Back to User Details</button>
            </div>
        `;

        // Show details section
        document.getElementById('detailsTitle').textContent = `User Bookings - ${user?.full_name || 'User'}`;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsSection').classList.add('active');

    } catch (error) {
        console.error('Error viewing user bookings:', error);
        const errorMessage = `
            <div class="error-message">
                <h3>Error Loading User Bookings</h3>
                <p>${error.message}</p>
                <div class="action-buttons">
                    <button class="btn-action" onclick="closeDetails()">Close</button>
                    <button class="btn-action" onclick="viewUserBookings('${id}')">Retry</button>
                </div>
            </div>
        `;
        document.getElementById('detailsContent').innerHTML = errorMessage;
        document.getElementById('detailsSection').classList.add('active');
    }
}

async function updateUserStatus(userId, status) {
    try {
        const isBlocked = status === 'blocked';
        const { error } = await window.supabase
            .from('profiles')
            .update({ is_blocked: isBlocked })
            .eq('id', userId);

        if (error) throw error;
        
        viewUserDetails(userId); // Refresh user details
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('Error updating user status: ' + error.message);
    }
}

// Update tracking status
async function updateStatus(id, newStatus) {
    try {
        // First get the current tracking record
        const { data: tracking, error: fetchError } = await window.supabase
            .from('tracking')
            .select('booking_id, location')
            .eq('id', id)
            .single();
            
        if (fetchError) throw fetchError;

        // Insert new tracking entry
        const { error: insertError } = await window.supabase
            .from('tracking')
            .insert([{
                booking_id: tracking.booking_id,
                status: newStatus,
                location: tracking.location
            }]);
            
        if (insertError) throw insertError;
        
        showTab('tracking');
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status: ' + error.message);
    }
}

// View tracking history
async function viewTrackingHistory(id) {
    try {
        console.log('Fetching tracking history for ID:', id);
        
        // Get the current tracking record to get booking_id
        const { data: currentTracking, error: currentError } = await window.supabase
            .from('tracking')
            .select('*, bookings(tracking_id)')
            .eq('id', id)
            .single();

        if (currentError) throw currentError;

        if (!currentTracking) {
            throw new Error('Tracking record not found');
        }

        // Get all tracking history for this booking
        const { data: history, error: historyError } = await window.supabase
            .from('tracking')
            .select('*')
            .eq('booking_id', currentTracking.booking_id)
            .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        console.log('Fetched tracking history:', history);

        // Format the details
        const detailsHTML = `
            <div class="details-header">
                <h3>Tracking History for ${currentTracking.bookings?.tracking_id || 'N/A'}</h3>
            </div>
            ${history && history.length > 0 ? `
                <div class="tracking-history">
                    ${history.map(t => `
                        <div class="history-item">
                            <div>
                                <strong>${t.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</strong><br>
                                <small>${t.location || 'N/A'}</small>
                            </div>
                            <div>
                                <small>${new Date(t.created_at).toLocaleString('en-IN')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-history">No tracking history available</p>'}
        `;

        // Show details section
        document.getElementById('detailsTitle').textContent = `Tracking History - ${currentTracking.bookings?.tracking_id || 'N/A'}`;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsSection').classList.add('active');

    } catch (error) {
        console.error('Error viewing tracking history:', error);
        const errorMessage = `
            <div class="error-message">
                <h3>Error Loading Tracking History</h3>
                <p>${error.message}</p>
                <div class="action-buttons">
                    <button class="btn-action" onclick="closeDetails()">Close</button>
                    <button class="btn-action" onclick="viewTrackingHistory('${id}')">Retry</button>
                </div>
            </div>
        `;
        document.getElementById('detailsContent').innerHTML = errorMessage;
        document.getElementById('detailsSection').classList.add('active');
    }
}

async function viewPaymentDetails(id) {
    try {
        const { data: payment, error } = await window.supabase
            .from('payments')
            .select(`
                *,
                bookings (
                    tracking_id,
                    sender_name,
                    receiver_name,
                    sender_address,
                    receiver_address
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const detailsHTML = `
            <div class="details-grid">
                <div class="details-item">
                    <label>Tracking ID</label>
                    <span>${payment.bookings?.tracking_id || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Amount</label>
                    <span>₹${payment.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="details-item">
                    <label>Status</label>
                    <span>
                        <select class="status-select" onchange="updatePaymentStatus('${payment.id}', this.value)">
                            ${['Pending', 'Completed', 'Failed', 'Refunded'].map(status => 
                                `<option value="${status}" ${payment.status === status ? 'selected' : ''}>
                                    ${status}
                                </option>`
                            ).join('')}
                        </select>
                    </span>
                </div>
                <div class="details-item">
                    <label>Payment Method</label>
                    <span>${payment.payment_method || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Transaction ID</label>
                    <span>${payment.transaction_id || 'N/A'}</span>
                </div>
                <div class="details-item">
                    <label>Date</label>
                    <span>${new Date(payment.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div class="details-item">
                    <label>Sender Details</label>
                    <span>
                        ${payment.bookings?.sender_name || 'N/A'}<br>
                        ${payment.bookings?.sender_address || 'N/A'}
                    </span>
                </div>
                <div class="details-item">
                    <label>Receiver Details</label>
                    <span>
                        ${payment.bookings?.receiver_name || 'N/A'}<br>
                        ${payment.bookings?.receiver_address || 'N/A'}
                    </span>
                </div>
            </div>
        `;

        document.getElementById('detailsTitle').textContent = `Payment Details - ${payment.bookings?.tracking_id || payment.id}`;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsSection').classList.add('active');
    } catch (error) {
        console.error('Error loading payment details:', error);
        const errorMessage = `
            <div class="error-message">
                <h3>Error Loading Payment Details</h3>
                <p>${error.message}</p>
                <div class="action-buttons">
                    <button class="btn-action" onclick="closeDetails()">Close</button>
                    <button class="btn-action" onclick="viewPaymentDetails('${id}')">Retry</button>
                </div>
            </div>
        `;
        document.getElementById('detailsContent').innerHTML = errorMessage;
        document.getElementById('detailsSection').classList.add('active');
    }
}

async function updatePaymentStatus(id, newStatus) {
    try {
        const { error } = await window.supabase
            .from('payments')
            .update({ status: newStatus.toUpperCase() })
            .eq('id', id);

        if (error) throw error;

        // Refresh the payment details and dashboard stats
        await Promise.all([
            viewPaymentDetails(id),
            loadDashboardStats()
        ]);

        // Refresh the payments table if it's visible
        if (document.querySelector('.tab-button[data-tab="payments"]').classList.contains('active')) {
            showTab('payments');
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
        alert('Error updating payment status: ' + error.message);
    }
}

// Add this function to simulate payment processing
async function simulatePayment(bookingId, amount) {
    try {
        // Generate a random transaction ID
        const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create payment record
        const { data: payment, error } = await window.supabase
            .from('payments')
            .insert([{
                booking_id: bookingId,
                amount: amount,
                status: 'Completed',
                payment_method: 'Online Payment',
                transaction_id: transactionId
            }])
            .select()
            .single();

        if (error) throw error;

        // Update booking status
        await window.supabase
            .from('bookings')
            .update({ status: 'pending' })
            .eq('id', bookingId);

        // Refresh dashboard stats
        await loadDashboardStats();

        return {
            success: true,
            transactionId: transactionId,
            payment: payment
        };
    } catch (error) {
        console.error('Payment simulation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Add this function to generate tracking ID
function generateTrackingId() {
    const prefix = 'CX';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Simplified payment handling
async function handleNewBooking(bookingData) {
    try {
        // Generate tracking ID
        const trackingId = generateTrackingId();
        
        // Create booking record
        const { data: booking, error: bookingError } = await window.supabase
            .from('bookings')
            .insert([{
                ...bookingData,
                tracking_id: trackingId,
                status: 'pending'
            }])
            .select()
            .single();

        if (bookingError) throw bookingError;

        // Add initial tracking entry
        await window.supabase
            .from('tracking')
            .insert([{
                booking_id: booking.id,
                status: 'pending',
                location: 'Booking confirmed, awaiting pickup'
            }]);

        return {
            success: true,
            trackingId: trackingId,
            booking: booking
        };
    } catch (error) {
        console.error('Booking error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Add event listener for payment changes
async function initializeRealTimeUpdates() {
    // Subscribe to bookings changes
    window.supabase
        .channel('bookings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
            () => loadDashboardStats()
        )
        .subscribe();

    // Subscribe to payments changes
    window.supabase
        .channel('payments_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, 
            () => loadDashboardStats()
        )
        .subscribe();
}