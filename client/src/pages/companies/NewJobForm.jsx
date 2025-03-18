import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotificationContext } from "../../context/NotificationContext";
import jobService from "../../services/jobs";
import JobForm from "../../components/form/NewJobForm";
import FormActions from "../../components/form/FormActions";

const NewJobForm = () => {
  const { user } = useAuth();
  const [, dispatchNotification] = useNotificationContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    applicationUrl: "",
    employmentType: "Full-time",
    seniority: "Entry Level",
    salary: "",
    description: "",
    requirements: "",
    tasks: "",
    datePosted: new Date().toISOString(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user.token) {
      dispatchNotification({
        type: "SHOW_NOTIFICATION",
        payload: "You must be logged in to create a job post",
      });
    }
    
    try {
      const jobCreationResponse = await jobService.createJob(formData, user.token);
      if(jobCreationResponse.success !== false){
      dispatchNotification({
        type: "SHOW_NOTIFICATION",
        payload: `"${formData.title}" Job created successfully`,
      });
      navigate("/");
      }else{
        dispatchNotification({
          type: "SHOW_NOTIFICATION",
          payload: `Error Creating Job, Try Again`,
        });
        console.error("Error creating job:", error);
      }

    } catch (error) {
      dispatchNotification({
        type: "SHOW_NOTIFICATION",
        payload: `Error Creating Job`,
      });
      console.error("Error creating job:", error);
    }
  };

  return (
    <div className="mb-6 px-8">
      <h3 className="m-8 text-2xl font-bold">New Listing</h3>
      <JobForm 
        formData={formData} 
        handleChange={handleChange}
      />
      <FormActions 
        onSubmit={handleSubmit}
        formData={formData}
        submitText="Save"
        onCancel={() => navigate("/")}
      />
    </div>
  );
};

export default NewJobForm;
