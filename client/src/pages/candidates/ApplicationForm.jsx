import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import jobService from "../../services/jobs"
import { useAuth } from "../../context/AuthContext"
import ApplyJobForm from "../../components/form/ApplyJobForm"
import { useNotificationContext } from "../../context/NotificationContext";

// TODO: 
// - [] Create company questions for the application form
// - [] Create a way to add questions to the application form
// - [] Track application status (applied, reviewed, rejected, etc.)

const ApplicationForm = () => {
  const navigate = useNavigate()
  const [, dispatchNotification] = useNotificationContext();
  const { user } = useAuth()
  const { id } = useParams()
  const [ job, setJob ] = useState('')
  const [loading, setLoading] = useState(false)
  const [ formData, setFormData ] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    portfolio: '',
    resume: null
  })

  useEffect(() => {
    const fetchJob = async () => {
      const job = await jobService.getOneJob(id)
      setJob(job)
    }
    fetchJob()
  }
  , [id])

  useEffect(() => {
    if (user && user.profile) {
      setFormData({
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        email: user.email,
        // Add more fields here...
      })
    }
  }, [user])

  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle file input change
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (in bytes)

    if(files[0] && files[0].size > MAX_FILE_SIZE){
      alert("File is too large! Max size is 2MB.");
      e.target.value = '';
    }

    if(files.length !== 0){
      setFormData({
        ...formData,
        [name]: files[0], // Only store the first selected file
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {

      setLoading(true)
      const jobApplicationResponse = await jobService.applyToJob(id, formData, user.token)

      if(jobApplicationResponse.success !== false){

        dispatchNotification({
          type: "SHOW_NOTIFICATION",
          payload: `Application Successful`,
        });

        navigate(`/jobs/${id}`)
      }
      else{

        setLoading(false)

        dispatchNotification({
          type: "SHOW_NOTIFICATION",
          payload: `${jobApplicationResponse.error}`,
        });
      }

    } catch (error) {
      setLoading(false)

      dispatchNotification({
        type: "SHOW_NOTIFICATION",
        payload: `Error Applying to Job`,
      });
    }
  }

  return (
    <div className="mb-6 px-8">
      <h3 className="m-8 text-2xl font-bold">Apply to {job.title} at {job.company}</h3>
      <form onSubmit={handleSubmit}>
        <ApplyJobForm formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} />
        
        <div className="mt-6 flex justify-end">
          <button 
            type="button" 
            className="btn mr-2" 
            onClick={() => navigate(`/jobs/${id}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Applying' : 'Apply'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApplicationForm
