export interface UserData {
    id: number;
    name: string;
    userName?: string;
    chineseName: string;
    email: string;
    departmentName: string;
    departmentId: string;
    userImage?: string;
}

type UserResultWrapped = {
    requestId: string;
    code: number;
    message: string;
    result: UserData;
};

export type CurrentUserResult = UserData | UserResultWrapped;

export interface CurrentUser extends UserData {
    username: string;
}
