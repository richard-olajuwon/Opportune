const jobsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Job = require('../models/job')
const { User, Company, Candidate } = require('../models/user')
const { getTokenFrom } = require('../lib/utils')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Initialize the S3 client with AWS SDK v3
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const allowedFileTypes = [
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File filter to check MIME type
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Invalid file type'), false);  // Reject the file
  }
};

// Setting up multer to save files temporarily in the 'uploads' directory
const upload = multer({
  dest: 'uploads/',
  fileFilter: fileFilter
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
  const {
    title, 
    location, 
    applicationUrl, 
    employmentType, 
    seniority, 
    salary, 
    description, 
    tasks, 
    requirements,
    datePosted
 } = req.body  

  let tasksList;
  let requirementsList;

  if(!title || title.trim() === ''){
    return res.status(400).json({error: 'Job Title is required'})
  }
  else if(!employmentType || employmentType.trim() === ''){
    return res.status(400).json({error: 'Employment type is required'})
  }
  else if(!seniority || seniority.trim() === ''){
    return res.status(400).json({error: 'Job Seniority is required'})
  }

  if(tasks && tasks.trim() !== ''){
    tasksList = tasks.split('\n').filter(Boolean);
  }

  if(requirements && requirements.trim() !== ''){
    requirementsList = requirements.split('\n').filter(Boolean);
  }

  function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
  }

  if(applicationUrl !== '' && !isValidURL(applicationUrl)){
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

    title: title,
    location: location,
    employmentType: employmentType,
    seniority: seniority,
    description: description,
    salary: salary,
    datePosted: datePosted,
    requirements: requirementsList,
    tasks: tasksList,
    applicationUrl: applicationUrl
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

jobsRouter.put('/:id', async (req, res) => {
  const {
    title, 
    location, 
    applicationUrl, 
    employmentType, 
    seniority, 
    salary, 
    description, 
    tasks, 
    requirements
  } = req.body

  const jobId = req.params.id

  if(!title || (title).trim() === ''){
    return res.status(400).json({error: 'Job Title is required'})
  }
  else if(!employmentType || (employmentType).trim() === ''){
    return res.status(400).json({error: 'Employment type is required'})
  }
  else if(!seniority || (seniority).trim() === ''){
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

  if(applicationUrl !== '' && !isValidURL(applicationUrl)){
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
    title: title,
    location: location,
    employmentType: employmentType,
    seniority: seniority,
    description: description,
    salary: salary,
    requirements: requirements,
    tasks: tasks,
    applicationUrl: applicationUrl
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

jobsRouter.post('/apply/:id', upload.single('resume'), async(req, res) => {

  const body = req.body
  const jobId = req.params.id

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or Invalid' })
  }

  const resume = req.file;  // Path to the temporary file (Uploaded Resume)  


  try {

    if (!resume) {
      return res.status(400).json({error: 'No resume uploaded'});
    }
  
    const resumeContent = fs.readFileSync(resume.path);
    const resumeName = resume.originalname;
    const bucketName = 'webst-images';  // Replace with your S3 bucket name

    let contentType = 'application/octet-stream';  // Default content type
    
    // Detect content type based on file extension
    switch (path.extname(resumeName).toLowerCase()) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        return res.status(400).send('Unsupported file type');
    }
  
    const params = {
      Bucket: bucketName,
      Key: `resumes/${Date.now()}-${resumeName}`,  // Optional path within the bucket
      Body: resumeContent,
      ContentType: contentType,
    };

    const user = await User.findById(decodedToken.id);

    if(user.role !== 'candidate'){
      return res.status(401).json({error: 'Only Candidates can apply for jobs'});
    }

    const alreadyApplied = await Candidate.findOne({_id: user.candidate_id, 'applications': jobId})

    if(alreadyApplied){
      return res.status(401).json({error: 'You already applied for this job'})
    }

    // Upload the file to S3
    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Return the S3 URL of the uploaded file
    const resumeUrl = `https://${bucketName}.s3.amazonaws.com/${params.Key}`;
    

    const applicantInfo = {
      applicantId: user._id,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      resume: resumeUrl,
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

    res.status(200).end();

  } catch (error) {
    console.error('Error Applying to Job', error);
    
    res.status(500).json({error: 'Internal Server Error'});
  } finally {
    // Clean up temporary file
    fs.unlinkSync(resume.path);
  }
})

module.exports = jobsRouter