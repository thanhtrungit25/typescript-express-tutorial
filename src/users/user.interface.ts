interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  address?: {
    street: string;
    city: string;
  };
}

export default User;
