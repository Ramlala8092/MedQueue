# MedQueue Patient–Doctor Chat

## Features
- Real-time text messages through Socket.IO.
- JPG, PNG and WEBP photo upload (maximum 5 MB).
- Chat access only for the patient and assigned doctor of a confirmed appointment.
- Uploaded chat photos are not served as public static files; access is checked on every photo request.

## Run locally
1. Keep your existing `backend/.env` file locally. It is intentionally not included in this ZIP.
2. Terminal 1:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Terminal 2:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Sign in as a patient and a doctor in separate browser sessions. Confirm an appointment from the doctor dashboard.
5. Open that confirmed appointment's **Open Chat** link from either dashboard.

The backend `.env` should define `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN=http://localhost:5173`. Use a strong private JWT secret. Do not share `.env` or commit it to Git.

## Notes
- Chat history is stored in MongoDB in the `chatmessages` collection.
- Private uploaded images are stored under `backend/private-chat-uploads/`; this folder is ignored by Git.
- For production, configure HTTPS, private durable file storage, request rate limits, monitoring, backups, and appropriate healthcare/privacy compliance before handling real patient data.
- This chat is not an emergency service and does not replace an in-person medical assessment.
