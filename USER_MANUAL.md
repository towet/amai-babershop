# Amahi Babershop System - User Manual

## 1. Introduction

Welcome to the Amahi Babershop System! This manual provides a comprehensive guide to using our platform, whether you're a customer looking to book an appointment, a barber managing your services, or a manager overseeing the shop's operations.

### 1.1 Purpose of this Manual
This document aims to help users understand the features and functionalities of the Amahi Babershop system, ensuring a smooth and efficient experience.

### 1.2 User Roles
The system is designed for three primary user groups:
*   **Customers/Guests:** Individuals booking appointments.
*   **Barbers:** Service providers within the shop.
*   **Managers/Administrators:** Users responsible for shop operations and system management via the dashboard.

---

## 2. For Customers (Booking Appointments)

This section guides you through booking an appointment at Amahi Babershop using our online system, typically accessed via the shop's website.

### 2.1 Accessing the Booking System
The booking system is usually available through a "Book Now" button or link on the Amahi Babershop website.

### 2.2 Step-by-Step Booking Process

The booking modal will guide you through the following steps:

1.  **Choose Your Service(s):**
    *   Select one or more services you wish to receive (e.g., Haircut, Beard Trim).
    *   The price and duration for each service will be displayed.

2.  **Choose Your Barber (Optional):**
    *   You can select a preferred barber from the dropdown list. The list shows barber names and their specialties.
    *   Alternatively, you can leave this unselected to be assigned any available barber qualified for your chosen service(s).
    *   **View Barber Profiles:** An option to "View barber profiles" is available. Clicking this will show more details about each barber, including their photo, specialty, bio, and average star rating with number of reviews.

3.  **Select Date and Time:**
    *   A calendar will be displayed. Choose your preferred date for the appointment. Only available dates can be selected.
    *   Once a date is selected, available time slots for your chosen barber (if any) and service(s) will be shown. Select your preferred time.
    *   The system automatically checks for barber availability and shop working hours.

4.  **Provide Your Details:**
    *   Enter your Full Name.
    *   Enter your Email Address.
    *   Enter your Phone Number.
    *   You can also add any specific notes for your appointment.
    *   This information helps us contact you regarding your booking and will automatically create or link to your client profile in our system.

5.  **Review and Confirm Your Booking:**
    *   Before finalizing, review all your booking details: service(s), barber (if selected), date, time, and your contact information.
    *   Click the "Book Appointment" button to confirm.

### 2.3 Receiving Booking Confirmation
After successfully booking, you should receive a confirmation (e.g., on-screen, and potentially via email if email notifications are configured).

### 2.4 Managing Your Booking
(Details on how to cancel or reschedule would depend on specific features implemented for customers, such as a customer portal or confirmation email links. Assume for now, customers contact the shop directly for changes.)

---

## 3. For Barbers (Managing Your Schedule & Services)

While a dedicated barber-facing portal might be a future enhancement, here's how barbers interact with the system based on current capabilities.

### 3.1 Viewing Your Appointments
*   Your scheduled appointments will be visible to the shop manager on the main dashboard.
*   You will be informed of your bookings by the shop management.

### 3.2 Understanding Your Schedule & Availability
*   Your availability is determined by the appointments scheduled for you. The system prevents double-booking for the same time slot.
*   Shop managers can view your schedule and assign appointments.

### 3.3 Client Interactions
*   Access client notes and preferences for scheduled appointments as provided by the manager.

### 3.4 Tracking Your Performance
*   The system tracks metrics like:
    *   Total cuts performed.
    *   Commission earned (calculated based on service price and your commission rate).
    *   Client ratings and reviews (visible on your profile in the booking modal).
*   This information is typically accessible via the Manager Dashboard.

---

## 4. For Managers/Administrators (Shop Management Dashboard)

This section details how to use the Manager Dashboard to oversee and control shop operations.

### 4.1 Accessing the Dashboard
Log in to the system using your manager credentials to access the dashboard.

### 4.2 Dashboard Overview
The main dashboard provides a snapshot of key shop metrics, potentially including:
*   Total appointments today/this week/month.
*   Recent bookings.
*   Key performance indicators (KPIs) like revenue, popular services, and top-performing barbers. (Based on `dashboard-service.ts` capabilities).

