export type Env = {
  Variables: {
    ID: string,
    ROLE?: 'user' | 'admin'
  }
}

export type UserData = {
  id: string;
  email: string;
  name: string;
  preferred_name: string;
  student_number: string;
  role: string;
};
