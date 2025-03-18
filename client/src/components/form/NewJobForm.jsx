import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import FormTextArea from "./FormTextArea";

const NewJobForm = ({ formData, handleSubmit, handleChange }) => {
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];
  const jobTypes = ["Full-time", "Part-time", "Internship"];

  return (
    <form
      type="submit"
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <FormInput
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
      />

      <FormInput
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
      />

      <FormInput
        label="Application URL"
        name="applicationUrl"
        value={formData.applicationUrl}
        onChange={handleChange}
      />

      <FormSelect
        label="Type"
        name="employmentType"
        options={jobTypes}
        value={formData.employmentType}
        onChange={handleChange}
      />

      <FormSelect
        label="Experience Level"
        name="seniority"
        options={experienceLevels}
        value={formData.seniority}
        onChange={handleChange}
      />

      <FormInput
        label="Annual Salary"
        name="salary"
        value={formData.salary}
        onChange={handleChange}
      />

      <FormTextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
      />

      <FormTextArea
        label="Job Functions"
        name="tasks"
        value={formData.tasks}
        onChange={handleChange}
      />

      <FormTextArea
        label="Requirements"
        name="requirements"
        value={formData.requirements}
        onChange={handleChange}
      />
    </form>
  );
};

export default NewJobForm;