### 4.3 Managing Appointments

Navigate to the "Appointments" or "Manager Dashboard" section.

*   **Viewing Appointments:**
    *   See a comprehensive list of all appointments (upcoming, completed, cancelled).
    *   Information includes client name, barber, service, date, time, status, and price.
*   **Filtering and Searching:**
    *   Filter appointments by date range, status, barber, or service.
    *   Search for specific appointments.
*   **Updating Appointment Status:**
    *   For each appointment, you can change its status:
        *   **Scheduled:** Default for new bookings.
        *   **Completed:** Mark when the service is finished. This automatically increments the client's `totalVisits` and updates their `lastVisit` date.
        *   **Cancelled:** If the client or shop cancels the appointment.
        *   **No-Show:** If the client does not arrive for their appointment.
*   **(Future/Implied) Creating/Editing Appointments:** The system is built to allow appointment creation and modification through service functions, which can be wired to UI elements in the dashboard.

### 4.4 Managing Services

Navigate to the "Services Management" section.

*   **Viewing Services:** See a list of all services offered, with their name, price, and duration.
*   **Adding a New Service:**
    *   Click "Add New Service."
    *   Enter service name, description (optional), price, and duration.
    *   Save the service.
*   **Editing an Existing Service:**
    *   Select a service from the list.
    *   Modify its details (name, price, duration).
    *   Save the changes.
*   **Deleting a Service:**
    *   Select a service.
    *   Confirm deletion (note: consider implications for past appointments using this service).

### 4.5 Managing Barbers

Navigate to the "Barbers Management" section.

*   **Viewing Barbers:** See a list of all barbers with key details.
*   **Adding a New Barber:**
    *   Click "Add New Barber."
    *   Enter barber's name, email, phone (optional), specialty, bio (optional), commission rate.
    *   Upload a photo (optional).
    *   Save the barber. The barber will be marked as 'active' by default.
*   **Editing Barber Details:**
    *   Select a barber.
    *   Update their information as needed.
    *   Save changes.
*   **Deactivating/Activating Barbers:**
    *   You can change a barber's status (e.g., to 'inactive' if they are no longer working at the shop). Inactive barbers typically won't appear in booking options.
*   **Viewing Barber Performance:** Access individual barber statistics like total cuts, commission earned, and average rating.

### 4.6 Managing Clients

Navigate to the "Clients Management" section.

*   **Viewing Clients:** See a list of all clients with their name, contact details, total visits, last visit, and preferred barber (name is displayed).
*   **Searching and Filtering Clients:** Search by name, email, or phone.
*   **Adding a New Client:**
    *   Click "Add New Client."
    *   Enter client's name, email, phone, preferred barber (optional), and any notes.
    *   Save the client.
*   **Editing Client Details:**
    *   Select a client.
    *   Update their information.
    *   Save changes.
*   **Viewing Client Appointment History:**
    *   For each client, you can expand their record to view a list of their past and upcoming appointments.
    *   This list includes appointment date, time, service, barber, and status.
*   **Deleting a Client:**
    *   Select a client.
    *   Confirm deletion (note: consider data retention policies and impact on historical appointment records).

### 4.7 Managing Your Profile (Manager Profile)
Navigate to the "Profile" section in the dashboard to update your own manager account details (e.g., name, password).

---

## 5. Troubleshooting & FAQs

*   **Q: I can't find an available time slot.**
    *   A: The barber may be fully booked, or the shop might be closed on the selected date. Try a different date or barber.
*   **Q: How do I cancel or change my appointment?**
    *   A: Please contact Amahi Babershop directly via phone or email for any changes to your booking. (This may be updated if self-service options are added).
*   **Q: (Manager) A barber's rating is "N/A" or "0.0" in the booking modal dropdown.**
    *   A: This was an issue that has been addressed. Ratings are no longer shown in the barber selection dropdown to simplify it. Detailed ratings are available in the "View Barber Profiles" section. If a barber has no ratings yet, their profile will show "N/A".

---

## 6. Conclusion

We hope this manual helps you make the most of the Amahi Babershop system. We are continuously working to improve our services and features. For any further assistance or feedback, please contact shop management.
