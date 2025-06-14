// import React, { useState } from "react";

// const ApiTest = () => {
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const testAPI = async () => {
//     setLoading(true);
//     setResult(null);

//     try {
//       console.log("Testing API connection...");

//       const response = await // Test API connection
//       fetch("http://localhost:5150/api/Auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: "hohoanghai@gmail.com",
//           password: "123456",
//         }),
//       })
//         .then((response) => response.json())
//         .then((data) => console.log("Success:", data))
//         .catch((error) => console.error("Error:", error));

//       console.log("Response received:", response);
//       console.log("Response status:", response.status);
//       console.log("Response ok:", response.ok);

//       const data = await response.json();
//       console.log("Response data:", data);

//       setResult({
//         success: response.ok,
//         status: response.status,
//         data: data,
//       });
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setResult({
//         success: false,
//         error: error.message,
//         errorType: error.name,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const testSwagger = async () => {
//     setLoading(true);
//     setResult(null);

//     try {
//       console.log("Testing Swagger endpoint...");

//       const response = await fetch(
//         "http://localhost:5150/swagger/index.html"
//       );
//       console.log("Swagger response:", response.status);

//       setResult({
//         success: response.ok,
//         status: response.status,
//         message: `Swagger endpoint returned ${response.status}`,
//       });
//     } catch (error) {
//       console.error("Swagger test error:", error);
//       setResult({
//         success: false,
//         error: error.message,
//         errorType: error.name,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: "20px",
//         maxWidth: "600px",
//         margin: "0 auto",
//       }}>
//       <h2>API Connection Test</h2>

//       <div style={{ marginBottom: "20px" }}>
//         <button
//           onClick={testAPI}
//           disabled={loading}
//           style={{
//             padding: "10px 20px",
//             marginRight: "10px",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: loading ? "not-allowed" : "pointer",
//           }}>
//           {loading ? "Testing..." : "Test Login API"}
//         </button>

//         <button
//           onClick={testSwagger}
//           disabled={loading}
//           style={{
//             padding: "10px 20px",
//             backgroundColor: "#28a745",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: loading ? "not-allowed" : "pointer",
//           }}>
//           {loading ? "Testing..." : "Test Swagger"}
//         </button>
//       </div>

//       {result && (
//         <div
//           style={{
//             padding: "15px",
//             border: `2px solid ${
//               result.success ? "#28a745" : "#dc3545"
//             }`,
//             borderRadius: "4px",
//             backgroundColor: result.success ? "#d4edda" : "#f8d7da",
//           }}>
//           <h3>Test Result:</h3>
//           <pre
//             style={{
//               backgroundColor: "#f8f9fa",
//               padding: "10px",
//               borderRadius: "4px",
//               overflow: "auto",
//               fontSize: "14px",
//             }}>
//             {JSON.stringify(result, null, 2)}
//           </pre>
//         </div>
//       )}

//       <div
//         style={{
//           marginTop: "20px",
//           fontSize: "14px",
//           color: "#666",
//         }}>
//         <p>
//           <strong>Expected API URL:</strong>{" "}
//           http://localhost:5150/api/auth/login
//         </p>
//         <p>
//           <strong>Swagger URL:</strong>{" "}
//           http://localhost:5150/swagger/index.html
//         </p>
//         <p>Open browser developer tools (F12) to see console logs.</p>
//       </div>
//     </div>
//   );
// };

// export default ApiTest;

import React, { useState } from "react";

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5150/api/Auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "hohoanghai@gmail.com",
            password: "123456",
          }),
        }
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = { error: "Failed to parse JSON response" };
      }

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        errorType: error.name,
      });
    } finally {
      setLoading(false);
    }
  };

  const testSwagger = () => {
    window.open("http://localhost:5150/swagger/index.html", "_blank");
  };

  const testBackendHealth = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5150/health");
      const data = await response.text();

      setResult({
        success: response.ok,
        status: response.status,
        message: `Backend health check: ${response.status}`,
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        errorType: error.name,
        message: "Backend is not running or not accessible",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
      <h2>API Connection Test</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={testBackendHealth} disabled={loading}>
          Test Backend Health
        </button>
        <button onClick={testAPI} disabled={loading}>
          Test Login API
        </button>
        <button onClick={testSwagger} disabled={loading}>
          Open Swagger
        </button>
      </div>

      {result && (
        <pre style={{ backgroundColor: "#eee", padding: "10px" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ApiTest;
