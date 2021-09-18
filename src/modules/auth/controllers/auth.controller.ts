import {
  Body,
  Controller,
  Get,
  Head,
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
import * as joi from 'joi';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('time')
  time() {
    return new Date();
  }

  @Head('verify_token')
  valid_token() {}

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
    @Req() req,
  ) {
    return await this.auth.login(user, req);
  }

  @ApiTags('Auth')
  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Refrescar token',
  })
  @ApiBody({
    schema: j2s(
      joi.object({
        refresh_token: joi.string().required(),
      }),
    ).swagger,
  })
  async refresh(
    @Body(
      new JoiPipe(
        joi.object({
          refresh_token: joi.string().required(),
        }),
      ),
    )
    { refresh_token },
    @Req() req,
  ) {
    return await this.auth.validateRefresh(refresh_token, req);
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
    @Req() req,
  ) {
    return await this.auth.login(user, req);
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
    @Req() req,
  ) {
    return await this.auth.login(user, req);
  }

  @ApiTags('Auth')
  @ApiOperation({ summary: 'Devuelve la informacion de un usuario' })
  @ApiOkResponse({
    schema: j2s(USER_INFO_SCHEMA).swagger,
  })
  @Get('user_info')
  async userFuncs(@Req() { user }: any) {
    return await this.auth.updateUserInfo(user);
    // return { ...user, licenses: await this.auth.userLicenses(user.username) };
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
      joi.object({
        code: joi.string().required(),
      }),
    ).swagger,
  })
  async confirmVerificationCodeLoggedUser(
    @User('username') username: string,
    @Body(
      new JoiPipe(
        joi.object({
          code: joi.string().required(),
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
      joi.object({
        code: joi.string().required(),
        username: joi.string().required(),
      }),
    ).swagger,
  })
  @Public()
  async verifyCode(
    @Body(
      new JoiPipe(
        joi.object({
          code: joi.string().required(),
          username: joi.string().required(),
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
      joi.object({
        code: joi.string().required(),
        username: joi.string().required(),
        password: joi.string().required(),
      }),
    ).swagger,
  })
  @Public()
  async recoverPassword(
    @Body(
      new JoiPipe(
        joi.object({
          code: joi.string().required(),
          username: joi.string().required(),
          password: joi.string().required(),
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
      joi.object({
        username: joi.string().required(),
        email: joi.string().email().required(),
      }),
    ).swagger,
  })
  @ApiForbiddenResponse({ description: 'El correo de ese usuario no coincide' })
  @ApiNotFoundResponse({ description: 'Usuario no existe' })
  @Public()
  async sendVerificationEmail(
    @Body(
      new JoiPipe(
        joi.object({
          username: joi.string().required(),
          email: joi.string().email().required(),
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
      joi.object({
        code: joi.string().required(),
      }),
    ).swagger,
  })
  @Public()
  async confirmVerificationCode(
    @Param('username') username: string,
    @Body(
      new JoiPipe(
        joi.object({
          code: joi.string().required(),
        }),
      ),
    )
    { code },
  ) {
    await this.auth.verifyUserConfirmationCode(username, code);
  }
}
