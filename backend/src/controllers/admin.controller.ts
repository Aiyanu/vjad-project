import { Response } from "express";
import { prisma } from "../lib/db";
import { apiSuccess, apiError } from "../lib/api-response";
import { AuthenticatedRequest } from "../middlewares/auth";
import crypto from "crypto";
import { hashPassword } from "../lib/auth";
import { sendMail } from "../lib/mailer";

export const getAffiliates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "10")));
    const search = (req.query.search as string || "").trim();
    const sortField = req.query.sortField as string || "createdAt";
    const sortOrder = (req.query.sortOrder as string || "desc").toLowerCase();

    const where: any = { role: "affiliate", affiliate: { isNot: null } };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        {
          affiliate: {
            is: { referralCode: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    const validSortFields: Record<string, string> = {
      fullName: "fullName",
      email: "email",
      phone: "phone",
      createdAt: "createdAt",
      isDisabled: "isDisabled",
      referralsCount: "referralsCount",
    };

    const orderByField = validSortFields[sortField] || "createdAt";
    const orderByDir = sortOrder === "asc" ? "asc" : "desc";

    const total = await prisma.user.count({ where });

    const affiliates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        isDisabled: true,
        createdAt: true,
        phone: true,
        affiliate: {
          select: {
            referralCode: true,
            bankName: true,
            accountNumber: true,
            bankCode: true,
            accountName: true,
            _count: { select: { referrals: true } },
          },
        },
      },
      orderBy: sortField === "referralsCount" ? undefined : { [orderByField]: orderByDir } as any,
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedAffiliates = affiliates.map((aff: any) => ({
      id: aff.id,
      email: aff.email,
      fullName: aff.fullName,
      emailVerified: aff.emailVerified,
      isDisabled: aff.isDisabled,
      createdAt: aff.createdAt,
      phone: aff.phone,
      referralCode: aff.affiliate?.referralCode ?? null,
      bankName: aff.affiliate?.bankName ?? null,
      accountNumber: aff.affiliate?.accountNumber ?? null,
      bankCode: aff.affiliate?.bankCode ?? null,
      accountName: aff.affiliate?.accountName ?? null,
      referralsCount: aff.affiliate?._count.referrals ?? 0,
    }));

    if (sortField === "referralsCount") {
      formattedAffiliates.sort((a, b) => {
        const diff = a.referralsCount - b.referralsCount;
        return orderByDir === "asc" ? diff : -diff;
      });
    }

    return apiSuccess(res, {
      affiliates: formattedAffiliates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, "Affiliates fetched");
  } catch (err) {
    return apiError(res, "Failed to fetch affiliates", 500, err);
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id;
        const { isDisabled } = req.body;

        const user = await prisma.user.update({
            where: { id: String(id) },
            data: { isDisabled: Boolean(isDisabled) },
            include: { affiliate: true }
        });

        return apiSuccess(res, user, `User ${isDisabled ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
        return apiError(res, "Failed to update user status", 500, err);
    }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id;

        await prisma.$transaction(async (tx: any) => {
            await tx.affiliate.deleteMany({ where: { userId: String(id) } });
            await tx.user.delete({ where: { id: String(id) } });
        });

        return apiSuccess(res, null, "User deleted successfully");
    } catch (err) {
        return apiError(res, "Failed to delete user", 500, err);
    }
};

export const getAdmins = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "10")));
        const search = (req.query.search as string || "").trim();
        const sortField = req.query.sortField as string || "createdAt";
        const sortOrder = (req.query.sortOrder as string || "desc").toLowerCase();

        const where: any = {
            role: { in: ["admin", "super_admin"] },
        };
        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } },
            ];
        }

        const validSortFields: Record<string, string> = {
            fullName: "fullName",
            email: "email",
            role: "role",
            createdAt: "createdAt",
        };
        const orderByField = validSortFields[sortField] || "createdAt";
        const orderByDir = sortOrder === "asc" ? "asc" : "desc";

        const total = await prisma.user.count({ where });

        const admins = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
            orderBy: { [orderByField]: orderByDir } as any,
            skip: (page - 1) * limit,
            take: limit,
        });

        return apiSuccess(res, {
            admins,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, "Admins fetched");
    } catch (err) {
        return apiError(res, "Failed to fetch admins", 500, err);
    }
};

export const createAdmin = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { fullName, email, role: requestedRole } = req.body;

        if (!fullName || !email) {
            return apiError(res, "Full name and email are required", 400);
        }

        const role = requestedRole === "super_admin" ? "super_admin" : "admin";

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return apiError(res, "Email already exists", 409);
        }

        const randomPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);

        const newAdmin = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash: hashedPassword,
                role,
                emailVerified: true,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });

        // Email logic
        try {
            const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth`;
            await sendMail({
                to: email,
                subject: "Your Admin Account Has Been Created",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Welcome to Vijad Projects Admin</h2>
                        <p>Hello ${fullName}, Your admin account has been created.</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> ${randomPassword}</p>
                        <p><a href="${loginUrl}">Login here</a></p>
                    </div>
                `,
                text: `Hello ${fullName}, Your admin account has been created. Email: ${email}, Password: ${randomPassword}, Login at: ${loginUrl}`
            });
        } catch (mailErr) {
            console.error("Failed to send admin credentials email:", mailErr);
        }

        return apiSuccess(res, newAdmin, "Admin created successfully", 201);
    } catch (err) {
        return apiError(res, "Failed to create admin", 500, err);
    }
};
