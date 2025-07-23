#!/usr/bin/env bun

import { readdir, mkdir, cp } from 'fs/promises'
import { existsSync } from 'fs'

const srcDir = './src'
const distDir = './dist'

console.log('🏗️  Building frontend with Bun...')

// Clean and create dist directory
if (existsSync(distDir)) {
  await Bun.$`rm -rf ${distDir}`
}

await mkdir(distDir, { recursive: true })

// Copy all source files to dist
await cp(srcDir, distDir, { recursive: true })

// Copy package.json and other root files
await cp('./package.json', `${distDir}/package.json`)

console.log('✅ Build completed!')
console.log(`📦 Files copied to: ${distDir}`)
console.log('🚀 Ready for deployment!')
