#!/bin/bash

# Real Estate Platform - Quick Setup Script
# This script automatically sets up both backend and frontend

echo "🚀 Real Estate Platform Setup Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Create project directory
read -p "Enter project name (default: real-estate-platform): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-real-estate-platform}

echo -e "${BLUE}Creating project directory: $PROJECT_NAME${NC}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Setup Backend
echo -e "\n${BLUE}Setting up Backend...${NC}"
mkdir -p backend
cd backend

# Initialize backend
npm init -y > /dev/null

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install express mongoose bcryptjs jsonwebtoken dotenv nodemailer cors validator --save > /dev/null 2>&1
npm install nodemon --save-dev > /dev/null 2>&1

# Create .env file
echo -e "${BLUE}Creating backend .env file...${NC}"
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://ranahammad9795:rana786@cluster0.fqn50wf.mongodb.net/?appName=Cluster0

# JWT Configuration
JWT_SECRET=change-this-in-production-super-secret-key
JWT_EXPIRE=7d

# Gmail Configuration (for OTP)
GMAIL_USER=ranahammad9795@gmail.com
GMAIL_APP_PASSWORD=euzx traf cevi wuvs

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo -e "${YELLOW}📝 Backend .env file created. Update JWT_SECRET before production!${NC}"

cd ..

# Setup Frontend
echo -e "\n${BLUE}Setting up Frontend...${NC}"
mkdir -p frontend
cd frontend

# Create Vite React project
echo -e "${BLUE}Creating React project with Vite...${NC}"
npm create vite@latest . -- --template react > /dev/null 2>&1

# Install dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
npm install react-router-dom axios lucide-react > /dev/null 2>&1
npm install -D tailwindcss postcss autoprefixer > /dev/null 2>&1

# Initialize Tailwind
npx tailwindcss init -p > /dev/null 2>&1

# Create .env file
echo -e "${BLUE}Creating frontend .env file...${NC}"
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Create postcss config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Final instructions
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "1. Navigate to the project:"
echo -e "   ${YELLOW}cd $PROJECT_NAME${NC}"

echo -e "\n2. Start Backend (Terminal 1):"
echo -e "   ${YELLOW}cd backend${NC}"
echo -e "   ${YELLOW}npm run dev${NC}"

echo -e "\n3. Start Frontend (Terminal 2):"
echo -e "   ${YELLOW}cd frontend${NC}"
echo -e "   ${YELLOW}npm run dev${NC}"

echo -e "\n${BLUE}🌐 Access the application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000${NC}"

echo -e "\n${YELLOW}⚠️  Important:${NC}"
echo -e "   - Change JWT_SECRET in backend/.env before production"
echo -e "   - Ensure MongoDB Atlas connection is working"
echo -e "   - Verify Gmail SMTP credentials"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo -e "   Read COMPLETE_SETUP_GUIDE.md for detailed instructions"

echo -e "\n${GREEN}Happy coding! 🚀${NC}\n"
