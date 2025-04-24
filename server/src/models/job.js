const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  id: { type: String },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: { type: String, required: true },
  company: { type: String },
  location: { type: String },
  employmentType: { type: String },
  seniority: { type: String },
  description: { type: String },
  salary: { type: Number },
  datePosted: { type: Date },
  requirements: { type: [String] },
  tasks: { type: [String] },
  applicationUrl: {type: String},
  applicants: [{
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    resume: { type: String, required: true },
    phone: {type: String, default: ''},
    link: { type: String,default: '' },
    location: { type: String, default: ''}
  }],
  createdAt: { type: Date, default: Date.now }
})

jobSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Job', jobSchema)
