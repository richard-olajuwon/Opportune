import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import jobService from "../../services/jobs";

const Applicants = () => {
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [jobApplicants, setJobApplicants] = useState(null);
    const {id} = useParams();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const fetchedJob = await jobService.getOneJob(id);
                setJob(fetchedJob);
                setJobApplicants(fetchedJob.applicants);
            
            } catch (error) {
                console.error("Failed to fetch job:", error);
                setJob([]);
            }
        };

        fetchJob();
        
    }, [id])

    if(!job || !jobApplicants){
        return <div>Loading...</div>
    }

    if(user.profile.id !== job.company_id){
        setJobApplicants([])
    }

    if(jobApplicants.length === 0){
        return <h2>No Applicant for this Job Yet, Check back later</h2>
    }

    return(
        <div className="text-start">
            <section className="p-6">
                <h1 className="mb-8 text-4xl font-bold">Applicants</h1>
                {
                    user.profile.id === job.company_id && (
                        jobApplicants.map((jobApplicant) => {
                            return(
                                <div className="p-2 mb-2.5 font-bold text-lg border border-gray-300 rounded-[10px]">
                                    <p>Full Name: {jobApplicant.firstName + ' ' + jobApplicant.lastName}</p>
                                    <p>Email: {jobApplicant.email}</p>
                                    <p>Portfolio / LinkedIn: 
                                        <a href={jobApplicant.link ? jobApplicant.link : 'https://google.com'} 
                                        className="text-blue-500 hover:text-blue-700"
                                        target="_blank" rel="noopener noreferrer">
                                            {jobApplicant.link ? " " + jobApplicant.link : ' Not Provided'}
                                        </a>
                                    </p>
                                    <p>Phone: {jobApplicant.phone ? jobApplicant.phone : 'Not Provided'}</p>
                                    <p>Location: {jobApplicant.location ? jobApplicant.location : 'Not Provided'}</p>
                                    <a href={jobApplicant.resume} target="_blank" rel="noopener noreferrer">
                                        <button 
                                        className="btn mt-2 text-white bg-gray-500 hover:bg-gray-800">View Resume</button>
                                    </a>
                                </div>
                            )
                        })
                    )
                }
            </section>
        </div>
    )
}

export default Applicants;