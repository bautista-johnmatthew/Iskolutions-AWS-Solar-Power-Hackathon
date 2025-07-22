#!/usr/bin/env bun
import { $ } from 'bun';
import { resolve } from 'path';

// Load environment variables from .env file in web directory
try {
  const envPath = resolve(process.cwd(), '.env'); // Should be web/.env since script runs from web/
  const envContent = await Bun.file(envPath).text();
  const envVars = envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  
  Object.assign(process.env, envVars);
  console.log('📁 Environment variables loaded from', envPath);
} catch (error) {
  console.warn('⚠️  Could not load .env file:', error.message);
  console.log('🔍 Looking for .env in:', resolve(process.cwd(), '.env'));
}

// Simple ECR deployment script using Bun
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1'
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID
const PROJECT_NAME = 'iskolutions-forum'

if (!AWS_ACCOUNT_ID) {
  console.error('❌ AWS_ACCOUNT_ID environment variable is required')
  console.error('📋 To find your AWS Account ID, run: aws sts get-caller-identity --query Account --output text')
  console.error('📝 Then update your .env file with: AWS_ACCOUNT_ID=123456789012')
  process.exit(1)
}

// Validate AWS Account ID format (12 digits)
if (!/^\d{12}$/.test(AWS_ACCOUNT_ID)) {
  console.error('❌ AWS_ACCOUNT_ID must be a 12-digit number')
  console.error(`📝 Current value: ${AWS_ACCOUNT_ID}`)
  console.error('📋 To find your AWS Account ID, run: aws sts get-caller-identity --query Account --output text')
  process.exit(1)
}

const ECR_REGISTRY = `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com`
const FRONTEND_REPO = `${PROJECT_NAME}-frontend`
const API_REPO = `${PROJECT_NAME}-api`

console.log('🚀 Starting simple ECR deployment...')
console.log(`📍 Region: ${AWS_REGION}`)
console.log(`🔢 Account: ${AWS_ACCOUNT_ID}`)

try {
  // Login to ECR
  console.log('🔐 Logging into ECR...')
  const loginPassword = await $`aws ecr get-login-password --region ${AWS_REGION}`.text()
  const loginProcess = Bun.spawn(['docker', 'login', '--username', 'AWS', '--password-stdin', ECR_REGISTRY], {
    stdin: 'pipe'
  })
  loginProcess.stdin.write(loginPassword)
  loginProcess.stdin.end()
  await loginProcess.exited

  // Create repositories if they don't exist (ignore errors if they already exist)
  console.log('📦 Ensuring repositories exist...')
  try {
    await $`aws ecr create-repository --repository-name ${FRONTEND_REPO} --region ${AWS_REGION}`
  } catch (e) {
    console.log('Frontend repo already exists or creation failed')
  }
  
  try {
    await $`aws ecr create-repository --repository-name ${API_REPO} --region ${AWS_REGION}`
  } catch (e) {
    console.log('API repo already exists or creation failed')
  }

  // Build and push frontend
  console.log('🏗️  Building frontend image...')
  await $`docker build -t ${FRONTEND_REPO} .`
  await $`docker tag ${FRONTEND_REPO}:latest ${ECR_REGISTRY}/${FRONTEND_REPO}:latest`
  
  console.log('📤 Pushing frontend image...')
  await $`docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:latest`

  // Build and push API
  console.log('🏗️  Building API image...')
  await $`docker build -t ${API_REPO} ../api`
  await $`docker tag ${API_REPO}:latest ${ECR_REGISTRY}/${API_REPO}:latest`
  
  console.log('📤 Pushing API image...')
  await $`docker push ${ECR_REGISTRY}/${API_REPO}:latest`

  console.log('✅ Deployment completed successfully!')
  console.log(`🎯 Frontend: ${ECR_REGISTRY}/${FRONTEND_REPO}:latest`)
  console.log(`🎯 API: ${ECR_REGISTRY}/${API_REPO}:latest`)

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}
