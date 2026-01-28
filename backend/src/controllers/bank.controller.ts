// src/controllers/bank.controller.ts
import axios from "axios";
import { Request, Response } from "express";
export const getBanks = async (req: Request, res: Response) => {
  try {
    // const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    // if (!PAYSTACK_SECRET_KEY) {
    //   return res
    //     .status(500)
    //     .json({ error: "Paystack secret key not configured" });
    // }
    const response = await axios.get("https://api.paystack.co/bank", {
      //   headers: {
      //     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      //   },
    });
    res.json({ banks: response.data.data });
  } catch (error: any) {
    res.status(500).json({
      error:
        error?.response?.data?.message || "Failed to fetch banks from Paystack",
    });
  }
};
