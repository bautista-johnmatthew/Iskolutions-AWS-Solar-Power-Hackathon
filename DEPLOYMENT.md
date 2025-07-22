
## Technology Stack
- **Frontend**: Vanilla JavaScript with Bun runtime
- **Backend**: Python FastAPI
- **Authentication**: Supabase
- **Database**: AWS DynamoDB
- **Containerization**: Docker
- **Container Registry**: Amazon ECR
- **CI/CD**: GitHub Actions

## Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/bautista-johnmatthew/Iskolutions-AWS-Solar-Hackathon.git
cd Iskolutions-AWS-Solar-Hackathon

# Edit .env with your actual values

# Run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

### Alternative: Run services separately
```bash
# Terminal 1 - API
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Frontend
cd web
bun install
bun run dev
```

## Build

### API
Build api container

```bash
cd api
docker build -t iskolutions-forum-api .
```

### Front end
```bash
cd web
bun run build
```

## Deployment

### ECR Deployment (Recommended)

#### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed and running
- ECR repository created (script will create if not exists)

#### Using Bun Scripts
```bash

# Deploy frontend
cd web
bun run ecr:deploy
```

### Environment Variables
Create a `.env` file with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AWS_DEFAULT_REGION=us-east-1
# Add other required environment variables
```