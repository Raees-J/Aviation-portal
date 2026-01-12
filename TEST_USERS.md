# Test User Credentials

The system comes pre-loaded with 3 test users:

## 1. Admin User
- **Email:** admin@stelfly.co.za
- **Password:** Admin123!

## 2. Test Pilot
- **Email:** pilot@stelfly.co.za
- **Password:** Pilot123!

## 3. Instructor
- **Email:** instructor@stelfly.co.za
- **Password:** Instructor123!

---

## Adding Users Manually

To add users to the system, edit `/frontend/lib/addUser.ts` and add:

```typescript
await addUser('email@example.com', 'password', 'FirstName', 'LastName', '+27 123456789');
```

Then restart the server.

---

## Production Setup

For production, replace the in-memory `users` array with a proper database (PostgreSQL, MongoDB, etc.) and implement proper user management.
