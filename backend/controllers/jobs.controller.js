import { getJobs } from "../services/jobs.service.js";

export async function listJobs(req, res) {
  const jobs = await getJobs(req.user.id);
  res.json(jobs);
}
