export interface WorkEntry {
  _id?: string;
  industry: string;
  position: string;
  duration: string;
  status: "running" | "closed";
}

export interface EducationEntry {
  _id?: string;
  institution: string;
  degree: string;
  duration: string;
  status: "running" | "completed";
}

export interface ActivityStats {
  totalRating: number;
  averageRating: number;
  totalPosts: number;
  totalLikesGiven: number;
  totalLikesReceived: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
}

export interface User {
  _id: string;
  userid: number;
  username: string;
  name: string;
  email: string;
  bio?: string;

  aboutText?: string;
  gender?: string;
  location?: string;
  work?: WorkEntry[];
  educations?: EducationEntry[];
  profileImage?: string;
  coverImage?: string;
  role?: string;
  badges?: [string];
  greenmarkVerified?: boolean;
  status?: string;
  provider?: "local" | "google" | "both";
  createdAt?: string;
  activityStats?: ActivityStats;
}

export interface GetUsersResponse {
  users: User[];
}

export interface GetUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  userid: number;
  formData: FormData;
}

// অ্যাকাউন্ট ডিলিটের জন্য:
// পাসওয়ার্ড আছে এমন account → password
// শুধু Google account → confirmText (নিজের username)
export interface DeleteUserRequest {
  userid: number;
  password?: string;
  confirmText?: string;
}

export interface SuggestedUsersResponse {
  count: number;
  users: User[];
}

export interface SuggestedUser extends User {
  isFollowing: boolean;
}
