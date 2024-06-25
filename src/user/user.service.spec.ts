import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { Response } from 'express'; // Importación de Response y Request de Express
import { UnauthorizedException } from '@nestjs/common/exceptions';

// Testing del user Service
// Testing del UserController
describe('UserService', () => {
  let userController: UserController;
  let userService: UserService;
  let prismaService: PrismaService;
  let mockUsers: User[];
  let jwtService: JwtService;

  beforeEach(async () => {

    jest.clearAllMocks();

    mockUsers = [
      { user_id: 1, name: 'User 1', last_name: 'Last Name 1', email: 'user1@example.com', password: 'password1', role_id: 1 },
      { user_id: 2, name: 'User 2', last_name: 'Last Name 2', email: 'user2@example.com', password: 'password2', role_id: 1 },
      { user_id: 3, name: 'User 3', last_name: 'Last Name 3', email: 'user3@example.com', password: 'password3', role_id: 1 },
    ];

  
    const mockPrismaService = {
      user: {
        findMany: jest.fn().mockResolvedValue(mockUsers),
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(mockUsers[0]), // Assuming you want to resolve the first user for testing
      },
    };
  
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'claveSecretaDePrueba',
          signOptions: { expiresIn: '1h' },
        }),
        // Importa otros módulos necesarios aquí
      ],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation((user) => Promise.resolve('mockedToken')),
            verifyAsync: jest.fn().mockImplementation((token) => Promise.resolve({ email: 'test@example.com' })),
            // Otros métodos simulados de JwtService si es necesario
          },
        },
      ],
    }).compile();
  
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  
    // Aquí añades el mock de signAsync
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockedToken');
  });
  
  

  // Prueba del Register
  it('debe crear un usuario y devolver los datos del usuario creado', async () => {
    const userData: User = {
      user_id: 1,
      name: 'Nombre',
      last_name: 'Apellido',
      email: 'test@example.com',
      password: 'password',
      role_id: 1,
    };
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const expectedUserData = { ...userData, password: hashedPassword };

    // Configuración del mock para la función create del servicio Prisma
    (prismaService.user.create as jest.Mock).mockResolvedValue(expectedUserData);

    const result = await userService.createUser(userData);
    expect(result).toEqual(expectedUserData);
  }); // Final cuerpo Testing User


  // Prueba de fallo en el Register
  it('debe manejar correctamente los errores al intentar crear un usuario', async () => {
  const userData: User = {
    user_id: 1,
    name: 'Nombre',
    last_name: 'Apellido',
    email: 'test@example.com',
    password: 'password',
    role_id: 1,
  };

  // Mock para que prisma.user.create arroje una excepción
  (prismaService.user.create as jest.Mock).mockRejectedValue(new Error('Error al crear usuario'));

  // Verificar que createUser maneje correctamente el error
  await expect(userService.createUser(userData)).rejects.toThrowError('Error al crear usuario');
});



  // Prueba del log User
  it('Debe logear un usuario y devolver un mensaje de que se logró exitosamente.', async () => {
    const mockData: User = {
      user_id: 1,
      name: 'Test',
      last_name: 'User',
      email: 'user@example.com',
      password: 'securePassword',
      role_id: 1,
    };
  
    const mockResponse = {
      cookie: jest.fn(),
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
  
    // Make sure userService.logUser is called and properly awaited
    jest.spyOn(userService, 'logUser').mockImplementation(async () => {
      mockResponse.cookie('token', 'fakeToken', { httpOnly: true });
      return { message: 'Logged Successfully!' };
    });
  
    const result = await userController.logUser(mockData, mockResponse);
  
    // Ensure all spies/mocks are called as expected
    expect(userService.logUser).toHaveBeenCalledWith(mockData, mockResponse);
    expect(result).toEqual({ message: 'Logged Successfully!' });
    expect(mockResponse.cookie).toHaveBeenCalledWith('token', expect.any(String), { httpOnly: true });
  }); // End Log user


// Prueba de fallo en el log user.
  it('debe manejar correctamente los errores al iniciar sesión con credenciales inválidas', async () => {
    const mockData: User = {
      user_id: 1,
      name: 'Test',
      last_name: 'User',
      email: 'user@example.com',
      password: 'securePassword',
      role_id: 1,
    };

    // Simular que el método validateUser devuelve null, indicando credenciales inválidas
    jest.spyOn(userService, 'validateUser').mockResolvedValue(null);

    // Llamar a logUser con las credenciales simuladas y el objeto de respuesta simulado
    let result;
    try {
      result = await userController.logUser(mockData, {} as Response);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Si se lanzó una excepción de UnauthorizedException, significa que el manejo de errores es correcto
        result = { message: 'Invalid Credentials.' };
      } else {
        throw error; // Si es otra excepción, re-lanzamos el error para que Jest lo maneje
      }
    }

    // Verificar que el método validateUser fue llamado con las credenciales simuladas
    expect(userService.validateUser).toHaveBeenCalledWith(mockData);

    // Verificar que el resultado sea el mensaje de error esperado
    expect(result).toEqual({ message: 'Invalid Credentials.' });
  });




  
  // Prueba Get All Users.
  it('Devuelve todos los usuarios registrados en la base de datos.', async () => {
    // Mock de la función findMany de PrismaService para devolver los usuarios de prueba
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    // Llamada al método getAllUsers
    const users = await userService.getAllUsers();

    // Verificación de que se devuelvan todos los usuarios esperados
    expect(users).toEqual(mockUsers);
  }); // Cierre Get All Users.
  

  // Manejo de error en Get All Users.
  it('Maneja correctamente los errores al obtener usuarios.', async () => {
    // Mock de un error al obtener usuarios
    const errorMessage = 'Error obteniendo usuarios';
    jest.spyOn(prismaService.user, 'findMany').mockRejectedValue(new Error(errorMessage));

    // Verificación de que se maneje correctamente el error
    await expect(userService.getAllUsers()).rejects.toThrowError(errorMessage);
  }); // Cierre Manejo de error en Get All Users.



  it('Valida si el usuario existe y la contraseña es correcta.', async () => {
    // Simular datos de usuario para la validación
    const userData: User = {
        user_id: 1, // No es necesario en este caso ya que se espera que la función lo busque en la base de datos
        name: 'Test',
        last_name: 'User',
        email: 'user@example.com',
        password: 'securePassword', // La contraseña no necesita ser hasheada aquí, ya que no estás probando el hashing
        role_id: 1,
    };

    // Simular un usuario en la base de datos
    const mockUser: User = {
        user_id: 1,
        name: 'Test',
        last_name: 'User',
        email: 'user@example.com',
        password: await bcrypt.hash('securePassword', 12), // Hashear la contraseña
        role_id: 1,
    };

    // Mockear el método findFirst de PrismaService para devolver el usuario simulado
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

    // Llamar al método validateUser con los datos de usuario simulados
    const result = await userService.validateUser(userData); 

    // Verificar que el resultado sea el usuario simulado
    expect(result).toEqual(mockUser);
  });

  it('debe devolver null si las credenciales no son válidas', async () => {
    // Simular un usuario que no existe en la base de datos
    const mockUser: User = null;

    // Mockear el método findFirst de PrismaService para devolver null
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

    // Simular datos de usuario para la validación
    const userData: User = {
      user_id: 1,
      name: 'Test',
      last_name: 'User',
      email: 'user@example.com',
      password: await bcrypt.hash('securePassword', 12), // Hashear la contraseña
      role_id: 1,
  };

    // Llamar al método validateUser con los datos de usuario simulados
    const result = await userService.validateUser(userData);

    // Verificar que el resultado sea null
    expect(result).toBeNull();
  });


  it('should create a JWT token without including the password', async () => {
    const user: User = {
      user_id: 1,
      name: 'Test',
      last_name: 'User',
      email: 'user@example.com',
      password: 'hashedPassword', // Aquí es donde se está pasando la contraseña
      role_id: 1,
    };
  
    const expectedPayload = {
      user_id: user.user_id,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      role_id: user.role_id, // No incluir la contraseña en el payload
    };
  
    console.log('Before signAsync call. Expected payload:', expectedPayload);
  
    // Act
    const result = await userService.createToken(user);
  
    console.log('After signAsync call. Result:', result);
  
    // Assert
    expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload); // Verificar que el método se llamó con el payload correcto
    expect(result).toEqual('mockedToken'); // Verificar que el resultado sea el token
  });
  
  
  

}); 
