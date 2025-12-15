/**
 * Test Helper Utilities
 * 
 * Common utilities for testing API routes and functions
 */

import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  method: string = "GET",
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const url = "http://localhost:3000/api/test";
  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create a mock authenticated request
 */
export function createAuthenticatedRequest(
  userId: string,
  role: Role = Role.STUDENT,
  method: string = "GET",
  body?: any
): NextRequest {
  // In a real test, you'd mock the auth() function
  // For now, we'll pass user info via headers (tests will need to mock auth)
  return createMockRequest(method, body, {
    "x-test-user-id": userId,
    "x-test-user-role": role,
  });
}

/**
 * Helper to create test user data
 */
export const testUserData = {
  student: {
    email: "student@test.com",
    password: "password123",
    name: "Test Student",
    role: Role.STUDENT,
  },
  tutor: {
    email: "tutor@test.com",
    password: "password123",
    name: "Test Tutor",
    role: Role.TUTOR,
  },
  admin: {
    email: "admin@test.com",
    password: "password123",
    name: "Test Admin",
    role: Role.ADMIN,
  },
};

/**
 * Helper to wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create date in the future
 */
export function futureDate(hours: number = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Helper to create date in the past
 */
export function pastDate(hours: number = 1): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
