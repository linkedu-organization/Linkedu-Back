import { Request, Response } from 'express';

import { jobService } from '../services/JobService';

class JobController {
  async runInatividadeJob(req: Request, res: Response) {
    await jobService.runInatividadeJob();
    return res.status(200).send();
  }
}

export const jobController = new JobController();
