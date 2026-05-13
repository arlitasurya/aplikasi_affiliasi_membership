import Tesseract from 'tesseract.js';
import { Transaction, User, UserRole } from "../types";

/**
 * Ngolab OCR Service
 */

const compressImage = async (base64: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
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
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.src = base64;
  });
};

const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const extractNimFromText = (text: string): string | null => {
  const candidates = text.match(/\b\d{8,15}\b/g) || [];
  if (candidates.length > 0) {
    return candidates[0];
  }

  const nimLine = text
    .split(/\r?\n/)
    .find((line) => /nim|nrp|student id|id mahasiswa/i.test(line));

  if (!nimLine) return null;

  const lineDigits = nimLine.match(/\b\d{8,15}\b/);
  return lineDigits?.[0] || null;
};

/**
 * Scan KTM using OCR and extract Telkom/NIM clues from text.
 */
export const scanKTM = async (base64Image: string) => {
  try {
    const optimizedImage = await compressImage(base64Image);
    const result = await Tesseract.recognize(optimizedImage, 'eng', {
      logger: () => undefined
    });

    const rawText = result.data.text || '';
    const normalized = normalizeText(rawText);
    const detectedNim = extractNimFromText(rawText);
    const isTelkom = /telkom university|telkom|fakultas ilmu terapan|s1 informatika|d3 sistem informasi/i.test(normalized);

    return {
      isTelkom,
      confidence: isTelkom ? 0.85 : 0.2,
      reasoning: isTelkom
        ? 'Teks KTM mengandung indikator Telkom University atau identitas kampus yang sesuai.'
        : 'Teks KTM belum cukup kuat menunjukkan bahwa kartu adalah KTM Telkom University.',
      nim: detectedNim,
      name: null,
      text: rawText
    };
  } catch (error) {
    console.error("AI Scan failed:", error);
    return {
      isTelkom: false,
      confidence: 0,
      reasoning: "OCR gagal membaca KTM. Silakan coba lagi dengan foto yang lebih jelas dan dekat.",
      nim: null,
      name: null,
      text: ''
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
  return scanKTM(_base64Image);
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


