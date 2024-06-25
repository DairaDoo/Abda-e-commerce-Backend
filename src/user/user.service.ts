import { Injectable, UnauthorizedException } from '@nestjs/common'; // Importación de decoradores y excepciones de NestJS
import { PrismaService } from 'src/prisma/prisma.service'; // Importación del servicio Prisma para interactuar con la base de datos
import { User } from '@prisma/client'; // Importación del modelo de usuario de Prisma
import * as bycrypt from 'bcrypt'; // Importación de la biblioteca bcrypt para el cifrado de contraseñas
import { JwtService } from '@nestjs/jwt'; // Importación del servicio Jwt de NestJS para manejar tokens JWT
import { Response, Request } from 'express'; // Importación de Response y Request de Express

@Injectable() // Marca la clase como inyectable
export class UserService {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    // Método para obtener todos los usuarios de la base de datos
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany();
            return users;
        } catch (error) {
            console.error("Error retrieving users:", error);
            throw error;
        }
    }

    // Método para crear un nuevo usuario en la base de datos
    async createUser(data: User): Promise<User> {
        const hashed_password = await bycrypt.hash(data.password, 12); // Se cifra la contraseña del usuario
        data.password = hashed_password; // Se actualiza la contraseña cifrada en los datos del usuario
        return this.prisma.user.create({ data }); // Se crea el usuario en la base de datos mediante Prisma
    }

    // Método para iniciar sesión de un usuario
    async logUser(data: User, response: Response): Promise<any> {
        const user = await this.validateUser(data); // Se valida al usuario y se obtiene el objeto de usuario

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials.'); // Si el usuario no es válido, se lanza una excepción
        }

        const token = await this.createToken(user); // Se genera un token JWT para el usuario válido
        response.cookie('token', token, { httpOnly: true }); // Se establece la cookie del token en la respuesta HTTP

        return { message: 'Logged Successfully!' }; // Se devuelve un mensaje de inicio de sesión exitoso
    }

    // Método para validar las credenciales de un usuario
    async validateUser(data: User): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: { email: data.email } // Se busca al usuario en la base de datos por su correo electrónico
        });

        if (!user || !(await bycrypt.compare(data.password, user.password))) {
            return null; // Si el usuario no existe o la contraseña no coincide, se devuelve null
        }

        return user; // Se devuelve el objeto de usuario válido
    }

    // Método para generar un token JWT para un usuario
    async createToken(user: User): Promise<string> {
        const { password, ...userWithoutPassword } = user; // Se elimina la contraseña del usuario del objeto antes de firmar el token
        return this.jwtService.signAsync(userWithoutPassword); // Se firma y devuelve el token JWT
    }

    // Método para obtener información del usuario basada en el token JWT
    async getUserFromToken(request: Request): Promise<User | undefined> {
        const token = await this.extractTokenFromRequest(request); // Se extrae el token JWT de la solicitud

        if (!token) {
            throw new UnauthorizedException('Token JWT not found'); // Si el token no se encuentra, se lanza una excepción
        }

        const decoded = await this.verifyToken(token); // Se verifica y decodifica el token JWT

        if (!decoded || !decoded.email) {
            throw new UnauthorizedException('Invalid JWT token'); // Si el token no es válido, se lanza una excepción
        }

        return this.prisma.user.findUnique({
            where: { email: decoded.email } // Se busca al usuario en la base de datos por su correo electrónico
        });
    }

    // Método para extraer el token JWT de la solicitud
    async extractTokenFromRequest(request: Request): Promise<string | null> {
        const cookie = request.cookies['token']; // Se obtiene la cookie del token de la solicitud
        return cookie || null; // Se devuelve el token si existe, de lo contrario, se devuelve null
    }

    // Método para verificar la validez del token JWT
    async verifyToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token); // Se verifica y decodifica el token JWT
        } catch (error) {
            throw new UnauthorizedException('Invalid JWT token'); // Si el token no es válido, se lanza una excepción
        }
    }

    // Método para cerrar la sesión de un usuario y limpiar la cookie del token
    async logoutUser(response: Response): Promise<any> {
        response.clearCookie('token'); // Se limpia la cookie del token en la respuesta HTTP
        return { message: 'Success' }; // Se devuelve un mensaje de éxito
    }
}
