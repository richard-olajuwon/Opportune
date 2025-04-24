import axios from "axios";
import { baseUrl } from "../constants";

const getJobs = async () => {
  try {
    const response = await axios.get(`${baseUrl}/api/jobs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

const getOneJob = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/api/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job:", error);
  }
};

const getMyJobs = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  try {
    const response = await axios.get(`${baseUrl}/api/jobs/myjobs`, config)
    return response.data
  } catch (error) {
    console.error("Error fetching jobs", error)
  }
}

const createJob = async (newJob, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.post(`${baseUrl}/api/jobs`, newJob, config);

    return response.data;
  } 
  catch (error) {
    console.log("Error posting data:", error.response.data.error);
    return {success: false, error: error.response.data.error}
  }
};

const updateJob = async (id, updatedJob, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    const response = await axios.put(`${baseUrl}/api/jobs/${id}`, updatedJob, config);

    return response.data;

  } catch (error) {
    console.error("Error updating data:", error.response.data.error);
    return {success: false, error: error.response.data.error}
  }
};

// Pass in token to delete job
const deleteJob = async (id, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.delete(`${baseUrl}/api/jobs/${id}`, config);
    return response.data;
  } catch (error) {
    console.log("Error deleting data:", error);
  }
};

const applyToJob = async (id, applicantInfo, token) => {
  try {
    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    };
    const response = await axios.post(`${baseUrl}/api/jobs/apply/${id}`, applicantInfo, config);
    return response
  } catch (error) {
    return {success: false, error: error.response.data.error}
  }
}

export default { getJobs, getOneJob, createJob, updateJob, deleteJob, getMyJobs, applyToJob };
