import { API_BASE_URL } from '../constants';

/**
 * Central Backend API URL - untuk KYC verification (OCR processing)
 * Diambil dari .env file: VITE_CENTRAL_API_URL
 * Default: http://172.20.10.2:4000 (jika tidak ada di .env)
 * 
 * Endpoint KYC: {CENTRAL_API_URL}/api/membership/affiliate/verify
 */
const getCentralApiUrl = () => {
  // Gunakan import.meta.env untuk Vite
  const centralUrl = (import.meta as any).env.VITE_CENTRAL_API_URL;
  
  if (centralUrl) {
    console.log(`🔗 Using Central Backend from .env: ${centralUrl}`);
    return centralUrl;
  }
  
  // Fallback ke IP 172.20.10.2 jika tidak ada .env
  const fallbackUrl = 'http://172.20.10.2:4000';
  console.warn(`⚠️ VITE_CENTRAL_API_URL tidak ditemukan di .env, menggunakan fallback: ${fallbackUrl}`);
  return fallbackUrl;
};



/**
 * Verify KTM via Central Backend KYC API
 * - Backend performs OCR on image
 * - Returns verification status (PENDING/APPROVED/REJECTED) + OCR data
 * 
 * @param userId - User ID
 * @param ktmFile - File object dari input file
 * @returns verification object with status, ocr data
 */
export async function verifyAffiliateKtm(
  userId: string,
  ktmFile: File
) {
  try {
    const centralApiUrl = getCentralApiUrl();
    const kycEndpoint = `${centralApiUrl}/api/membership/affiliate/verify`;
    
    console.log(`📤 Sending KTM to Central Backend: ${kycEndpoint}`);
    console.log(`📦 File info: name=${ktmFile.name}, size=${ktmFile.size} bytes, type=${ktmFile.type}`);
    console.log(`👤 User ID: ${userId}`);

    // FormData dengan file + user_id saja
    // Backend akan lakukan OCR dan return status + OCR data
    const formData = new FormData();
    formData.append('ktm_image', ktmFile);
    formData.append('user_id', userId);

    console.log('📤 Sending FormData to backend...');
    console.log('📋 FormData fields: ktm_image, user_id');
    console.log('📝 Backend akan lakukan OCR dan return status (PENDING/APPROVED/REJECTED)');

    const response = await fetch(kycEndpoint, {
      method: 'POST',
      body: formData
    });

    console.log(`📥 Response status: ${response.status}`);
    
    const result = await response.json().catch(() => ({}));
    
    if (response.ok && result?.success) {
      console.log('✅ KYC verification succeeded:', result);
      return result;
    }

    if (!response.ok) {
      console.error('❌ KYC server error:', response.status, result);
      throw new Error(result?.message || `HTTP ${response.status}: ${result?.message || 'KYC verification failed'}`);
    }

    console.error('❌ KYC verification failed:', result);
    throw new Error(result?.message || 'Verification failed');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ KYC API Error:', errorMsg);
    throw error;
  }
}
