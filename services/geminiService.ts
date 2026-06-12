import Tesseract from 'tesseract.js';
import { Transaction, User, UserRole } from "../types";
import { API_BASE_URL } from "../constants";

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
 * Verifikasi KTM Mockup (STUB).
 */
export const verifyKTMWithGemini = async (_base64Image: string) => {
  return scanKTM(_base64Image);
};

/**
 * Fetch AI Recommendation from backend endpoint.
 * Backend endpoint: GET /api/kiosk/ai-insights/{user_id}
 * Returns null if not found (user has no transaction history yet).
 */
export const getRecommendation = async (userId: string): Promise<{
  favorite_category: string;
  peak_visit_time: string;
  ai_recommendation: string;
} | null> => {
  try {
// Hardcoded URL to ensure correct endpoint
    const centralUrl = 'http://10.20.113.132:4000';
    const response = await fetch(`${centralUrl}/api/kiosk/ai-insights/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 Data yang diterima dari backend:', result);
    if (response.ok && result?.data) {
      const recommendation = result.data.ai_recommendation || result.data.data?.ai_recommendation || '';
      console.log('✅ Extracted ai_recommendation:', recommendation);
      return {
        favorite_category: result.data.favorite_category || '',
        peak_visit_time: result.data.peak_visit_time || '',
        ai_recommendation: recommendation
      };
    }

    return null;
  } catch (error) {
    console.error('getRecommendation error:', error);
    return null;
  }
};

/**
 * Analyze affiliate growth - fetch AI insight from backend /api/kiosk/ai-insights/{user_id}
 * Returns ai_recommendation from backend or fallback to default text.
 */
export const analyzeAffiliateGrowth = async (user: User): Promise<string> => {
  try {
    // Hardcoded URL to ensure correct endpoint
    const centralUrl = 'http://10.20.113.132:4000';
    const response = await fetch(`${centralUrl}/api/kiosk/ai-insights/${user.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('📊 Data AI insights di analyzeAffiliateGrowth:', result);
      // Handle both direct data and nested data structures
      const recommendation = result?.data?.ai_recommendation || result?.data?.data?.ai_recommendation || result?.ai_recommendation || '';
      if (recommendation) {
        console.log('✅ Recommendation found:', recommendation);
        return recommendation;
      }
    } else {
      console.warn(`⚠️ AI insights fetch failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('analyzeAffiliateGrowth fetch error:', error);
  }

// Fallback to default text
   return "Menunggu data analitik AI...";
};

/**
 * Analyze business insight - fetch from backend or use fallback
 */
export const analyzeBusinessInsight = async (user: User, transactions: Transaction[]): Promise<string> => {
  if (user.role === UserRole.MEMBER_AFFILIATE) {
    return analyzeAffiliateGrowth(user);
  } else {
    // For regular members, try to fetch recommendation
    const rec = await getRecommendation(user.id);
    if (rec?.ai_recommendation) {
      return rec.ai_recommendation;
    }
    return "Menunggu data analitik AI...";
  }
};

/**
 * Analyze history for rewards - now fetches from backend
 */
export const analyzeHistoryForRewards = async (transactions: Transaction[], userId?: string): Promise<string> => {
  if (userId) {
    const rec = await getRecommendation(userId);
    if (rec?.ai_recommendation) {
      return rec.ai_recommendation;
    }
  }
  return "Menunggu data analitik AI...";
};


