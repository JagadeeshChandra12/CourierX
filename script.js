// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking
            navLinks.classList.remove('active');
        }
    });
});

// Testimonials data
const testimonials = [
    {
        name: "Thapan",
        location: "Vijayawada, AP",
        text: "CourierX delivered my package ahead of schedule. Their tracking system kept me informed every step of the way!",
        rating: 5,
        image: "images/thapan.jpg"
    },
    {
        name: "Madhav",
        location: "Hyderabad, TS",
        text: "Excellent service! The customer support team was very helpful and my package arrived in perfect condition.",
        rating: 5,
        image: "images/madhav.jpg"
    },
    {
        name: "Koushik",
        location: "Tenali, AP",
        text: "I've been using CourierX from many days. They're reliable and professional.",
        rating: 4,
        image: "images/koushik.jpg"
    }
];

// Render testimonials
const testimonialsGrid = document.querySelector('.testimonials-grid');
testimonials.forEach(testimonial => {
    const testimonialCard = document.createElement('div');
    testimonialCard.className = 'testimonial-card animate-fade-in-up';
    
    const ratingStars = Array(5).fill().map((_, i) => `
        <i class="fas fa-star ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
    `).join('');

    testimonialCard.innerHTML = `
        <div class="testimonial-card-inner">
            <div class="testimonial-rating mb-3">
                ${ratingStars}
            </div>
            <p class="testimonial-text mb-4">${testimonial.text}</p>
            <div class="testimonial-author">
                <div class="author-avatar">
                    <img src="${testimonial.image}" alt="${testimonial.name}" 
                        style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; 
                        border: 2px solid #4070f4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                </div>
                <div class="author-info ml-3">
                    <h4 class="font-semibold text-lg">${testimonial.name}</h4>
                    <p class="text-gray-600"><i class="fas fa-map-marker-alt mr-1"></i>${testimonial.location}</p>
                </div>
            </div>
        </div>
    `;

    // Add CSS to the testimonial card
    testimonialCard.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        margin: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    `;

    // Add hover effect
    testimonialCard.addEventListener('mouseenter', () => {
        testimonialCard.style.transform = 'translateY(-5px)';
    });
    testimonialCard.addEventListener('mouseleave', () => {
        testimonialCard.style.transform = 'translateY(0)';
    });

    testimonialsGrid.appendChild(testimonialCard);
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for fade-in animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
searchBtn.addEventListener('click', () => {
    // Implement search functionality here
    alert('Search functionality coming soon!');
});

// Form validation for contact form (if added later)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Contact form submission
function handleContactSubmit(event) {
    event.preventDefault();
    
    if (!validateForm(event.target)) {
        return false;
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Here you would typically make an API call to your backend
    console.log('Contact form submission:', { name, email, subject, message });
    
    // Show success message
    const successMessage = document.getElementById('contactSuccess');
    successMessage.style.display = 'block';
    
    // Clear form
    event.target.reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
    
    return false;
}

// Add loading state to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.type === 'submit') {
            this.classList.add('loading');
            this.disabled = true;
            setTimeout(() => {
                this.classList.remove('loading');
                this.disabled = false;
            }, 2000);
        }
    });
});

// Authentication Functions
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;

    try {
        const { data, error } = await window.supabaseFunctions.signIn(email, password);
        if (error) throw error;
        
        // Store user session
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard or home page
        window.location.href = 'index.html';
    } catch (error) {
        alert('Sign in failed: ' + error.message);
    }
}

async function handleSignUp(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const { data, error } = await window.supabaseFunctions.signUp(email, password, fullName);
        if (error) throw error;
        
        alert('Sign up successful! Please check your email for verification.');
        window.location.href = 'signin.html';
    } catch (error) {
        alert('Sign up failed: ' + error.message);
    }
}

// Payment Page Functions
function populateOrderSummary() {
    // Get form data from localStorage
    const bookingFormData = JSON.parse(localStorage.getItem('bookingFormData')) || {};

    // Ensure all fields are updated only if the elements exist
    const basePriceElement = document.getElementById('basePriceSummary');
    const weightChargeElement = document.getElementById('weightChargeSummary');
    const insuranceElement = document.getElementById('insuranceSummary');
    const totalAmountElement = document.getElementById('totalAmountSummary');

    if (basePriceElement) {
        basePriceElement.textContent = bookingFormData.delivery?.baseCharge || '₹0';
    }
    if (weightChargeElement) {
        weightChargeElement.textContent = bookingFormData.delivery?.weightCharge || '₹0';
    }
    if (insuranceElement) {
        insuranceElement.textContent = bookingFormData.delivery?.insuranceCharge || '₹0';
    }
    if (totalAmountElement) {
        totalAmountElement.textContent = `₹${localStorage.getItem('bookingAmount') || '0'}`;
    }
}

// Ensure the function is called on the payment page
if (window.location.pathname.includes('payment.html')) {
    document.addEventListener('DOMContentLoaded', populateOrderSummary);
}

const pricing = {
    standard: {
        base: 0,      // Free base price
        perKm: 2,     // ₹2 per km
        perKg: 15     // ₹15 per kg
    },
    express: {
        base: 99,     // ₹99 base price
        perKm: 3,     // ₹3 per km
        perKg: 20     // ₹20 per kg
    },
    sameDay: {
        base: 299,    // ₹299 base price
        perKm: 4,     // ₹4 per km
        perKg: 25     // ₹25 per kg
    }
};

function calculatePrice(weight) {
    const deliveryType = document.getElementById('deliveryType') ? document.getElementById('deliveryType').value : 'standard';
    const distance = 100; // Example distance in km
    const insurance = document.getElementById('insurance') && document.getElementById('insurance').checked ? 49 : 0; // ₹49 for insurance

    const price = pricing[deliveryType];
    const basePrice = price.base;
    const distanceCharge = distance * price.perKm;
    const weightCharge = weight * price.perKg;
    const total = basePrice + distanceCharge + weightCharge + insurance;

    if(document.getElementById('basePrice')) {
        document.getElementById('basePrice').textContent = `₹${basePrice}`;
        document.getElementById('distanceCharge').textContent = `₹${distanceCharge}`;
        document.getElementById('weightCharge').textContent = `₹${weightCharge}`;
        document.getElementById('insuranceCharge').textContent = `₹${insurance}`;
        document.getElementById('totalAmount').textContent = `₹${total}`;
    }
}

// Initialize payment page if we're on the payment page
if (window.location.pathname.includes('payment.html')) {
    // Populate order summary
    populateOrderSummary();

    // Add event listeners for payment method changes
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            switchPaymentMethod(e.target.value);
        });
    });

    // Initialize payment forms
    const defaultMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    switchPaymentMethod(defaultMethod);

    // Add form submit handler
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
}

// Payment Method Functions
function switchPaymentMethod(method) {
    // Hide all payment forms
    document.querySelectorAll('#paymentDetailsForms > div').forEach(form => {
        form.style.display = 'none';
    });

    // Show selected payment form
    switch(method) {
        case 'upi':
            document.getElementById('upiPaymentForm').style.display = 'block';
            break;
        case 'card':
            document.getElementById('cardPaymentForm').style.display = 'block';
            break;
        case 'netbanking':
            document.getElementById('netbankingForm').style.display = 'block';
            break;
        case 'wallet':
            document.getElementById('walletForm').style.display = 'block';
            break;
        default:
            // For COD, no form needed
            break;
    }

    // Update payment button text
    const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
    if (submitBtn) {
        switch(method) {
            case 'cod':
                submitBtn.innerHTML = 'Confirm Cash on Delivery <i class="fas fa-money-bill-wave"></i>';
                break;
            case 'upi':
                submitBtn.innerHTML = 'Pay with UPI <i class="fas fa-mobile-alt"></i>';
                break;
            case 'card':
                submitBtn.innerHTML = 'Pay with Card <i class="fas fa-credit-card"></i>';
                break;
            case 'netbanking':
                submitBtn.innerHTML = 'Pay with Net Banking <i class="fas fa-university"></i>';
                break;
            case 'wallet':
                submitBtn.innerHTML = 'Pay with Wallet <i class="fas fa-wallet"></i>';
                break;
        }
    }
}

async function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!validateForm(form)) return;

    const bookingId = new URLSearchParams(window.location.search).get('booking_id');
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    const paymentData = {
        booking_id: bookingId,
        amount: parseFloat(document.getElementById('amount').value),
        payment_status: 'Completed',
        method: paymentMethod,
        transaction_id: generateTransactionId()
    };

    try {
        const payment = await window.supabaseFunctions.createPayment(paymentData);
        
        // Update booking status
        await window.supabaseFunctions.updateBookingStatus(bookingId, 'Paid');
        
        // Show success message
        handlePaymentSuccess(payment);
    } catch (error) {
        alert('Payment failed: ' + error.message);
    }
}

function handlePaymentSuccess(paymentDetails) {
    // Store payment details in sessionStorage
    const lastBooking = JSON.parse(sessionStorage.getItem('lastBooking')) || {};
    lastBooking.payment = paymentDetails;
    sessionStorage.setItem('lastBooking', JSON.stringify(lastBooking));

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Payment successful! Your order has been confirmed.
    `;

    // Insert success message before the form
    const form = document.querySelector('.payment-form');
    form.insertBefore(successMessage, form.firstChild);

    // Clear the booking form data
    localStorage.removeItem('bookingFormData');
    
    // Redirect to confirmation page after 3 seconds
    setTimeout(() => {
        window.location.href = 'confirmation.html'; // Update the URL if necessary
    }, 3000);
}

function validateCardNumber(number) {
    // Remove spaces and validate 16 digits
    return /^\d{16}$/.test(number.replace(/\s/g, ''));
}

function validateExpiryDate(date) {
    // Validate MM/YY format
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(date)) {
        return false;
    }

    // Check if date is in the future
    const [month, year] = date.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();

    return expiryDate > today;
}

