import api from "./api"


export interface Blog {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}
export interface BlogsResponse {
  message: string;
  success: boolean;
  data: Blog[];
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  userId: number;
}

export interface CreateBlogResponse {
  message: string;
  success: boolean;
  data: {
    insertId: number;
  };
}

export const blogService = {
  getAllBlogs: async (): Promise<Blog[]> => {
    try {
      const response = await api.get<BlogsResponse>("/blog");
      return response.data.data || [];
    } catch (error: any) {
      // Backend returns 404 when there are 0 blogs in the database
      if (error.response?.status === 404) {
        return [];
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load blogs.";
      throw new Error(message);
    }
  },

  createBlog: async (blogData: CreateBlogRequest): Promise<CreateBlogResponse> => {
    try {
      const response = await api.post<CreateBlogResponse>("/blog", blogData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create blog.";
      throw new Error(message);
    }
  },
};
