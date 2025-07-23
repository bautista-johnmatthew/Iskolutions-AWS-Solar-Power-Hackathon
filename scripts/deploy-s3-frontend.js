#!/usr/bin/env bun
import { $ } from 'bun';

// Load environment variables from web/.env
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
const FRONTEND_IMAGE = `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/iskolutions-forum-frontend:latest`;
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'iskolutions-forum-frontend-default';

if (!process.env.S3_BUCKET_NAME) {
  console.warn('⚠️  Using default bucket name. Consider setting S3_BUCKET_NAME in the environment for better control.');
}
console.log('🚀 Deploying Frontend to S3 from ECR image...');
console.log(`📦 Image: ${FRONTEND_IMAGE}`);
console.log(`🪣 Bucket: ${BUCKET_NAME}`);

try {
  // Create temporary directory
  console.log('📁 Creating temporary directory...');
  await $`mkdir -p temp-frontend`;

  // Pull the latest image
  console.log('📥 Pulling latest frontend image...');
  await $`docker pull ${FRONTEND_IMAGE}`;

  // Extract files from container
  console.log('📤 Extracting files from container...');
  await $`docker run --rm -v ${process.cwd()}/temp-frontend:/output ${FRONTEND_IMAGE} sh -c "cp -r /app/src/static/* /output/ 2>/dev/null || true; cp -r /app/src/templates/* /output/ 2>/dev/null || true; cp -r /app/dist/* /output/ 2>/dev/null || true; ls -la /output"`;

  // Check if files were extracted
  const files = await $`ls -la temp-frontend`.text();
  console.log('📋 Extracted files:', files);

  // If no dist files, create a simple index.html
  try {
    await $`ls temp-frontend/index.html`;
  } catch {
    console.log('📝 Creating basic index.html...');
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iskolutions Forum</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            text-align: center;
            margin-top: 50px;
        }
        .status {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 Iskolutions Forum</h1>
        <div class="status">
            <h2>✅ Frontend Deployed Successfully!</h2>
            <p>Your application frontend is now hosted on Amazon S3.</p>
            <p>The backend API is running on AWS Lambda.</p>
        </div>
        <p>Welcome to the Iskolutions AWS Solar Hackathon 2025 project!</p>
    </div>
    <script>
        // Basic API connectivity test
        fetch(window.location.origin + '/api/health')
            .then(response => response.json())
            .then(data => console.log('API Health:', data))
            .catch(error => console.log('API not connected yet:', error));
    </script>
</body>
</html>`;

    await Bun.write('temp-frontend/index.html', indexHtml);
  }

  // Create S3 bucket
  console.log('🪣 Creating S3 bucket...');
  try {
    await $`aws s3 mb s3://${BUCKET_NAME} --region ${AWS_REGION}`;
    console.log('✅ S3 bucket created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ S3 bucket already exists');
    } else {
      throw error;
    }
  }

  // Upload files to S3
  console.log('📤 Uploading files to S3...');
  await $`aws s3 sync ./temp-frontend s3://${BUCKET_NAME} --delete`;

  // Configure static website hosting
  console.log('🌐 Configuring static website hosting...');
  await $`aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document error.html`;

  // Create and apply bucket policy for public access
  console.log('🔓 Making bucket publicly accessible...');
  const bucketPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  };

  const policyFile = 'temp-policy.json';
  await Bun.write(policyFile, JSON.stringify(bucketPolicy, null, 2));
  await $`aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://${policyFile}`;
  await $`rm ${policyFile}`;

  // Clean up temporary directory
  console.log('🧹 Cleaning up...');
  await $`rm -rf temp-frontend`;

  const websiteUrl = `http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com`;
  
  console.log('🎉 Frontend deployment completed!');
  console.log(`🔗 Website URL: ${websiteUrl}`);
  console.log(`🪣 S3 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${AWS_REGION}`);

  // Save deployment info
  const deploymentInfo = {
    frontendUrl: websiteUrl,
    bucketName: BUCKET_NAME,
    region: AWS_REGION,
    deployedAt: new Date().toISOString()
  };

  await Bun.write('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('📝 Deployment info saved to deployment-info.json');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  
  // Clean up on failure
  try {
    await $`rm -rf temp-frontend`;
    await $`rm -f temp-policy.json`;
  } catch {}
  
  process.exit(1);
}
