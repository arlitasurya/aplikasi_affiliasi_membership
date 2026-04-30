import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, User, UserRole } from "../types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Ngolab AI Service - Production
 */

/**
 * Helper to compress and resize base64 image before sending to AI
 */
const compressImage = async (base64: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress quality to 70%
    };
    img.src = base64;
  });
};

/**
 * Scan KTM using Gemini Vision
 */
export const scanKTM = async (base64Image: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Compress image first to avoid payload limits
    const optimizedImage = await compressImage(base64Image);
    const base64Data = optimizedImage.split(',')[1] || optimizedImage;
    const mimeType = optimizedImage.match(/data:(.*?);/)?.[1] || "image/jpeg";
    
    const prompt = `
      Identity Verification Task:
      Analyze the provided image (which is a Student ID Card / KTM or a portion of it).
      Determine if it belongs to Telkom University, Indonesia.
      
      Detection Clues:
      1. Distinctive "Telkom University" logo or text.
      2. Mentions of "Fakultas Ilmu Terapan", "D3 Sistem Informasi", or other Telkom faculties.
      3. Red and white color theme.
      
      Respond STRICTLY in a SINGLE JSON object. 
      {
        "isTelkom": boolean,
        "confidence": number (0.0 to 1.0),
        "reasoning": "Explain why briefly in Indonesian",
        "nim": "Student ID number if visible",
        "name": "Student name if visible"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    // More robust JSON cleaning
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format respon AI tidak valid.");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI Scan failed:", error);
    return {
      isTelkom: false,
      confidence: 0,
      reasoning: "Terjadi gangguan koneksi ke AI atau gambar terlalu besar. Silakan coba lagi dengan foto yang lebih dekat.",
      nim: null,
      name: null
    };
  }
};

/**
 * Main prediction function based on User Role (STUB).
 * Member: Returns static menu recommendation.
 * Affiliate: Returns static business strategy.
 */
export const getGeminiPrediction = async (user: User, _transactions: Transaction[]): Promise<string> => {
  // Simulate network delay for realistic UI feeling
  await new Promise(resolve => setTimeout(resolve, 800));

  if (user.role === UserRole.MEMBER_AFFILIATE) {
    return "Strategi Jaringan: Manfaatkan event kampus minggu ini untuk membagikan kode referral secara masif ke teman-teman seangkatan agar komisi Anda meningkat tajam!";
  } else {
    // Default for MEMBER and others
    return "Melihat riwayatmu, Mie Ayam Yamin pedas paling pas buat nemenin nugas sore ini! Cek promo di bawah.";
  }
};

/**
 * Verifikasi KTM Mockup (STUB).
 */
export const verifyKTMWithGemini = async (_base64Image: string) => {
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return fixed valid mock data for testing
  return { 
    isKTM: true, 
    nim: "1301201234", 
    prodi: "S1 Informatika" 
  };
};

/**
 * Compatibility functions for existing components.
 */
export const analyzeHistoryForRewards = async (transactions: Transaction[]) => {
  return "Melihat riwayatmu, Mie Ayam Yamin pedas paling pas buat nemenin nugas sore ini!";
};

export const analyzeBusinessInsight = async (user: User, transactions: Transaction[]) => {
  return getGeminiPrediction(user, transactions);
};

export const analyzeAffiliateGrowth = async (user: User) => {
  return getGeminiPrediction(user, []);
};


