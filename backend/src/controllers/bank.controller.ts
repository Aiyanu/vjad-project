// src/controllers/bank.controller.ts
import axios from "axios";
import { Request, Response } from "express";
import { apiSuccess, apiError } from "../lib/api-response";
export const getBanks = async (req: Request, res: Response) => {
  try {
    // const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    // if (!PAYSTACK_SECRET_KEY) {
    //   return apiError(res, "Paystack secret key not configured", 500);
    // }
    const response = await axios.get("https://api.paystack.co/bank", {
      //   headers: {
      //     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      //   },
    });
    return apiSuccess(res, response.data.data, "Banks fetched");
  } catch (error: any) {
    return apiError(
      res,
      error?.response?.data?.message || "Failed to fetch banks from Paystack",
      500,
      error,
    );
  }
};
