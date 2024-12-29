// src/core/interfaces/user.interface.ts
export interface IUser {
    id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
