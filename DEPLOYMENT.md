
# Deployment Guide

This guide covers deployment options for the Iskolutions Forum application.

## Technology Stack
- **Frontend**: Vanilla JavaScript with Bun runtime
- **Backend**: Python FastAPI
- **Authentication**: Supabase
- **Database**: AWS DynamoDB
- **Containerization**: Docker
- **Container Registry**: Amazon ECR

## Prerequisites

- Docker installed and running
- AWS CLI installed and configured
- Bun runtime installed
- AWS account with appropriate permissions

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

### Manual Serverless Steps

If you prefer manual deployment:

1. **API to Lambda:**
   - Create Lambda function from ECR image
   - Set up API Gateway HTTP API
   - Configure environment variables
   - Set up IAM roles for Lambda execution

2. **Frontend to S3:**
   - Extract static files from ECR frontend image
   - Create S3 bucket with static website hosting
   - Upload files and configure public access
   - Update API endpoints in frontend configuration

## Build

### API
Build api container
```bash
cd api
docker build -t iskolutions-forum-api .
```

### Front end
Build the front end application
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

### Environment Variables
Create a `.env` file with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AWS_DEFAULT_REGION=us-east-1
# Add other required environment variables
```

### Commands
For building one image only
```bash
DOCKER_BUILDKIT=0 docker build \
  --platform=linux/amd64 \
  -t {ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/{ECR_NAME}:latest .

docker push {ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/{ECR_NAME}:latest
```

## S3 Deployment
```bash
cd web
bun run build
aws s3 sync ./dist s3://my-bucket-name
```
