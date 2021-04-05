import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { Public } from '../decorators/public.decorator';
import { User } from '../decorators/user.decorator';
import { LocalAgentGuard, LocalGuard } from '../guards/local.guard';
import { SIGN_IN_SCHEMA } from '../schemas/signin.schema';
import { AuthService } from '../services/auth.service';
import * as j2s from 'joi-to-swagger';
import {
  ApiBody,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signin')
  @Public()
  @UseGuards(LocalGuard)
  @ApiBody({
    schema: j2s.default(SIGN_IN_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Autenticar usuario',
  })
  @ApiUnauthorizedResponse({
    description: 'Fallo',
  })
  @ApiCreatedResponse({
    description: 'Correcto',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
        },
      },
    },
  })
  async signin(
    @Body(new JoiPipe(SIGN_IN_SCHEMA)) { username, password },
    @User() user: object,
  ) {
    return await this.auth.login(user);
  }

  @Post('signin/agent')
  @Public()
  @UseGuards(LocalAgentGuard)
  @ApiBody({
    schema: j2s.default(SIGN_IN_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Autenticar agente',
  })
  @ApiUnauthorizedResponse({
    description: 'Fallo',
  })
  @ApiCreatedResponse({
    description: 'Correcto',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
        },
      },
    },
  })
  async signinAgent(
    @Body(new JoiPipe(SIGN_IN_SCHEMA)) { username, password },
    @User() user: object,
  ) {
    return await this.auth.login(user);
  }
}
