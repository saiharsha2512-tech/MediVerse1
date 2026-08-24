# MediVerse – Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** MediVerse  
**Version:** 1.0  
**Date:** August 2026  
**Author:** MediVerse Team  

MediVerse is a comprehensive, full-stack digital healthcare platform that connects patients, doctors, and delivery partners in a single unified ecosystem. It enables users to consult doctors, book appointments, purchase medicines, manage health records, and get AI-powered health assistance — all from one application.

---

## 2. Goals & Objectives

| Goal | Description |
|------|-------------|
| Patient Empowerment | Provide patients with tools to manage their healthcare journey end-to-end |
| Doctor Efficiency | Give doctors a dedicated portal to manage appointments, patients, prescriptions, and revenue |
| Medicine Accessibility | Enable seamless online medicine ordering with real-time delivery tracking |
| AI Health Assistance | Offer an AI-powered symptom checker and health guidance module |
| Operational Transparency | Equip delivery partners with a dedicated dashboard for order management |

---

## 3. Target Users

### 3.1 Patients (Primary Users)
- Individuals seeking medical consultations, medicine delivery, and health management.
- Need: Easy access to doctors, medicines, and health records from a mobile-friendly interface.

### 3.2 Doctors
- Licensed medical professionals who want to manage their practice digitally.
- Need: Appointment management, patient records, prescription generation, and earnings visibility.

### 3.3 Delivery Partners
- Individuals responsible for delivering medicines to patients.
- Need: A dashboard to view and manage assigned delivery orders.

---

## 4. Functional Requirements

### 4.1 Patient Portal

#### Authentication
- FR-101: Users must be able to register with name, email, mobile, and password.
- FR-102: Users must be able to log in using email and password with JWT-based authentication.
- FR-103: Passwords must be hashed using bcrypt before storage.

#### Dashboard & Home
- FR-104: The home screen must display health tips, upcoming appointments, and quick-access widgets.
- FR-105: Users must be able to navigate to Doctors, Medicines, Bookings, AI Check, and Profile via a bottom navigation bar.

#### Doctor Consultation
- FR-106: Users must be able to browse a list of available doctors with specialization, experience, and fee details.
- FR-107: Users must be able to book an appointment with a selected doctor for an available time slot.
- FR-108: Users must be able to view all their upcoming and past bookings.
- FR-109: Users must receive notifications when a doctor accepts or updates an appointment.

#### Medicine Ordering
- FR-110: Users must be able to browse, search, and filter medicines by category.
- FR-111: Users must be able to add medicines to a cart and proceed to checkout.
- FR-112: Users must be able to review their cart, enter delivery address, and place an order.
- FR-113: Upon successful order placement, users must see a confirmation screen with order details.

#### AI Health Check
- FR-114: Users must be able to describe symptoms in natural language to an AI chatbot.
- FR-115: The AI module must provide possible conditions, recommended actions, and whether to see a doctor.
- FR-116: AI chat history must be maintained within the session.

#### Profile & Health Records
- FR-117: Users must be able to update their profile photo, name, mobile, and personal details.
- FR-118: Users must be able to upload and view medical reports.
- FR-119: Users must be able to view and manage their medical history.

---

### 4.2 Doctor Portal

#### Authentication
- FR-201: Doctors must be able to register with professional credentials (degree, specialty, experience, fee).
- FR-202: Doctors must be able to log in with a separate JWT-based auth system.

#### Dashboard
- FR-203: The doctor dashboard must display summary cards: total appointments, patients, revenue, and pending appointments.
- FR-204: Doctors must see charts and analytics for appointments and revenue over time.

#### Appointment Management
- FR-205: Doctors must be able to view all scheduled appointments.
- FR-206: Doctors must be able to accept or reject appointment requests.
- FR-207: Doctors must be able to view detailed patient info for each appointment.
- FR-208: Doctors must be able to initiate or join a video call for a booked appointment.

#### Patient Management
- FR-209: Doctors must be able to see a list of all their patients.
- FR-210: Doctors must be able to view patient medical history and records.

#### Prescriptions
- FR-211: Doctors must be able to create and send digital prescriptions to patients.
- FR-212: Prescriptions must include medicines, dosage, and doctor notes.

#### Revenue
- FR-213: Doctors must be able to view earnings breakdown by date and patient.

---

### 4.3 Delivery Partner Portal

#### Authentication
- FR-301: Delivery partners must be able to register and log in with their own credentials.

#### Order Management
- FR-302: Delivery partners must be able to view all assigned medicine delivery orders.
- FR-303: Delivery partners must be able to mark orders as "picked up", "in transit", and "delivered".

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Performance | API response time < 500ms for 95th percentile |
| NFR-02 | Availability | 99.5% uptime |
| NFR-03 | Security | All endpoints protected by JWT; passwords hashed with bcrypt |
| NFR-04 | Scalability | Horizontal scaling via Docker containers |
| NFR-05 | Usability | Mobile-first, responsive UI supporting all screen sizes |
| NFR-06 | Data Privacy | No sensitive medical data shared without user consent |

---

## 6. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, React Icons, Recharts |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| AI | OpenAI API integration |
| File Handling | Multer (profile photos, medical reports) |
| PDF Generation | jsPDF, jsPDF-AutoTable |
| Containerization | Docker |

---

## 7. Constraints & Assumptions

- The platform requires an active internet connection.
- AI health check is advisory only and does not replace professional medical advice.
- Medicine inventory is pre-seeded into the database via `seedMedicines.js`.
- Video calls are facilitated through an external WebRTC-compatible solution.

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| User Registration | 100+ users in first month |
| Appointment Booking Rate | > 40% of registered users book at least one appointment |
| Medicine Order Rate | > 30% of users place at least one order |
| AI Chat Engagement | > 50% of users use the AI health check feature |
| Doctor Onboarding | 10+ doctors registered in first month |
