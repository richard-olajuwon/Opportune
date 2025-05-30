import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotificationContext } from "../../context/NotificationContext";
import jobService from "../../services/jobs";
import JobForm from "../../components/form/NewJobForm";
import FormActions from "../../components/form/FormActions";

const EditJobForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [, dispatchNotification] = useNotificationContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      const job = await jobService.getOneJob(id);
      setFormData(job);
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      const jobUpdateResponse = await jobService.updateJob(id, formData, user.token);
      
      if(jobUpdateResponse.success !== false){
        dispatchNotification({
          type: "SHOW_NOTIFICATION",
          payload: `"${formData.title}" Job updated successfully`,
        });
        navigate(`/jobs/${id}`);
      }
      else{
        dispatchNotification({
          type: "SHOW_NOTIFICATION",
          payload: `Error updating job: ${jobUpdateResponse.error}`,
        });
      }
    } catch (error) {
      dispatchNotification({
        type: "SHOW_NOTIFICATION",
        payload: `Error updating job: Try Again`,
      });
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Job</h1>
      <JobForm
        formData={formData}
        handleChange={handleChange}
      />
      <FormActions
        onSubmit={handleSubmit}
        formData={formData}
        submitText="Update Job"
        onCancel={() => navigate('/')}
      />
    </div>
  );
};

export default EditJobForm;