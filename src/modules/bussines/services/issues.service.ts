import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuesEntity } from '../entities/issues.entity';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
  ) {}

  async addIssue(username: string) {}
}
