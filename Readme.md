# 📌 KendoReact Free Components Challenge Submission
This is a submission for the KendoReact Free Components Challenge.

What I Built 🎁
I built a feature-rich Wishlist App that allows users to:
- ✅ Create and manage wishlists.
- ✅ Add, edit, and remove wishlist items.
- ✅ Mark items as favorites ❤️.
- ✅ Share their wishlist via a unique link.
- ✅ Reserve items from shared wishlists.
- ✅ Get AI-powered gift recommendations 🎯.

This project is designed to help users organize gift ideas for birthdays, holidays, and special occasions while enhancing collaboration with friends and family.

# Running the Project Locally
1. 1️⃣ Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```
2. 2️⃣ Setup the Environment Variables
- Frontend:
Rename .env.example to .env and fill in your Firebase credentials:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_APP_DOMAIN=your_app_domain
REACT_APP_FIREBASE_PROJECT_NAME=your_project_name
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```
- Backend:
Rename .env.example to .env and add your Cloudflare credentials:

```
CLOUDFLARE_ACCOUNT=your_account_id
CLOUDFLARE_TOKEN=your_api_token
```

3.  Install Dependencies
- Frontend:
```
cd frontend
npm install
npm start
```

- Backend:

```
cd backend
npm install
npm start
```

Your app should now be running! 🎉