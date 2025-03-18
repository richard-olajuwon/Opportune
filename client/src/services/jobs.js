import axios from "axios";

const baseUrl = "http://localhost:5000/api/jobs";

const getJobs = async () => {
  try {
    const response = await axios.get(baseUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

const getOneJob = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/${id}`);
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
    const response = await axios.get(`${baseUrl}/myjobs`, config)
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
    const response = await axios.post(baseUrl, newJob, config);

    return response.data;
  } 
  catch (error) {
    console.log("Error posting data:", error.response.data.error);
    return{success: false, error: error.reponse.data.error}
  }
};

const updateJob = async (id, updatedJob, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const response = axios.put(`${baseUrl}/${id}`, updatedJob, config);
    return response.data;
  } catch (error) {
    console.log("Error updating data:", error);
  }
};

// Pass in token to delete job
const deleteJob = async (id, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = axios.delete(`${baseUrl}/${id}`, config);
    return response.data;
  } catch (error) {
    console.log("Error deleting data:", error);
  }
};

export default { getJobs, getOneJob, createJob, updateJob, deleteJob, getMyJobs };
