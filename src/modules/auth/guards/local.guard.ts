import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalGuard extends AuthGuard('local') {}

@Injectable()
export class LocalAgentGuard extends AuthGuard('agent') {}

@Injectable()
export class LocalTechGuard extends AuthGuard('tech') {}
