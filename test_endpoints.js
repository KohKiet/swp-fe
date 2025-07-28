// Test file for session-based quiz endpoints
// Run with: node test_endpoints.js

const axios = require("axios");

const BASE_URL = "http://localhost:5150/api";
const TEST_QUIZ_ID = "test-quiz-id"; // Replace with actual quiz ID
const TEST_SESSION_ID = "test-session-id"; // Will be generated

// Mock authentication token (replace with actual token)
const AUTH_TOKEN = "your-auth-token-here";

const headers = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

async function testQuizEndpoints() {
  console.log("🧪 Testing Session-Based Quiz Endpoints\n");

  try {
    // Test 1: Start Quiz Session
    console.log("1. Testing Start Quiz Session...");
    const startSessionResponse = await axios.get(
      `${BASE_URL}/Quiz/${TEST_QUIZ_ID}/start`,
      { headers }
    );
    console.log(
      "✅ Start Session Response:",
      startSessionResponse.data
    );

    const sessionId = startSessionResponse.data.data?.sessionId;
    if (!sessionId) {
      throw new Error("No session ID returned");
    }
    console.log(`📝 Session ID: ${sessionId}\n`);

    // Test 2: Get Quiz Session Status
    console.log("2. Testing Quiz Session Status...");
    const statusResponse = await axios.get(
      `${BASE_URL}/Quiz/${TEST_QUIZ_ID}/session/status`,
      { headers }
    );
    console.log(
      "✅ Session Status Response:",
      statusResponse.data,
      "\n"
    );

    // Test 3: Submit Quiz with Session
    console.log("3. Testing Quiz Submission with Session...");
    const submitData = {
      quizId: TEST_QUIZ_ID,
      sessionId: sessionId,
      userAnswers: [
        {
          questionId: "question-1",
          answerId: "answer-1",
          isSelected: true,
        },
      ],
      timeSpentMinutes: 15,
      notes: "Test submission",
    };

    const submitResponse = await axios.post(
      `${BASE_URL}/Question/submit`,
      submitData,
      { headers }
    );
    console.log("✅ Submit Response:", submitResponse.data, "\n");

    // Test 4: Check if course was auto-completed
    console.log("4. Testing Course Auto-Completion...");
    if (submitResponse.data.data?.isPassed) {
      console.log(
        "🎉 Quiz passed! Course should be auto-completed by backend."
      );
    } else {
      console.log("❌ Quiz failed. Course not completed.");
    }
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response?.data || error.message
    );

    // Handle specific errors
    if (error.response?.status === 500) {
      console.log(
        "💡 Backend server error. Check if backend is running."
      );
    } else if (error.response?.status === 401) {
      console.log("💡 Authentication error. Check your auth token.");
    } else if (error.response?.status === 404) {
      console.log("💡 Endpoint not found. Check API routes.");
    }
  }
}

async function testErrorHandling() {
  console.log("\n🧪 Testing Error Handling...\n");

  try {
    // Test expired session
    console.log("1. Testing Expired Session...");
    await axios.post(
      `${BASE_URL}/Question/submit`,
      {
        quizId: TEST_QUIZ_ID,
        sessionId: "expired-session-id",
        userAnswers: [],
        timeSpentMinutes: 30,
      },
      { headers }
    );
  } catch (error) {
    if (error.response?.data?.message?.includes("session")) {
      console.log("✅ Expired session handled correctly");
    } else {
      console.log("❌ Unexpected error for expired session");
    }
  }

  try {
    // Test invalid session
    console.log("2. Testing Invalid Session...");
    await axios.post(
      `${BASE_URL}/Question/submit`,
      {
        quizId: TEST_QUIZ_ID,
        sessionId: "invalid-session-id",
        userAnswers: [],
        timeSpentMinutes: 30,
      },
      { headers }
    );
  } catch (error) {
    if (error.response?.data?.message?.includes("Invalid")) {
      console.log("✅ Invalid session handled correctly");
    } else {
      console.log("❌ Unexpected error for invalid session");
    }
  }

  try {
    // Test missing session ID
    console.log("3. Testing Missing Session ID...");
    await axios.post(
      `${BASE_URL}/Question/submit`,
      {
        quizId: TEST_QUIZ_ID,
        userAnswers: [],
        timeSpentMinutes: 30,
      },
      { headers }
    );
  } catch (error) {
    if (error.response?.data?.message?.includes("session")) {
      console.log("✅ Missing session ID handled correctly");
    } else {
      console.log("❌ Unexpected error for missing session ID");
    }
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting Session-Based Quiz Tests\n");

  await testQuizEndpoints();
  await testErrorHandling();

  console.log("\n✅ All tests completed!");
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testQuizEndpoints,
  testErrorHandling,
  runTests,
};
