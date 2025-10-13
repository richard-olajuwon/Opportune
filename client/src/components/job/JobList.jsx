import { Link } from "react-router-dom";
import Card from "./Card";
import { useAuth } from "../../context/AuthContext";
import loadingIcon from "../../assets/icons/loading-icon.gif";

const JobList = ({
  jobs,
  pageTitle,
  searchTerm,
  handleSearch,
  jobsLoading = true,
}) => {
  const { user } = useAuth();

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="px-8">
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-4xl font-bold">{pageTitle}</h2>
        {user && user.role === "company" && (
          <Link to="/new">
            <button className="btn">Create a JobPost</button>
          </Link>
        )}
      </div>

      <form>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search jobs..."
          className="mt-6 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {jobsLoading ? (
          <div className={`${window.innerWidth > 800 ? 'w-screen' : 'w-full'} mt-8 flex justify-center`}><img className="w-10 h-10" src={loadingIcon} alt="loading icon" /></div>
        ) : (
          filteredJobs.map((job) => <Card key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
};

export default JobList;
