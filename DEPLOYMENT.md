
# Deployment Guide

This guide covers deployment options for the Iskolutions Forum application.

## Technology Stack
- **Frontend**: Vanilla JavaScript with Bun runtime
- **Backend**: Python FastAPI
- **Authentication**: Supabase
- **Database**: AWS DynamoDB
- **Containerization**: Docker
- **Container Registry**: Amazon ECR
- **CI/CD**: GitHub Actions

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

## Serverless Deployment (Automated - Recommended)

### Quick Serverless Deployment

For automated serverless deployment using existing ECR images:

```bash
# Deploy everything at once
bun scripts/deploy-complete.js

# Or deploy individually:
bun scripts/deploy-lambda-api.js    # Deploy API to Lambda
bun scripts/deploy-s3-frontend.js   # Deploy Frontend to S3
```

This will automatically:
- ✅ Create IAM roles and policies
- ✅ Deploy API to AWS Lambda using ECR image
- ✅ Set up API Gateway for HTTP endpoints
- ✅ Extract frontend from ECR and deploy to S3
- ✅ Configure S3 for static website hosting
- ✅ Set up public access policies

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

## Container Deployment (ECR + ECS/EKS)

1. **Configure environment variables:**
   ```bash
   # Make sure web/.env file has:
   # AWS_ACCOUNT_ID=your-account-id
   # AWS_REGION=your-region
   ```

2. **Deploy to ECR:**
   ```bash
   bun scripts/deploy-ecr.js
   ```

   This script will:
   - Build Docker images for both API and web
   - Create ECR repositories if they don't exist
   - Push images to ECR
   - Output the image URIs for use in ECS/EKS

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