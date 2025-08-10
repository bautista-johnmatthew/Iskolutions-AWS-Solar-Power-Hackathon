// Test file for ProfileUtils functionality
import profileUtils from '../web/src/static/js/profile-api/profileUtils.js';
import { sessionManager } from '../web/src/static/js/managers/session-manager-vanilla.js';
import { AuthService } from '../web/src/static/js/auth/auth-service.js';

/**
 * Test ProfileUtils functionality with real authentication
 * This file demonstrates how to use the ProfileUtils class with real login through auth-service
 */

// Create auth service instance
const authService = new AuthService();

// Test users for real authentication (these need to exist in your backend)
const TEST_CREDENTIALS = {
    user1: {
        username: 'Matt',
        password: 'Password123#',
        expectedRole: 'student'
    },
};

// Fallback mock users if real auth is not available
const MOCK_USERS = {
    user1: {
        id: 'test-user-001',
        email: 'john.doe@pup.edu.ph',
        name: 'johndoe',
        token: 'mock-jwt-token-user1',
        studentId: '2021-00001',
        role: 'student'
    },
    user2: {
        id: 'test-user-002',
        email: 'jane.smith@pup.edu.ph',
        name: 'janesmith',
        token: 'mock-jwt-token-user2',
        studentId: '2021-00002',
        role: 'faculty'
    },
    admin: {
        id: 'test-admin-001',
        email: 'admin@pup.edu.ph',
        name: 'admin',
        token: 'mock-jwt-token-admin',
        studentId: null,
        role: 'moderator'
    }
};

/**
 * Attempt real login using auth service
 * @param {string} userKey - Key from TEST_CREDENTIALS object
 * @returns {Object} Login result with user data
 */
async function realLogin(userKey = 'user1') {
    console.log(`🔐 Attempting real login for: ${userKey}`);

    const credentials = TEST_CREDENTIALS[userKey];
    if (!credentials) {
        throw new Error(`Invalid test user: ${userKey}. Available: ${Object.keys(TEST_CREDENTIALS).join(', ')}`);
    }

    try {
        // Attempt real authentication
        const userData = await authService.login(credentials.username, credentials.password);

        console.log(`✅ Real login successful for ${userData.name || userData.username} (${userData.email})`);
        console.log(`   - User ID: ${userData.id}`);
        console.log(`   - Email: ${userData.email}`);
        console.log(`   - Token: ${userData.token ? 'Present' : 'Missing'}`);

        return userData;
    } catch (error) {
        console.log(`❌ Real login failed: ${error.message}`);
        console.log(`🎭 Falling back to mock session...`);

        // Fallback to mock if real auth fails
        return mockLogin(userKey);
    }
}

/**
 * Mock login fallback (same as before)
 * @param {string} userKey - Key from MOCK_USERS object
 * @returns {Object} Mock user data
 */
function mockLogin(userKey = 'user1') {
    console.log(`🎭 Creating mock session for: ${userKey}`);

    const userData = MOCK_USERS[userKey];
    if (!userData) {
        throw new Error(`Invalid mock user: ${userKey}. Available: ${Object.keys(MOCK_USERS).join(', ')}`);
    }

    // Set mock session
    sessionManager.setSession(userData);

    console.log(`✅ Mock session created for ${userData.name} (${userData.email})`);
    console.log(`   - User ID: ${userData.id}`);
    console.log(`   - Role: ${userData.role}`);

    return userData;
}

/**
 * Logout using real auth service
 */
async function realLogout() {
    console.log('🚪 Logging out current user...');

    try {
        await authService.logout();
        console.log('✅ Real logout successful');
    } catch (error) {
        console.log(`⚠️ Logout error: ${error.message}`);
        // Ensure session is cleared even if backend logout fails
        sessionManager.clearSession();
        console.log('✅ Session cleared locally');
    }
}

/**
 * Test real authentication with all test users
 */
