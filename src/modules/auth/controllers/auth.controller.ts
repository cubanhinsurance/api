import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import j2s from 'joi-to-swagger';
import {
  ApiBody,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SetAuthCookie } from '../decorators/login.decorator';
import { object, string } from 'joi';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('time')
  time() {
    return new Date();
  }

  @ApiTags('Auth')
  @Post('signin')
  @Public()
  @UseGuards(LocalGuard)
  @ApiBody({
    schema: j2s(SIGN_IN_SCHEMA).swagger,
  })
  @ApiOperation({
    summary: 'Autenticar usuario',
  })
  @ApiUnauthorizedResponse({
    description: 'Fallo',
  })
  @ApiForbiddenResponse({
    description: 'El usuario necesita confirmarse',
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
  @SetAuthCookie()
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
    schema: j2s(SIGN_IN_SCHEMA).swagger,
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
    schema: j2s(SIGN_IN_SCHEMA).swagger,
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
    schema: j2s(USER_INFO_SCHEMA).swagger,
  })
  @Get('user_info')
  async userFuncs(@Req() { user }: any) {
    return { ...user, licenses: await this.auth.userLicenses(user.username) };
  }

  @Get('confirmation')
  @ApiTags('Auth', 'Users')
  @ApiOperation({
    summary:
      'Enviar un correo de confirmacion con codigo secreto a un usuario autenticado',
  })
  async sendVerificationEmail2LoggedUser(@User('username') username) {
    return await this.auth.sendVerificationEmail(username);
  }

  @Post('confirmation')
  @ApiOperation({
    summary: 'Confirmar usuario autenticado',
  })
  @ApiTags('Auth', 'Users')
  @ApiBody({
    schema: j2s(
      object({
        code: string().required(),
      }),
    ).swagger,
  })
  async confirmVerificationCodeLoggedUser(
    @User('username') username: string,
    @Body(
      new JoiPipe(
        object({
          code: string().required(),
        }),
      ),
    )
    { code },
  ) {
    await this.auth.verifyUserConfirmationCode(username, code);
  }

  @Post('recovery')
  @ApiTags('Auth', 'Users')
  @ApiOperation({
    summary: 'Verificar codigo',
  })
  @ApiBody({
    schema: j2s(
      object({
        code: string().required(),
        username: string().required(),
      }),
    ).swagger,
  })
  @Public()
  async verifyCode(
    @Body(
      new JoiPipe(
        object({
          code: string().required(),
          username: string().required(),
        }),
      ),
    )
    { code, username },
  ) {
    return await this.auth.checkCode(username, code);
  }

  @Put('recovery')
  @ApiTags('Auth', 'Users')
  @ApiOperation({
    summary: 'Recuperar contraseña',
  })
  @ApiBody({
    schema: j2s(
      object({
        code: string().required(),
        username: string().required(),
        password: string().required(),
      }),
    ).swagger,
  })
  @Public()
  async recoverPassword(
    @Body(
      new JoiPipe(
        object({
          code: string().required(),
          username: string().required(),
          password: string().required(),
        }),
      ),
    )
    { code, username, password },
  ) {
    await this.auth.recoverUserPassword(username, password, code);
  }

  @Post('public_confirmation')
  @ApiTags('Auth', 'Users')
  @ApiOperation({
    summary: 'Enviar un correo de confirmacion con codigo secreto',
  })
  @ApiBody({
    schema: j2s(
      object({
        username: string().required(),
        email: string().email().required(),
      }),
    ).swagger,
  })
  @ApiForbiddenResponse({ description: 'El correo de ese usuario no coincide' })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @Public()
  async sendVerificationEmail(
    @Body(
      new JoiPipe(
        object({
          username: string().required(),
          email: string().email().required(),
        }),
      ),
    )
    { username, email },
  ) {
    return await this.auth.sendVerificationEmail(username, email);
  }

  @Post('public_confirmation/:username')
  @ApiOperation({
    summary: 'Confirmar usuario',
  })
  @ApiTags('Auth', 'Users')
  @ApiBody({
    schema: j2s(
      object({
        code: string().required(),
      }),
    ).swagger,
  })
  @Public()
  async confirmVerificationCode(
    @Param('username') username: string,
    @Body(
      new JoiPipe(
        object({
          code: string().required(),
        }),
      ),
    )
    { code },
  ) {
    await this.auth.verifyUserConfirmationCode(username, code);
  }
}
