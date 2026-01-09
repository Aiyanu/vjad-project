import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import { prisma } from "../lib/db";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