function validateCVV(cvv) {
    // Validate 3 or 4 digits
    return /^\d{3,4}$/.test(cvv);
}

function validateUPIId(upiId) {
    // Basic UPI ID validation (username@bank)
    return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z._]{2,49}$/.test(upiId);
}

// Booking Form Functions
let currentStep = 1;
const totalSteps = 4;

function nextStep(step) {
    // Validate current step
    if (!validateStep(step)) return;

    // Hide current step
    document.getElementById(`step${step}`).style.display = 'none';
    // Show next step
    document.getElementById(`step${step + 1}`).style.display = 'block';
    // Update progress indicator
    document.getElementById(`step${step}-indicator`).classList.remove('active');
    document.getElementById(`step${step}-indicator`).classList.add('completed');
    document.getElementById(`step${step + 1}-indicator`).classList.add('active');

    // Scroll to the top of the form
    document.querySelector('.booking-form').scrollIntoView({ behavior: 'smooth' });

    currentStep = step + 1;

    // If moving to step 3, calculate costs
    if (currentStep === 3) calculateCosts();
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${step}`).style.display = 'none';
    // Show previous step
    document.getElementById(`step${step - 1}`).style.display = 'block';
    // Update progress indicator
    document.getElementById(`step${step}-indicator`).classList.remove('active');
    document.getElementById(`step${step - 1}-indicator`).classList.remove('completed');
    document.getElementById(`step${step - 1}-indicator`).classList.add('active');
    
    currentStep = step - 1;
}

function validateStep(step) {
    const currentStepElement = document.getElementById(`step${step}`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields.');
        return false;
    }

    return true;
}

async function fetchLocationDetails(type) {
    const pincode = document.getElementById(`${type}Pincode`).value;
    if (pincode.length === 6) {
        try {
            // Just validate that it's a 6-digit number
            if (!/^\d{6}$/.test(pincode)) {
                throw new Error('Invalid pincode format');
            }
            // Clear any previous values
            document.getElementById(`${type}City`).value = '';
            document.getElementById(`${type}State`).value = '';
        } catch (error) {
            console.error('Error:', error);
            alert('Please enter a valid 6-digit pincode');
            document.getElementById(`${type}Pincode`).value = '';
        }
    }
}

// Update calculateCosts to store the total amount in localStorage
function calculateCosts() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;

    const selectedOption = document.querySelector('input[name="deliveryType"]:checked');
    const priceElement = selectedOption.closest('.delivery-option').querySelector('.delivery-price');
    const baseCharge = parseInt(priceElement.textContent.replace('₹', '')) || 0;

    const weightCharge = weight * 50;
    const insuranceCharge = document.getElementById('insurance')?.checked ? 199 : 0; // Default to 0 if not selected

    const total = baseCharge + weightCharge + insuranceCharge;

    document.getElementById('baseCharge').textContent = `₹${baseCharge}`;
    document.getElementById('weightCharge').textContent = `₹${weightCharge}`;
    document.getElementById('insuranceCharge').textContent = `₹${insuranceCharge}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;

    // Store the total amount in localStorage
    localStorage.setItem('bookingAmount', total);
    return total;
}

