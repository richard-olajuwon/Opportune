import axios from "axios";
import { baseUrl } from '../constants';

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${baseUrl}/api/users/login`, { email, password });
    const user = res.data;
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "/";
    return res.data;
  } catch (error) {
    console.error("Login failed:", error);
    return {success: false, error: error.response.data.error}
  }
};

export const signup = async (email, password, role, profileData) => {
  try {
    const res = await axios.post(`${baseUrl}/api/users/signup`, {
      email,
      password,
      role,
      profileData,
    });
    const user = res.data;
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "/";
    return res.data;
  } catch (error) {
    return {success: false, error: error.response.data.error}
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  window.location.reload();
};
