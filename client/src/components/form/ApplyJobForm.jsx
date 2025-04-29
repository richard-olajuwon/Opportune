import FormInput from "./FormInput"

const ApplyJobForm = ({ formData, handleChange, handleFileChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <FormInput
          value = {formData.firstName}
          name = "firstName"
          label = "First Name"
          type = "text"
          onChange = {handleChange}
          disabled={formData.firstName !== ''}
          required
        />

        <FormInput
          value = {formData.lastName}
          name = "lastName"
          label = "Last Name"
          type = "text"
          onChange = {handleChange}
          disabled={formData.lastName !== ''}
          required
        />
      </div>

      <div className="flex flex-row gap-2">
        <FormInput
          value = {formData.email}
          name = "email"
          label = "Email"
          type = "email"
          onChange = {handleChange}
          disabled={formData.email !== ''}
          required
        />

        <FormInput
          value = {formData.phone}
          name = "phone"
          label = "Phone"
          type = "tel"
          onChange = {handleChange}
          required
          maxLength={20}
        />
      </div>

      <FormInput
        value = {formData.location}
        name = "location"
        label = "Location"
        type = "text"
        onChange = {handleChange}
        required
      />

      <FormInput
        value = {formData.portfolio}
        name = "portfolio"
        label = "Portfolio / LinkedIn"
        type = "url"
        onChange = {handleChange}
        required
      />

      <FormInput
        //value = {formData.resume}
        name = "resume"
        label = "Resume"
        type = "file"
        onChange = {handleFileChange}
        required
      />
    </div>
  )
}

export default ApplyJobForm