// Update handleBookingSubmit to ensure redirection to the payment page
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!validateForm(form)) return;

    const bookingData = {
        pickup_address: document.getElementById('pickupAddress').value,
        delivery_address: document.getElementById('deliveryAddress').value,
        pickup_date: document.getElementById('pickupDate').value,
        pickup_time: document.getElementById('pickupTime').value,
        weight: parseFloat(document.getElementById('weight').value),
        delivery_type: document.getElementById('deliveryType').value,
        cost: calculatePrice(parseFloat(document.getElementById('weight').value)),
        tracking_id: generateTrackingId(),
        user_id: JSON.parse(localStorage.getItem('user'))?.id
    };

    try {
        const booking = await window.supabaseFunctions.createBooking(bookingData);
        
        // Create tracking record
        await window.supabaseFunctions.createTracking({
            tracking_id: booking.tracking_id,
            booking_id: booking.booking_id,
            status: 'Pending',
            updated_at: new Date()
        });

        // Redirect to payment page with booking details
        window.location.href = `payment.html?booking_id=${booking.booking_id}`;
    } catch (error) {
        alert('Booking failed: ' + error.message);
    }
}

function displayPaymentDetails(bookingDetails) {
    const paymentDetails = document.getElementById('paymentDetails');
    const deliveryType = bookingDetails.delivery.type.charAt(0).toUpperCase() + bookingDetails.delivery.type.slice(1);
    const paymentMethod = bookingDetails.delivery.paymentMethod ? bookingDetails.delivery.paymentMethod.toUpperCase() : 'N/A';

    paymentDetails.innerHTML = `
        <div class="payment-details">
            <h4>Payment Details</h4>
            <div class="detail-item">
                <span>Delivery Type:</span>
                <span>${deliveryType}</span>
            </div>
            <div class="detail-item">
                <span>Payment Method:</span>
                <span>${paymentMethod}</span>
            </div>
            <div class="detail-item">
                <span>Base Charge:</span>
                <span>${bookingDetails.delivery.baseCharge}</span>
            </div>
            <div class="detail-item">
                <span>Weight Charge:</span>
                <span>${bookingDetails.delivery.weightCharge}</span>
            </div>
            <div class="detail-item">
                <span>Distance Charge:</span>
                <span>${bookingDetails.delivery.distanceCharge}</span>
            </div>
            <div class="detail-item">
                <span>Insurance Charge:</span>
                <span>${bookingDetails.delivery.insuranceCharge}</span>
            </div>
            <div class="detail-item total">
                <span>Total Amount:</span>
                <span>${bookingDetails.delivery.amount}</span>
            </div>
        </div>
    `;
}

