# 📸 Lensra – Photography Platform MVP

Lensra is a Django-based platform for photographers and clients to create personalized mini-sites, manage galleries, book sessions, and explore premium AI tools. This MVP will include custom user roles, profile dashboards, gallery features, and public photo feeds.

---

## ✅ Project Setup

- [ ] Create Django project `lensra`
- [ ] Create apps: `accounts`, `dashboard`, `gallery`, `bookings`, `feeds`
- [ ] Install required packages (e.g., `crispy_forms`, `django-allauth`, `whitenoise`)

---

## 👥 User Authentication System

### User Model

- [ ] Create a custom `User` model with `role` field: Photographer / Client
- [ ] Set `AUTH_USER_MODEL` in settings
- [ ] Add `is_photographer()` and `is_client()` helper methods

### Signup & Login

- [ ] Single registration page with:
  - [ ] Username
  - [ ] Email
  - [ ] Password1 / Password2
  - [ ] Role dropdown
- [ ] Redirect photographers to `/photographer/dashboard/`
- [ ] Redirect clients to `/client/dashboard/`
- [ ] Login and logout views
- [ ] Basic `base.html` layout for templates

---

## 🧑‍💼 Photographer Dashboard

- [ ] Photographer home with stats (bookings, galleries, etc.)
- [ ] Profile customization (bio, contact info, portfolio)
- [ ] Site theme selection
- [ ] Connect custom domain (optional MVP placeholder)

---

## 🧍 Client Dashboard

- [ ] Client home with recent sessions and shared galleries
- [ ] Upload & manage personal galleries
- [ ] View/edit profile

---

## 🖼️ Galleries & Photos

- [ ] Create photo albums (per session or theme)
- [ ] Upload multiple images
- [ ] Assign albums to clients
- [ ] Public/private toggle for each image or album

---

## 📅 Booking System (Basic MVP)

- [ ] Photographer sets availability
- [ ] Client requests session (date, type, notes)
- [ ] Photographer accepts/rejects
- [ ] View all bookings on dashboard

---

## 🎨 Mini-Sites for Photographers

- [ ] Auto-generate photographer mini-site (`lensra.com/u/username`)
- [ ] Show name, bio, portfolio images, booking link
- [ ] Choose between basic theme styles

---

## 🌍 Public Feed

- [ ] Show publicly shared images from all users
- [ ] Filter by photographer or tags
- [ ] Allow liking/favoriting (MVP optional)

---

## 💎 Premium Features (Stub for Future)

- [ ] Client subscription system (placeholder)
- [ ] Enable AI photo tools (future phase)

---

## 📦 Deployment (Optional)

- [ ] Setup static/media file hosting
- [ ] Configure PostgreSQL on production
- [ ] Deploy to Render / Railway / Fly.io / Vercel (via Django)

---

## 🗂 Project Structure (MVP)

```bash
lensra/
├── accounts/         # Custom user model and auth
├── dashboard/        # Role-based dashboards
├── gallery/          # Photo albums and uploads
├── bookings/         # Booking system
├── feeds/            # Public photo feed
├── templates/        # All frontend templates
├── static/           # CSS, JS, images
├── media/            # Uploaded media
├── manage.py
