import { API_BASE_URL } from '../constants';

// KYC Server URL - untuk OCR processing
// Use localhost for development, 172.20.10.2 for production network
const getKycServerUrl = () => {
  if (typeof window !== 'undefined') {
    const kycUrl = process.env.REACT_APP_KYC_SERVER_URL;
    if (kycUrl) return kycUrl;
    
    // Auto-detect: localhost for dev, IP for production
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:5001';
    } else {
      // For network access, use 172.20.10.2
      return 'http://172.20.10.2:5001';
    }
  }
  return 'http://localhost:5001';
};

/**
 * Verify KTM via KYC Server (OCR processing)
 * - Sends multipart/form-data dengan file asli (bukan base64)
 * - KYC server melakukan OCR dan forward ke central backend
 * - Returns verification result dengan auto-approval status
 * 
 * @param userId - User ID
 * @param ktmFile - File object (File atau Blob) dari input file
 */
export async function verifyAffiliateKtm(userId: string, ktmFile: File) {
  try {
    const kycServerUrl = getKycServerUrl();
    console.log(`📤 Sending to KYC Server: ${kycServerUrl}/api/affiliate/kyc/verify`);
    console.log(`📦 File info: name=${ktmFile.name}, size=${ktmFile.size} bytes, type=${ktmFile.type}`);

    // Buat FormData dengan file asli (bukan base64)
    const formData = new FormData();
    formData.append('ktm_image', ktmFile);  // Nama field: ktm_image
    formData.append('user_id', userId);

    console.log('📤 Sending FormData with multipart/form-data...');

    const response = await fetch(`${kycServerUrl}/api/affiliate/kyc/verify`, {
      method: 'POST',
      body: formData
      // PENTING: JANGAN set Content-Type header manual
      // Browser akan otomatis set Content-Type: multipart/form-data dengan boundary yang benar
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
