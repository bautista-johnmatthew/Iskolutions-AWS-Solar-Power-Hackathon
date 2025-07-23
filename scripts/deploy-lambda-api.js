#!/usr/bin/env bun
import { $ } from 'bun';

// Load environment variables from root .env
try {
  const envContent = await Bun.file('../web/.env').text();
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
  console.log('📁 Environment variables loaded');
} catch (error) {
  console.warn('⚠️  Could not load .env file:', error.message);
}

const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || '876497563387';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DYNAMO_DB_TABLE = process.env.DYNAMO_DB_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;

const API_IMAGE = `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/iskolutions-forum-api:latest`;
const FUNCTION_NAME = 'iskolutions-api';

console.log('🚀 Deploying API to Lambda using ECR image...');
console.log(`📦 Image: ${API_IMAGE}`);

try {
  // Check if Lambda execution role exists, create if not
  console.log('🔐 Setting up IAM role...');
  try {
    await $`aws iam get-role --role-name lambda-execution-role`;
    console.log('✅ Lambda execution role already exists');
  } catch {
    console.log('📝 Creating Lambda execution role...');
    
    // Create trust policy
    const trustPolicy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    };

    await $`aws iam create-role --role-name lambda-execution-role --assume-role-policy-document '${JSON.stringify(trustPolicy)}'`;
    
    // Attach policies
    await $`aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`;
    await $`aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess`;
    await $`aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess`;
    
    console.log('✅ Lambda execution role created with required policies');
    
    // Wait for role to propagate
    console.log('⏳ Waiting for IAM role to propagate...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const roleArn = `arn:aws:iam::${AWS_ACCOUNT_ID}:role/lambda-execution-role`;

  // Check if Lambda function exists
  let functionExists = false;
  try {
    await $`aws lambda get-function --function-name ${FUNCTION_NAME}`;
    functionExists = true;
    console.log('📝 Lambda function already exists, updating...');
  } catch {
    console.log('🆕 Creating new Lambda function...');
  }

  if (functionExists) {
    // Update existing function
    await $`aws lambda update-function-code --function-name ${FUNCTION_NAME} --image-uri ${API_IMAGE}`;
    
    // Update environment variables
    await $`aws lambda update-function-configuration --function-name ${FUNCTION_NAME} --environment Variables="{SUPABASE_URL=${SUPABASE_URL},SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY},DYNAMO_DB_TABLE=${DYNAMO_DB_TABLE},S3_BUCKET=${S3_BUCKET}}"`;
    
  } else {
    // Create new function
    await $`aws lambda create-function --function-name ${FUNCTION_NAME} --package-type Image --code ImageUri=${API_IMAGE} --role ${roleArn} --timeout 30 --memory-size 1024 --environment Variables="{SUPABASE_URL=${SUPABASE_URL},SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY},DYNAMO_DB_TABLE=${DYNAMO_DB_TABLE},S3_BUCKET=${S3_BUCKET}}"`;
  }

  console.log('✅ Lambda function deployed successfully!');

  // Create or update API Gateway
  console.log('🌐 Setting up API Gateway...');
  
  let apiId;
  try {
    const result = await $`aws apigatewayv2 get-apis --query 'Items[?Name==\`iskolutions-api-gateway\`].{ApiId:ApiId}' --output text`.text();
    if (result.trim()) {
      apiId = result.trim();
      console.log(`✅ API Gateway already exists: ${apiId}`);
    } else {
      throw new Error('API not found');
    }
  } catch {
    console.log('🆕 Creating API Gateway...');
    const result = await $`aws apigatewayv2 create-api --name iskolutions-api-gateway --protocol-type HTTP --target arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:${FUNCTION_NAME} --query 'ApiId' --output text`.text();
    apiId = result.trim();
  }

  // Add Lambda permission for API Gateway
  try {
    await $`aws lambda add-permission --function-name ${FUNCTION_NAME} --statement-id allow-apigateway-${apiId} --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn arn:aws:execute-api:${AWS_REGION}:${AWS_ACCOUNT_ID}:${apiId}/*/*`;
  } catch (error) {
    // Permission might already exist
    console.log('⚠️  Lambda permission may already exist');
  }

  // Get API Gateway URL
  const apiUrl = await $`aws apigatewayv2 get-api --api-id ${apiId} --query 'ApiEndpoint' --output text`.text();
  
  console.log('🎉 API deployment completed!');
  console.log(`🔗 API URL: ${apiUrl.trim()}`);
  console.log(`📋 Function Name: ${FUNCTION_NAME}`);
  console.log(`🏷️  API Gateway ID: ${apiId}`);

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
