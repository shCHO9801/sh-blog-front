export type SignInRequest = {
    username: string;
    password: string;
};

export type SignInResponse = {
    accessToken: string;
    username: string;
    nickname: string;
    email: string;
    expiresIn: number;
};

export type MeResponse = {
    username: string;
    nickname: string;
    email: string;
};