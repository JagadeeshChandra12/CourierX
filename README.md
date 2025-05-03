# CourierX

CourierX is a modern courier and delivery management system designed to streamline the process of booking, tracking, and managing deliveries. It provides an intuitive user interface for customers and an admin dashboard for managing bookings, payments, and tracking.

## Features

### User Features
- **Book Deliveries**: Customers can book deliveries with detailed sender and receiver information.
- **Track Packages**: Real-time tracking of packages with status updates and location history.
- **Payment Integration**: Secure payment options for booking deliveries.
- **User Authentication**: Sign up, sign in, and profile management for customers.

### Admin Features
- **Dashboard**: View statistics like total bookings, active deliveries, and revenue.
- **Manage Bookings**: Update booking statuses, view details, and delete bookings.
- **User Management**: View user profiles, block/unblock users, and view user bookings.
- **Payment Management**: Track payments and update payment statuses.
- **Real-Time Updates**: Admin dashboard updates dynamically with real-time data.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL, Authentication, and Realtime Database)
- **Libraries**:
  - [Font Awesome](https://fontawesome.com) for icons
  - [jsPDF](https://github.com/parallax/jsPDF) for generating invoices
- **Styling**: Custom CSS with responsive design principles

## Project Structure

```
CourierX Final/
├── index.html               # Homepage
├── about.html               # About Us page
├── book.html                # Book Delivery page
├── booking-confirmation.html # Booking Confirmation page
├── contact.html             # Contact Us page
├── services.html            # Services page
├── signin.html              # Sign In page
├── signup.html              # Sign Up page
├── track.html               # Track Package page
├── admin.html               # Admin Dashboard
├── styles.css               # Global styles
├── nav.css                  # Navbar styles
├── script.js                # General JavaScript
├── supabase.js              # Supabase client configuration
├── admin.js                 # Admin dashboard logic
├── nav.js                   # Navbar logic
└── assets/                  # Images and other assets
```

## How to Run

1. Clone the repository to your local machine.
2. Ensure you have an active Supabase project and configure the `supabase.js` file with your Supabase credentials.
3. Open the `index.html` file in your browser to start the application.

## Future Enhancements

- Add email notifications for booking updates.
- Implement advanced analytics for the admin dashboard.
- Integrate additional payment gateways.
- Add multi-language support.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.com) for providing an excellent backend-as-a-service platform.
- [Font Awesome](https://fontawesome.com) for the icons used in the project.
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation.

---
Developed with ❤️ by the CourierX Team.
