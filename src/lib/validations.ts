import { z } from 'zod';

export const ListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  area: z.string().min(2, 'Area is required'),
  city: z.string().default('Kuala Lumpur'),
  subType: z.string().default('Apartment'),
  category: z.enum(['stay', 'experiences', 'services']),
  twoNightPriceUsd: z.number().positive('Price must be greater than 0').max(10000),
  rating: z.string().default('5.0'),
  reviewsCount: z.number().int().nonnegative().default(0),
  guestFavorite: z.boolean().default(false),
  image: z.string().min(1, 'An image is required'),
  gallery: z.array(z.string()).default([]),
  maxGuests: z.number().int().min(1).max(30).default(2),
  bedrooms: z.string().default('1 bedroom'),
  hostName: z.string().min(2).default('Host'),
  hostYears: z.number().int().nonnegative().default(1),
  amenities: z.array(z.string()).default([]),
  description: z.string().default(''),
});

export const BookingSchema = z.object({
  id: z.string().min(1),
  confirmationCode: z.string().min(4),
  listingId: z.string().min(1),
  guestEmail: z.string().email('Please enter a valid email address'),
  guestName: z.string().min(1, 'Guest name is required'),
  title: z.string().min(1),
  area: z.string().min(1),
  image: z.string().min(1),
  checkInLabel: z.string().min(1),
  nights: z.number().int().min(1).max(90),
  guests: z.number().int().min(1).max(30),
  totalUsd: z.number().positive(),
  hostName: z.string().min(1),
  status: z.enum(['Confirmed', 'Upcoming', 'Completed', 'Cancelled']).default('Confirmed'),
});

export const ReviewSchema = z.object({
  listingId: z.string().min(1),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4, 'Comment must be at least 4 characters').max(1000),
});

export const MessageSchema = z.object({
  threadId: z.string().min(1),
  sender: z.enum(['host', 'guest', 'admin']),
  text: z.string().min(1, 'Message cannot be empty').max(2000),
  time: z.string().min(1),
});

export const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  city: z.string().min(2).max(60).default('Kuala Lumpur'),
  phone: z.string().optional(),
  verified: z.boolean().default(false),
  role: z.enum(['guest', 'host', 'admin']).default('guest'),
});

export type ValidatedListing = z.infer<typeof ListingSchema>;
export type ValidatedBooking = z.infer<typeof BookingSchema>;
export type ValidatedReview = z.infer<typeof ReviewSchema>;
export type ValidatedMessage = z.infer<typeof MessageSchema>;
export type ValidatedProfile = z.infer<typeof ProfileSchema>;
