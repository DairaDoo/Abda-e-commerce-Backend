import { Controller, Injectable, Post, Body, Res, Get, Req} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { Response, Request } from 'express';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Injectable()
@Controller('api/user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // crear usuario
  @Post('/register')
  @ApiBody({
    description: 'Crea un usuario.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
      example: {
        name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    },
  })
  @ApiOperation({
    description: 'Registra un nuevo usuario.'
  })
  async createUser(@Body() data: User) {
    return this.userService.createUser(data);
  }

  // logear usuario
  @Post('/login')
  @ApiBody({
    description: 'Devuelve un mensaje de logueado con éxito.',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      example: {
        email: 'dairansamir344@gmail.com',
        password: 'Dairan123',
      },
    },
  })
  @ApiOperation({
    description: 'Loguea un usuario (Este debe estar registrado en la base de datos).', // Update description
  })
  async logUser(@Body() data: User, @Res({ passthrough: true }) res: Response) {
    return this.userService.logUser(data, res);
  }

	// Obtener usuario del token
	@Get('/getUser')
  @ApiOkResponse({ description: 'User retrieved successfully' })
  @ApiOperation({
  description: 'Devuelve un usuario de un JWT.',
  })
    async getUser(@Req() request: Request) {
        return this.userService.getUserFromToken(request);
    }

    // Hacer logout del usuario.
    @Post('/logout')
    @ApiOkResponse({ description: 'Logout successful', type: 'object' })
    @ApiOperation({
      description: 'Logs out the user by clearing the authentication token',
    })
    async logoutUser(@Res({passthrough: true}) response: Response) {
        return this.userService.logoutUser(response);
    }

    @Get('/AllUsers')
    @ApiOperation({
       summary: 'Retrieve all users',
      description: 'Fetches all users from the database' 
    })
    async getAllUsers(){
        return this.userService.getAllUsers();
    }

}
