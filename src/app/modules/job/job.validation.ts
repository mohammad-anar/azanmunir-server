import { BikeType, JobStatus, Urgency } from "@prisma/client";
import { z } from "zod";


export const UrgencyEnum = z.enum(Urgency);
export const JobStatusEnum = z.enum(JobStatus);
export const BikeTypeEnum = z.enum(BikeType);

export const CreateJobSchema = z.object({
  userId: z
    .string({ message: "User ID is required" })
    .uuid("User ID must be a valid UUID"),
  categoryId: z
    .string({ message: "Category ID is required" })
    .uuid("Category ID must be a valid UUID"),
  title: z
    .string({ message: "Job title is required" })
    .min(1, "Job title cannot be empty"),
  description: z
    .string({ message: "Job description is required" })
    .min(1, "Job description cannot be empty"),
  address: z
    .string({ message: "Address is required" })
    .min(1, "Address cannot be empty"),
  city: z
    .string({ message: "City is required" })
    .min(1, "City cannot be empty"),
  postalCode: z
    .string({ message: "Postal code is required" })
    .min(1, "Postal code cannot be empty"),
  latitude: z.number({ message: "Latitude is required" }),
  longitude: z.number({ message: "Longitude is required" }),
  radius: z
    .number({ message: "Radius is required" })
    .int("Radius must be an integer")
    .nonnegative("Radius cannot be negative"),
  bikeName: z
    .string({ message: "Bike name is required" })
    .min(1, "Bike name cannot be empty"),
  bikeType: BikeTypeEnum,
  bikeBrand: z.string().optional(),
  preferredTime: z.date({ message: "Preferred time is required" }),
  urgency: UrgencyEnum.default("MEDIUM"),
  status: JobStatusEnum.default("PENDING"),
  bikeId: z.string().uuid("Bike ID must be a valid UUID").optional(),
});

export const UpdateJobSchema = z.object({
  title: z
    .string({ message: "Title must be a string" })
    .min(1, "Title cannot be empty")
    .optional(),
  description: z
    .string({ message: "Description must be a string" })
    .min(1, "Description cannot be empty")
    .optional(),
  address: z
    .string({ message: "Address must be a string" })
    .min(1, "Address cannot be empty")
    .optional(),
  city: z
    .string({ message: "City must be a string" })
    .min(1, "City cannot be empty")
    .optional(),
  postalCode: z
    .string({ message: "Postal code must be a string" })
    .min(1, "Postal code cannot be empty")
    .optional(),
  latitude: z.number({ message: "Latitude must be a number" }).optional(),
  longitude: z.number({ message: "Longitude must be a number" }).optional(),
  radius: z
    .number({ message: "Radius must be a number" })
    .int("Radius must be an integer")
    .nonnegative("Radius cannot be negative")
    .optional(),
  bikeName: z
    .string({ message: "Bike name must be a string" })
    .min(1, "Bike name cannot be empty")
    .optional(),
  bikeType: BikeTypeEnum.optional(),
  bikeBrand: z.string({ message: "Bike brand must be a string" }).optional(),
  preferredTime: z
    .date({ message: "Preferred time must be a date" })
    .optional(),
  urgency: UrgencyEnum.optional(),
  status: JobStatusEnum.optional(),
  bikeId: z
    .string({ message: "Bike ID must be a string" })
    .uuid("Bike ID must be a valid UUID")
    .optional(),
});
