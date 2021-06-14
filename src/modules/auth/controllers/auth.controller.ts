import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { Public } from '../decorators/public.decorator';
import { User } from '../decorators/user.decorator';
import {
  LocalAgentGuard,
  LocalGuard,
  LocalTechGuard,
} from '../guards/local.guard';
import { SIGN_IN_SCHEMA, USER_INFO_SCHEMA } from '../schemas/signin.schema';
import { AuthService } from '../services/auth.service';
import * as j2s from 'joi-to-swagger';
import {
  ApiBody,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiTags('Auth')
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

  @ApiTags('Auth')
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

  @ApiTags('Auth')
  @Post('signin/tech')
  @Public()
  @UseGuards(LocalTechGuard)
  @ApiBody({
    schema: j2s.default(SIGN_IN_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Autenticar tecnico',
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
  async signinTechnichian(
    @Body(new JoiPipe(SIGN_IN_SCHEMA)) { username, password },
    @User() user: object,
  ) {
    return await this.auth.login(user);
  }

  @ApiTags('Auth')
  @ApiOperation({ summary: 'Devuelve la informacion de un usuario' })
  @ApiOkResponse({
    schema: j2s.default(USER_INFO_SCHEMA).swagger,
  })
  @Get('user_info')
  async userFuncs(@Req() { user }: any) {
    return user;
  }
}
