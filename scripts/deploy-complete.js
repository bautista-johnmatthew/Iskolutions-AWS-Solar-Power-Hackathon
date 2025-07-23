#!/usr/bin/env bun
import { $ } from 'bun';

console.log('🚀 Starting complete serverless deployment...');
console.log('📦 Using existing ECR images for deployment\n');

try {
  // Deploy API to Lambda first
  console.log('1️⃣ Deploying API to Lambda...');
  console.log('=' .repeat(50));
  await $`bun scripts/deploy-lambda-api.js`;
  
  console.log('\n');
  
  // Deploy Frontend to S3
  console.log('2️⃣ Deploying Frontend to S3...');
  console.log('=' .repeat(50));
  await $`bun scripts/deploy-s3-frontend.js`;
  
  console.log('\n');
  console.log('🎉 Complete deployment finished!');
  console.log('📋 Summary:');
  console.log('  ✅ API deployed to AWS Lambda');
  console.log('  ✅ Frontend deployed to S3 Static Hosting');
  console.log('  ✅ API Gateway configured');
  console.log('  ✅ IAM roles and permissions set');
  
  // Read deployment info
  try {
    const deploymentInfo = JSON.parse(await Bun.file('deployment-info.json').text());
    console.log('\n🔗 URLs:');
    console.log(`  Frontend: ${deploymentInfo.frontendUrl}`);
    
    // Get API Gateway URL
    const apiResult = await $`aws apigatewayv2 get-apis --query 'Items[?Name==\`iskolutions-api-gateway\`].ApiEndpoint' --output text`.text();
    if (apiResult.trim()) {
      console.log(`  API: ${apiResult.trim()}`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not read deployment info');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Test your API endpoints');
  console.log('  2. Configure your frontend to use the API Gateway URL');
  console.log('  3. Set up CloudFront for better performance (optional)');
  console.log('  4. Configure custom domain names (optional)');
  
} catch (error) {
  console.error('❌ Complete deployment failed:', error.message);
  process.exit(1);
}
