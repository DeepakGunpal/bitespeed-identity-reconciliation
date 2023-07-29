export interface ContactParams {
  id?: number;
  phoneNumber?: string;
  email?: string;
  linkedId?: number;
  linkPrecedence?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Contact {
  id: number;
  phonenumber: string | null;
  email: string | null;
  linkedid: number | null;
  linkprecedence: string;
  createdat: string;
  updatedat: string;
  deletedat?: string;
}
