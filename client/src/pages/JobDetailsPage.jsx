import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import jobService from "../services/jobs";

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const fetchedJob = await jobService.getOneJob(id);
        setJob(fetchedJob);
      } catch (error) {
        console.error("Failed to fetch job:", error);
        setJob(null);
      } finally {
        setLoading(false)
      }
    };

    fetchJob();
  }, [id]);

  if(loading){
    return(<div>Loading...</div>)
  }

  if (!job) {
    return <h1>Job not found</h1>;
  }
  

  return (
    <div className="text-start">
      <section className="mb-6 p-8">

        <div className="flex justify-between items-center mb-4">
          <div className="mb-4 flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{job.company}</p>
              <a href="#" className="text-blue-500 hover:underline">
                Follow
              </a>
            </div>
            <p className="text-sm text-gray-500">{job.datePosted.split("T")[0]}</p>
          </div>
          
          { user && user.role === 'company' && user.profile.id === job.company_id && (
            <button onClick={() => navigate(`/jobs/${id}/edit`)} className="btn">Edit</button>
          )}
        </div>


        <h1 className="mb-2 text-4xl font-bold">{job.title}</h1>

        <div className="mb-4 flex flex-row gap-2 text-gray-600">
          <p className="text-md">{job.location}</p>
          <span>|</span>
          <p className="text-md">{job.employmentType}</p>
          <span>|</span>
          <p className="text-md">{job.seniority}</p>
        </div>

        <p className="mb-6 text-lg">
          <strong>Salary:</strong> {job.salary} USD/Year
        </p>

        {user ? (user.role === 'candidate' && (
          job.applicationUrl === "" ? (
          // Render a button if job.applicationUrl is empty
          <button  
            onClick={() => navigate(`/jobs/${id}/apply`)}
            className="btn"
          >
            Easy Apply
          </button>
          ) : (
            // Render an 'a' tag with link to the job website if job.applicationUrl is not empty
            <a 
            href={`${job.applicationUrl}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn">Apply &gt;</a>
          )
          ) 
        ):(
          job.applicationUrl === "" ? (
            <Link to='/login'><button className="btn">Easy Apply</button></Link>
            ) : (
              <Link to='/login'><button className="btn">Apply &gt;</button></Link>
            )
        )          
        }
      </section>

      <section className="mb-6 px-8">
        {job.description && (
          <p className="mb-4 text-lg">
            <strong>Description:</strong> {job.description}
          </p>
        )}

        {job.requirements && (
          <div className="mb-4">
            <h2 className="mb-2 text-2xl font-semibold">
              Qualifications and Requirements
            </h2>
            <ul className="list-inside list-disc pl-5">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="mb-1 text-lg">
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.tasks && (
          <div>
            <h2 className="mb-2 text-2xl font-semibold">Job Functions</h2>
            <ul className="list-inside list-disc pl-5">
              {job.tasks.map((task, index) => (
                <li key={index} className="mb-1 text-lg">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(user && user.profile.id === job.company_id) && (
          <button  
          onClick={() => navigate(`/myjobs/${id}/applicants`)}
          className="btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-800 mt-2.5"
          > See Applicants
          </button>
        )}
      </section>
    </div>
  );
};

export default JobDetailsPage;
