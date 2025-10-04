// src/services/auth.header.js
export default function authHeader() {
    console.log("authHeader: Function called."); // Log when function is entered
  
    const userStr = localStorage.getItem("user");
    console.log("authHeader: Raw data from localStorage ('user'):", userStr); // See what was retrieved
  
    let user = null;
    if (userStr) {
      try {
          user = JSON.parse(userStr);
          console.log("authHeader: Parsed user object:", user); // See the parsed object
      } catch (e) {
          console.error("authHeader: Failed to parse user data from localStorage:", e);
          // If parsing fails, we definitely can't get the token
          return {};
      }
    } else {
        console.log("authHeader: No 'user' string found in localStorage.");
    }
  
    // Check if user exists AND has the accessToken property
    if (user && user.accessToken) {
      console.log("authHeader: User and accessToken FOUND. Returning Authorization header.");
      return { Authorization: 'Bearer ' + user.accessToken };
    } else {
      console.log("authHeader: User or accessToken NOT FOUND. Returning empty header object.");
      if (!user) {
          console.log("authHeader: Reason -> User object is null or undefined after check.");
      } else if (!user.accessToken) {
          // Log the actual keys if user exists but token doesn't
          console.log("authHeader: Reason -> User object exists, but 'accessToken' key is missing or falsy. User keys:", Object.keys(user));
      }
      return {}; // Return empty object, leading to 401
    }
  }