async function testRealAuthentication() {
    console.log('🔑 Testing Real Authentication...\n');

    // Test each user login
    for (const [userKey, credentials] of Object.entries(TEST_CREDENTIALS)) {
        console.log(`Testing real authentication for ${userKey}:`);

        try {
            // Attempt real login
            const loginResult = await realLogin(userKey);

            // Verify session
            const currentUser = sessionManager.getUser();
            const isLoggedIn = sessionManager.isLoggedIn();
            const token = sessionManager.getToken();

            console.log(`  ✅ Session created: ${isLoggedIn}`);
            console.log(`  ✅ User data: ${currentUser?.name}`);
            console.log(`  ✅ Token present: ${!!token}`);
            console.log(`  ✅ User ID: ${currentUser?.id}`);

            // Test profile utils with this user
            try {
                const profile = await profileUtils.getCurrentUserProfile();
                console.log(`  ✅ Profile loaded: ${profile.username} (${profile.email})`);
                console.log(`  ✅ Posts: ${profile.postsCount}, Comments: ${profile.commentsCount}, Reputation: ${profile.reputationScore}`);
            } catch (profileError) {
                console.log(`  ⚠️ Profile error: ${profileError.message}`);
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }

        // Logout
        await realLogout();
        console.log('');
    }
}

/**
 * Register a new test user (for testing registration)
 */
async function registerTestUser() {
    console.log('📝 Testing User Registration...\n');

    const timestamp = Date.now();
    const testUser = {
        username: `testuser_${timestamp}`,
        email: `testuser_${timestamp}@pup.edu.ph`,
        password: 'TestPassword123!',
        role: 'student',
        student_id: `2024-${timestamp.toString().slice(-5)}`
    };

    try {
        console.log('Attempting to register:', testUser.username);

        const registrationResult = await authService.register(testUser);

        console.log('✅ Registration successful!');
        console.log(`   - Username: ${registrationResult.name || registrationResult.username}`);
        console.log(`   - Email: ${registrationResult.email}`);
        console.log(`   - Auto-logged in: ${!!registrationResult.token}`);

        if (registrationResult.token) {
            // Test profile functionality with new user
            try {
                const profile = await profileUtils.getCurrentUserProfile();
                console.log(`   - Profile loaded: ${profile.username}`);
            } catch (profileError) {
                console.log(`   ⚠️ Profile error: ${profileError.message}`);
            }

            // Logout the new user
            await realLogout();
        }

        return registrationResult;

    } catch (error) {
        console.log('❌ Registration failed:', error.message);
        throw error;
    }
}

// Test function to demonstrate usage
async function testProfileUtils() {
    console.log('🧪 Testing ProfileUtils functionality...\n');

    try {
        // First, ensure we have a logged-in user for testing
        const currentUser = sessionManager.getUser();
        if (!currentUser) {
            console.log('⚠️ No user logged in, attempting real login first...');
            await realLogin('user1');
        }

        // Test 1: Get current user profile (requires login)
        console.log('1️⃣ Testing getCurrentUserProfile():');
        try {
            const currentProfile = await profileUtils.getCurrentUserProfile();
            console.log('✅ Current user profile:', currentProfile);
            console.log(`   - Username: ${currentProfile.username}`);
            console.log(`   - Email: ${currentProfile.email}`);
            console.log(`   - User ID: ${currentProfile.userId}`);
            console.log(`   - Posts: ${currentProfile.postsCount}`);
            console.log(`   - Comments: ${currentProfile.commentsCount}`);
            console.log(`   - Reputation: ${currentProfile.reputationScore}`);
        } catch (error) {
            console.log('❌ Error getting current user profile:', error.message);
        }
        console.log('');

        // Test 2: Get user posts for current user
        console.log('2️⃣ Testing getUserPosts() for current user:');
        try {
            const loggedUser = sessionManager.getUser();
            if (loggedUser) {
                const userPosts = await profileUtils.getUserPosts(loggedUser.id);
                console.log(`✅ Found ${userPosts.length} posts for current user`);
                if (userPosts.length > 0) {
                    console.log('   - Sample post:', userPosts[0].title);
                } else {
                    console.log('   - No posts found (this is normal for new test users)');
                }
            } else {
                console.log('❌ No current user logged in');
            }
        } catch (error) {
            console.log('❌ Error getting user posts:', error.message);
        }
        console.log('');

        // Test 3: Get user statistics
        console.log('3️⃣ Testing getUserStatistics():');
        try {
            const loggedUser = sessionManager.getUser();
            if (loggedUser) {
                const stats = await profileUtils.getUserStatistics(loggedUser.id);
                console.log('✅ User statistics:', stats);
            } else {
                console.log('❌ No current user logged in');
            }
        } catch (error) {
            console.log('❌ Error getting user statistics:', error.message);
        }
        console.log('');

        // Test 4: Test getUserProfile with dummy user ID
        console.log('4️⃣ Testing getUserProfile() with dummy ID:');
        try {
            const dummyProfile = await profileUtils.getUserProfile('dummy-user-id');
            if (dummyProfile) {
                console.log('✅ Dummy user profile:', dummyProfile);
            } else {
                console.log('✅ Dummy user profile: null (user not found - expected)');
            }
        } catch (error) {
            console.log('❌ Error getting dummy user profile:', error.message);
        }
        console.log('');

        // Test 5: Test getUserProfileByUsername
        console.log('5️⃣ Testing getUserProfileByUsername():');
        try {
            const loggedUser = sessionManager.getUser();
            if (loggedUser) {
                const profileByUsername = await profileUtils.getUserProfileByUsername(loggedUser.name);
                console.log('✅ Profile by username:', profileByUsername?.username || 'null');
            } else {
                console.log('❌ No current user logged in');
            }
        } catch (error) {
            console.log('❌ Error getting profile by username:', error.message);
        }
        console.log('');

        // Test 6: Test methods that should fail (no backend support)
        console.log('6️⃣ Testing unsupported methods:');
        try {
            await profileUtils.searchUsers('test');
        } catch (error) {
            console.log('✅ Expected error for searchUsers:', error.message);
        }

        try {
            await profileUtils.updateUserProfile('test-id', { username: 'new-name' });
        } catch (error) {
            console.log('✅ Expected error for updateUserProfile:', error.message);
        }

    } catch (error) {
        console.error('💥 Unexpected error during testing:', error);
    }
}

// Test session manager integration
function testSessionManager() {
    console.log('🔐 Testing Session Manager integration:');

    const currentUser = sessionManager.getUser();
    const isLoggedIn = sessionManager.isLoggedIn();
    const token = sessionManager.getToken();

    console.log('- Is logged in:', isLoggedIn);
    console.log('- Current user:', currentUser);
    console.log('- Has token:', !!token);

    if (currentUser) {
        console.log('- User details:');
        console.log(`  * ID: ${currentUser.id}`);
        console.log(`  * Name: ${currentUser.name}`);
        console.log(`  * Email: ${currentUser.email}`);
        console.log(`  * Token: ${currentUser.token?.substring(0, 20)}...`);
    }
    console.log('');
}

/**
 * Test switching between different real users
 */
async function testUserSwitching() {
    console.log('🔄 Testing Real User Switching...\n');

    const userKeys = Object.keys(TEST_CREDENTIALS);

    for (const userKey of userKeys) {
        console.log(`Switching to ${userKey}:`);

        try {
            // Login as this user
            await realLogin(userKey);

            // Test profile functionality
            const profile = await profileUtils.getCurrentUserProfile();
            console.log(`  ✅ Profile: ${profile.username} (${profile.email})`);

            // Test statistics
            const stats = await profileUtils.getUserStatistics(profile.userId);
            console.log(`  ✅ Stats: ${stats.postsCount} posts, ${stats.commentsCount} comments, ${stats.reputationScore} reputation`);

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }

        console.log('');
    }

    // Logout at the end
    await realLogout();
}

// Comprehensive test suite
async function runFullTestSuite() {
    console.log('🚀 Running Full ProfileUtils Test Suite with Real Authentication\n');
    console.log('='.repeat(70));

    // Test 0: Real authentication
    console.log('🔑 Phase 1: Testing Real Authentication');
    await testRealAuthentication();

    console.log('='.repeat(70));
    console.log('📝 Phase 2: Testing User Registration');

    try {
        await registerTestUser();
    } catch (error) {
        console.log('⚠️ Registration test failed (this is OK if user already exists)');
    }

    console.log('='.repeat(70));
    console.log('🔐 Phase 3: Session Manager Testing');

    // Login as default user for further tests
    await realLogin('user1');
    testSessionManager();

    console.log('='.repeat(70));
    console.log('🧪 Phase 4: ProfileUtils Testing');

    // Test ProfileUtils functionality
    await testProfileUtils();

    console.log('='.repeat(70));
    console.log('🔄 Phase 5: User Switching Tests');

    // Test user switching
    await testUserSwitching();

    console.log('='.repeat(70));
    console.log('✅ Test suite completed!');
    console.log('💡 Available test credentials:', Object.keys(TEST_CREDENTIALS).join(', '));
    console.log('💡 Use realLogin(userKey) to login with real auth');
    console.log('💡 Use mockLogin(userKey) for mock sessions');
    console.log('💡 Use realLogout() to logout');
    console.log('💡 Use registerTestUser() to create new test user');
}

// Export test functions for use in browser console or other files
window.testProfileUtils = {
    // Real authentication functions
    realLogin,
    realLogout,
    testRealAuthentication,
    registerTestUser,

    // Mock authentication functions
    mockLogin,
    testProfileUtils,
    testSessionManager,

    // Main test functions
    runFullTestSuite,
    testUserSwitching,

    // Utility functions
    getCurrentStatus: () => {
        const session = sessionManager.getUser();
        if (session) {
            return `Logged in as: ${session.name} (${session.email})`;
        }
        return 'Not logged in';
    },

    // Access to instances and test data
    profileUtils,
    sessionManager,
    TEST_CREDENTIALS,
    MOCK_USERS
};

// Auto-run information and setup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 ProfileUtils test functions loaded!');
        console.log('📋 Available functions:');
        console.log('   - window.testProfileUtils.runFullTestSuite() - Complete test suite with real auth');
        console.log('   - window.testProfileUtils.realLogin(userKey) - Real backend authentication');
        console.log('   - window.testProfileUtils.mockLogin(userKey) - Mock session for testing');
        console.log('   - window.testProfileUtils.realLogout() - Logout current user');
        console.log('   - window.testProfileUtils.testUserSwitching() - Test all users');
        console.log('   - window.testProfileUtils.registerTestUser() - Register new test user');
        console.log('👥 Available test credentials:', Object.keys(TEST_CREDENTIALS).join(', '));
        console.log('🎭 Available mock users:', Object.keys(MOCK_USERS).join(', '));
        console.log('\n🚀 Quick start: window.testProfileUtils.runFullTestSuite()');
        console.log('🔑 Real auth example: window.testProfileUtils.realLogin("user1")');
    });
} else {
    console.log('🧪 ProfileUtils test functions loaded!');
    console.log('📋 Available functions:');
    console.log('   - window.testProfileUtils.runFullTestSuite() - Complete test suite with real auth');
    console.log('   - window.testProfileUtils.realLogin(userKey) - Real backend authentication');
    console.log('   - window.testProfileUtils.mockLogin(userKey) - Mock session for testing');
    console.log('   - window.testProfileUtils.realLogout() - Logout current user');
    console.log('   - window.testProfileUtils.testUserSwitching() - Test all users');
    console.log('   - window.testProfileUtils.registerTestUser() - Register new test user');
    console.log('👥 Available test credentials:', Object.keys(TEST_CREDENTIALS).join(', '));
    console.log('🎭 Available mock users:', Object.keys(MOCK_USERS).join(', '));
    console.log('\n🚀 Quick start: window.testProfileUtils.runFullTestSuite()');
    console.log('🔑 Real auth example: window.testProfileUtils.realLogin("user1")');
}
