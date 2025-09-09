# Quick Start Guide

Get the Civic Complaint Portal running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Check Setup
```bash
npm run check
```

### 3. Set Up Environment
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/civic-portal
JWT_SECRET=your-secret-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB
**Option A - Local MongoDB:**
```bash
# Install MongoDB locally and start the service
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Create account at https://mongodb.com/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env`

### 5. Seed Database (Optional)
```bash
npm run seed
```
Creates demo users and sample complaints.

### 6. Start Application
```bash
npm run dev
```

Visit: http://localhost:5173

## 🎯 Demo Credentials

After running `npm run seed`:

**Officers:**
- Username: `officer1` Password: `password123`
- Username: `officer2` Password: `password123`

**Citizens:**
- Username: `citizen1` Password: `password123`
- Username: `citizen2` Password: `password123`

## 🔧 Troubleshooting

**MongoDB Connection Issues:**
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For Atlas: verify connection string and network access

**Port Already in Use:**
- Change PORT in .env file
- Kill existing processes on ports 3001/5173

**Dependencies Issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Usage

### Public Users
1. Visit homepage
2. Fill complaint form
3. Add photos (optional)
4. Submit complaint

### Officers
1. Click "Officer Login"
2. Use demo credentials
3. View dashboard
4. Manage complaints
5. Update status and add notes

## 🎉 You're Ready!

The application includes:
- ✅ Full-stack React + Node.js setup
- ✅ MongoDB integration
- ✅ JWT authentication
- ✅ Image upload support
- ✅ Responsive design
- ✅ Sample data

Need help? Check the full README.md for detailed documentation.