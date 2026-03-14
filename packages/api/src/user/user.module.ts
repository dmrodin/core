import { Module } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BcryptHasher } from '../common/services/bcrypt-hasher.service';
import { UserController } from '../user/user.controller';
import {
    BlockUserUseCase,
    DeleteUserUseCase,
    GetUserByIdUseCase,
    GetUsersUseCase,
    UpdateUserRolesUseCase,
    UpdateUserUseCase,
} from './use-cases';

@Module({
    controllers: [UserController],
    providers: [
        BcryptHasher,
        JwtAuthGuard,
        RolesGuard,
        GetUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        UpdateUserRolesUseCase,
        DeleteUserUseCase,
        BlockUserUseCase,
    ],
    exports: [
        GetUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        UpdateUserRolesUseCase,
        DeleteUserUseCase,
        BlockUserUseCase,
    ],
})
export class UserModule {}
