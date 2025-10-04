// src/services/auth.service.js
import axios from "axios";
import authHeader from './auth.header';

const API_URL = "http://localhost:8080/api/auth/";

const register = (username, password, role) => {
  console.log("AuthService: Attempting registration with", { username, role });
  // Ensure the payload matches your backend SignupRequest DTO

  // --- ADJUSTED PAYLOAD ---
  // Send role as a single string because backend expects String role
  return axios.post(API_URL + "signup", {
    username,
    password,
    role: role // Sending role as a single string
  })
  // --- END ADJUSTMENT ---

  .catch(error => {
      console.error("AuthService: Register API call failed:", error.response?.data || error.message || error);
      throw error;
  });
};

const login = (username, password) => {
  console.log("AuthService: Attempting login...");
  return axios
    .post(API_URL + "signin", { username, password })
    .then((response) => {
      console.log("AuthService: Received response data:", JSON.stringify(response.data, null, 2));
      console.log("AuthService: Checking for response.data.token:", response.data?.token);

      if (response.data && response.data.token) { // Check for 'token'
        console.log("AuthService: Token FOUND. Storing user data...");
        const userData = {
          accessToken: response.data.token, // Use 'token' from response, store as 'accessToken'
          id: response.data.id,
          username: response.data.username,
          roles: [response.data.role] // Store roles as array locally, even if backend sent single 'role' string in login response
        };
        console.log("AuthService: Storing userData:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("AuthService: localStorage.setItem should have been called.");
      } else {
        console.error("AuthService: token NOT FOUND in response.data. localStorage NOT set.");
      }
      return response.data;
    })
    .catch(error => {
      console.error("AuthService: Login API call failed:", error.response?.data || error.message || error);
      throw error;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          localStorage.removeItem("user"); // Clear corrupted data
          return null;
      }
  }
  return null;
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  authHeader
};

export default AuthService;