const jobsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Job = require('../models/job')
const { User, Company, Candidate } = require('../models/user')
const { getTokenFrom } = require('../lib/utils')
const cloudinary = require("cloudinary");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Setting up multer to save files temporarily in the 'uploads' directory
const upload = multer({
  dest: 'uploads/'
});

jobsRouter.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find({})
    res.json(jobs)
  } catch (error) {
   console.log(error);
   res.status(500).json({ error: 'internal server error' })
  }
})

jobsRouter.get('/myjobs', async (req, res) => {
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  try{
    const user = await User.findById(decodedToken.id)

    if(user.role === 'company'){
      const company = await Company.findById(user.company_id)
      if (!company) {
        return res.status(404).json({ error: 'company not found' })
      }

      const jobs = await Job.find({ company_id: company._id })
      return res.json(jobs)
    }

    const candidate = await Candidate.findById(user.candidate_id)

    if (!candidate) {
      return res.status(404).json({ error: 'candidate not found' })
    }

    const appliedJobs = candidate.applications

    const jobs = await Job.find({_id: {$in: appliedJobs}})
    res.json(jobs)    

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'internal server error' })
  }
})

jobsRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const job = await Job.findById(id)
    res.json(job)
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: 'job post not found' })
  }
})  

jobsRouter.post('/', async (req, res) => {
  const body = req.body  

  if(!body.title || (body.title).trim() === ''){
    return res.status(400).json({error: 'Job Title is required'})
  }
  else if(!body.employmentType || (body.employmentType).trim() === ''){
    return res.status(400).json({error: 'Employment type is required'})
  }
  else if(!body.seniority || (body.seniority).trim() === ''){
    return res.status(400).json({error: 'Job Seniority is required'})
  }

  function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
  }

  if(body.applicationUrl !== '' && !isValidURL(body.applicationUrl)){
    return res.status(400).json({error: "Application URL must start with http:// or https://"})
  }

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (user.role !== 'company') {
    return res.status(401).json({ error: 'only companies can post jobs' })
  }

  const company = await Company.findById({ _id: user.company_id })
  if (!company) {
    return res.status(404).json({ error: 'company not found' })
  }

  const newJob = new Job({
    company_id: company._id, 
    company: company.name,

    title: body.title,
    location: body.location,
    employmentType: body.employmentType,
    seniority: body.seniority,
    description: body.description,
    salary: body.salary,
    datePosted: body.datePosted,
    requirements: body.requirements,
    tasks: body.tasks,
    applicationUrl: body.applicationUrl
  })

  try {
    const savedJob = await newJob.save()
    company.job_posts = company.job_posts.concat(savedJob._id)
    await company.save()
    res.json(savedJob)
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'internal server error' })
  }
})

jobsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (user.role !== 'company') {
    return res.status(403).json({ error: 'only companies can delete job posts' })
  }

  const company = await Company.findById({ _id: user.company_id })
  if (!company) {
    return res.status(404).json({ error: 'company not found' })
  }

  if (!company.job_posts.includes(id)) {
    return res.status(403).json({ error: 'you do not have permission to delete this job post' })
  }

  try {
    await Job.findByIdAndDelete(id)
    company.job_posts = company.job_posts.filter(jobId => jobId.toString() !== id)
    await company.save()
    res.status(204).end()
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'internal server error' })
  }
})

jobsRouter.put('/:id', async (req, res) => {
  const body = req.body
  const jobId = req.params.id

  if(!body.title || !body.location || !body.employmentType || !body.seniority){
    return res.status(400).json({error: 'Fill out all Job info before Submitting'})
  }

  function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
  }

  if(body.applicationUrl !== '' && !isValidURL(body.applicationUrl)){
    return res.status(400).json({error: "Application URL must start with http:// or https://"})
  }

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (user.role !== 'company') {
    return res.status(403).json({ error: 'only companies can edit job posts' })
  }

  const company = await Company.findById({ _id: user.company_id })
  if (!company) {
    return res.status(404).json({ error: 'company not found' })
  }

  const job = await Job.findById(jobId)
  if (!job) {
    return res.status(404).json({ error: 'job post not found' })
  }

  if (job.company_id.toString() !== company._id.toString()) {
    return res.status(403).json({ error: 'you do not have permission to edit this job post' })
  }

  const updatedJob = {
      title: body.title,
      location: body.location,
      employmentType: body.employmentType,
      seniority: body.seniority,
      description: body.description,
      salary: body.salary,
      requirements: body.requirements,
      tasks: body.tasks,
      applicationUrl: body.applicationUrl
    }

  try {
  const savedJob = await Job.findByIdAndUpdate(
    jobId, 
    { $set: updatedJob}, 
    { new: true }
  )
    res.json(savedJob)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'internal server error' })
  }
})

jobsRouter.post('/apply/:id', upload.single('resume'), async(req, res) => {

  const body = req.body
  const jobId = req.params.id

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or Invalid' })
  }

  try {

    const temporaryFilePath = req.file.path;  // Path to the temporary file (Uploaded Resume)  

    const user = await User.findById(decodedToken.id);

    if(user.role !== 'candidate'){
      return res.status(401).json({error: 'Only Candidates can apply for jobs'});
    }

    const alreadyApplied = await Candidate.findOne({_id: user.candidate_id, 'applications': jobId})

    if(alreadyApplied){
      return res.status(401).json({error: 'You already applied for this job'})
    }


    const resumeLink = await cloudinary.uploader.upload(temporaryFilePath, {
      resource_type: 'raw',  // This is important for non-image files like PDFs
    });
    

    const applicantInfo = {
      applicantId: user._id,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      resume: resumeLink.secure_url,
      phone: body.phone,
      link: body.portfolio,
      location: body.location
    }

    await Job.findByIdAndUpdate(
      jobId,
      { $push: { applicants: applicantInfo } },
      { new: true }
    )

    await Candidate.findByIdAndUpdate(
      user.candidate_id,
      {$push: { applications: jobId } },
      {new: true}
    )

    fs.unlink(temporaryFilePath, (err) => {
      if (err) {
        console.error('Error deleting temporary file:', err);
      } else {
        console.log('Temporary file deleted.');
      }
    });

    res.status(200).end();

  } catch (error) {
    console.error('Error Applying to Job', error);
    
    res.status(500).json({error: 'Internal Server Error'});
  }
})

module.exports = jobsRouter