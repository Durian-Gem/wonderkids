import { z } from 'zod';

// Common schemas
export const UuidSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

// CEFR levels
export const CefrLevelSchema = z.enum(['preA1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type CefrLevel = z.infer<typeof CefrLevelSchema>;

// User roles
export const UserRoleSchema = z.enum(['guardian', 'child', 'admin', 'teacher']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Profile schemas
export const ProfileSchema = z.object({
  user_id: UuidSchema,
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  role: UserRoleSchema.default('guardian'),
  locale: z.string().default('en'),
  created_at: TimestampSchema,
});

export const CreateProfileSchema = ProfileSchema.pick({
  display_name: true,
  avatar_url: true,
  locale: true,
}).partial();

export const UpdateProfileSchema = CreateProfileSchema;

export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// Child schemas
export const ChildSchema = z.object({
  id: UuidSchema,
  guardian_id: UuidSchema,
  display_name: z.string().min(1, 'Display name is required'),
  avatar_url: z.string().url().nullable(),
  birth_year: z.number().int().min(2010).max(2025).nullable(),
  locale: z.string().default('en'),
  created_at: TimestampSchema,
});

export const CreateChildSchema = ChildSchema.pick({
  display_name: true,
  avatar_url: true,
  birth_year: true,
  locale: true,
}).partial({
  avatar_url: true,
  birth_year: true,
  locale: true,
});

export const UpdateChildSchema = CreateChildSchema;

export type Child = z.infer<typeof ChildSchema>;
export type CreateChild = z.infer<typeof CreateChildSchema>;
export type UpdateChild = z.infer<typeof UpdateChildSchema>;

// Course schemas
export const CourseSchema = z.object({
  id: UuidSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  cefr_level: CefrLevelSchema.nullable(),
  description: z.string().nullable(),
  is_published: z.boolean().default(false),
  created_at: TimestampSchema,
});

export type Course = z.infer<typeof CourseSchema>;

// Unit schemas
export const UnitSchema = z.object({
  id: UuidSchema,
  course_id: UuidSchema,
  idx: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  is_published: z.boolean().default(false),
  created_at: TimestampSchema,
});

export type Unit = z.infer<typeof UnitSchema>;

// Lesson schemas
export const LessonSchema = z.object({
  id: UuidSchema,
  unit_id: UuidSchema,
  idx: z.number().int().min(1),
  title: z.string().min(1),
  objective: z.string().nullable(),
  est_minutes: z.number().int().min(1).default(5),
  is_published: z.boolean().default(false),
  created_at: TimestampSchema,
});

export type Lesson = z.infer<typeof LessonSchema>;

// Course with nested data for API responses
export const CourseWithUnitsSchema = CourseSchema.extend({
  units: z.array(UnitSchema.extend({
    lessons: z.array(LessonSchema),
  })),
});

export type CourseWithUnits = z.infer<typeof CourseWithUnitsSchema>;

// API Response types
export const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: dataSchema,
  success: z.boolean(),
  message: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number(),
});

export type ApiResponse<T> = {
  data: T;
  success: true;
  message?: string;
};

export type ApiError = z.infer<typeof ApiErrorSchema>;
