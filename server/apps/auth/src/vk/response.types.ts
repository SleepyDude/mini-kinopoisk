export type AuthData = {
  email?: string;
  user_id: number;
  access_token: string;
};

export type AuthDataResponse = {
  data: AuthData;
};

export type ProfileFromVk = {
  photo_400: string;
  first_name: string;
  last_name: string;
};

export type UserData = {
  response: ProfileFromVk[];
};

export type UserDataForVK = {
  vk_id: number;
  email: string;
  password: null;
};

export type UserDataResponse = {
  data: UserData;
};