// Add event listeners for delivery type changes
document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
    radio.addEventListener('change', calculateCosts);
});

// Add event listeners for weight changes
document.getElementById('weight').addEventListener('input', calculateCosts);

// Add event listeners for pincode changes
document.getElementById('senderPincode').addEventListener('change', calculateCosts);
document.getElementById('receiverPincode').addEventListener('change', calculateCosts);

// Initialize costs when the page loads
document.addEventListener('DOMContentLoaded', calculateCosts);

// Tracking functionality
async function handleTrackingSubmit(event) {
    event.preventDefault();
    
    const trackingId = document.getElementById('trackingId').value;
    
    try {
        const trackingInfo = await window.supabaseFunctions.getTrackingInfo(trackingId);
        displayTrackingResult(trackingInfo);
    } catch (error) {
        alert('Tracking failed: ' + error.message);
    }
}

function displayTrackingResult(data) {
    const trackingResult = document.getElementById('trackingResult');
    const trackingNumberDisplay = document.getElementById('trackingNumberDisplay');
    const trackingStatus = document.getElementById('trackingStatus');
    const estimatedDelivery = document.getElementById('estimatedDelivery');
    const currentLocation = document.getElementById('currentLocation');
    const packageType = document.getElementById('packageType');
    const packageWeight = document.getElementById('packageWeight');
    const shippingCost = document.getElementById('shippingCost');
    const trackingTimeline = document.getElementById('trackingTimeline');

    // Update tracking information
    trackingNumberDisplay.textContent = data.trackingNumber;
    trackingStatus.textContent = data.status;
    estimatedDelivery.textContent = formatDate(data.estimatedDelivery);
    currentLocation.textContent = data.currentLocation;
    packageType.textContent = data.packageType;
    packageWeight.textContent = data.weight;
    shippingCost.textContent = data.shippingCost;

    // Update timeline
    trackingTimeline.innerHTML = '';
    data.timeline.forEach((event, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${index === 0 ? 'active' : ''} ${index < 1 ? 'completed' : ''}`;
        
        timelineItem.innerHTML = `
            <div class="time">${formatDateTime(event.time)}</div>
            <div class="status">${event.status}</div>
            <div class="location">${event.location}</div>
        `;
        
        trackingTimeline.appendChild(timelineItem);
    });

    // Show tracking result
    trackingResult.style.display = 'block';
    trackingResult.classList.add('active');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('en-IN', options);
}

// Google Sign-In handler
function handleGoogleSignIn(response) {
    // Decode the JWT token
    const responsePayload = jwt_decode(response.credential);
    
    // Store user data
    const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture,
        googleId: responsePayload.sub
    };

    // Store in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Successfully signed in with Google!
    `;

    // Insert success message before the form
    const form = document.getElementById('signInForm');
    form.insertBefore(successMessage, form.firstChild);

    // Redirect to home page after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Add JWT decode library
const script = document.createElement('script');
script.src = 'https://unpkg.com/jwt-decode/build/jwt-decode.js';
document.head.appendChild(script);

// Event listeners for real-time updates
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for all price-affecting elements
    const priceInputs = [
        'weight', 'senderPincode', 'receiverPincode',
        ...document.querySelectorAll('input[name="deliveryType"]')
    ];
    
    priceInputs.forEach(element => {
        if (typeof element === 'string') {
            document.getElementById(element).addEventListener('input', calculateCosts);
        } else {
            element.addEventListener('change', calculateCosts);
        }
    });
    
    // Initialize price calculation
    calculateCosts();
});

// Function to update the cost summary dynamically
function updateCostSummary() {
    const selectedDeliveryType = document.querySelector('input[name="deliveryType"]:checked');
    const weight = parseFloat(document.getElementById('weight').value) || 0;

    if (!selectedDeliveryType) return;

    const baseCharge = parseFloat(selectedDeliveryType.closest('.delivery-option').querySelector('.delivery-price').textContent.replace('₹', '')) || 0;
    const weightCharge = weight * 50; // Example: ₹50 per kg
    const distanceCharge = 100; // Example fixed distance charge
    const insuranceCharge = 199; // Fixed insurance charge
    const totalAmount = baseCharge + weightCharge + distanceCharge + insuranceCharge;

    // Update the cost summary section
    document.getElementById('baseCharge').textContent = `₹${baseCharge}`;
    document.getElementById('weightCharge').textContent = `₹${weightCharge}`;
    document.getElementById('distanceCharge').textContent = `₹${distanceCharge}`;
    document.getElementById('insuranceCharge').textContent = `₹${insuranceCharge}`;
    document.getElementById('totalAmount').textContent = `₹${totalAmount}`;
}

// Add event listeners for delivery type and weight changes
document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
    radio.addEventListener('change', updateCostSummary);
});
document.getElementById('weight').addEventListener('input', updateCostSummary);

// Helper Functions
function generateTrackingId() {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateTransactionId() {
    return 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
