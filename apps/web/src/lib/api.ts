import type { ApiResponse, ApiError, Profile, Child, Course, CourseWithUnits, CreateChild, UpdateChild, UpdateProfile } from '@repo/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // Profile endpoints
  async getProfile(token: string): Promise<ApiResponse<Profile>> {
    return this.request<Profile>('/profiles/me', {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateProfile(token: string, data: UpdateProfile): Promise<ApiResponse<Profile>> {
    return this.request<Profile>('/profiles/me', {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  // Children endpoints
  async getChildren(token: string): Promise<ApiResponse<Child[]>> {
    return this.request<Child[]>('/children', {
      headers: this.getAuthHeaders(token),
    });
  }

  async createChild(token: string, data: CreateChild): Promise<ApiResponse<Child>> {
    return this.request<Child>('/children', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async updateChild(token: string, id: string, data: UpdateChild): Promise<ApiResponse<Child>> {
    return this.request<Child>(`/children/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async deleteChild(token: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/children/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Content endpoints (public)
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return this.request<Course[]>('/content/courses');
  }

  async getCourseBySlug(slug: string): Promise<ApiResponse<CourseWithUnits>> {
    return this.request<CourseWithUnits>(`/content/courses/${slug}`);
  }
}

export const apiClient = new ApiClient();
