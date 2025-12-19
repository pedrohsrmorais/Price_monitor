# worker_pm/tasks.py

from services.job_runner import JobRunner

def run_scraper(job_id: int):
    JobRunner().run(job_id)
