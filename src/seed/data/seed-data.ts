import * as bcrypt from 'bcrypt';

interface SeedUser {
    email:    string;
    fullName: string;
    password: string;
    roles:    string[];
}

interface SeedData {
    users: SeedUser[];
}

export const initialData: SeedData = {

    users: [
        {
            email: 'admin@test.com',
            fullName: 'Admin Test',
            password: bcrypt.hashSync( 'Abc123', 10 ),
            roles: ['admin']
        },
        {
            email: 'user@test.com',
            fullName: 'User Test',
            password: bcrypt.hashSync( 'Abc123', 10 ),
            roles: ['user']
        }
    ],

}
