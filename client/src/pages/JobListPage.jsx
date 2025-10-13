import { useState, useEffect } from "react";
import { useJobContext } from "../context/JobContext";
import jobService from "../services/jobs";
import JobList from "../components/job/JobList";

const JobListPage = () => {
  const [{ jobs }, dispatch] = useJobContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    jobService
      .getJobs()
      .then((data) => { dispatch({ type: "SET_JOBS", payload: data }); setJobsLoading(false);  })
      .catch((error) => console.error("Error fetching jobs:", error));
  }, [dispatch]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <JobList
        jobsLoading={jobsLoading}
        jobs={jobs}
        pageTitle="All Jobs"
        searchTerm={searchTerm}
        handleSearch={handleSearch}
      />
    </>
  );
};

export default JobListPage;
