import { API_BASE_URL } from '../constants';

/**
 * Normalize backend response to frontend format
 * Backend fields (per backend team):
 * - totalReferrals → total referral (dari affiliate_networks.total_referrals)
 * - totalDownlines → total downlines (alias untuk totalReferrals)
 * - totalCommission → commission points (dari affiliate_networks.commission_points)
 * - totalPoints → total poin affiliate (dari affiliate_networks.total_points)
 * - affiliateTier → affiliate tier/level
 * - referralCode → kode referral user
 * - affiliateId → ID di affiliate_networks table
 * 
 * Normalize tier: "Basic" → "Starter", "Pro" → "Pro", "Elite" → "Elite"
 */
const normalizeAffiliateResponse = (data: any): any => {
  if (!data) return data;
  
  console.log('📥 Backend response data:', data);
  
  // Handle different tier field names from backend
  let tier = data.affiliateTier || data.affiliateLevel || data.level || 'Basic';
  
  const tierMap: Record<string, string> = {
    'Basic': 'Starter',
    'Starter': 'Starter',
    'Pro': 'Pro',
    'Elite': 'Elite'
  };
  
  // Normalize response format - map backend fields to frontend format
  const normalized = {
    // Backend send totalReferrals & totalDownlines (both refer to same value)
    // Frontend use totalDownlines consistently
    totalDownlines: data.totalDownlines || data.totalReferrals || 0,
    
    // Backend send totalCommission (not commissionPoints)
    totalCommission: data.totalCommission || 0,
    
    // Backend send totalPoints
    totalPoints: data.totalPoints || 0,
    
    // Tier mapping
    affiliateLevel: tierMap[tier] || 'Starter',
    
    // Referral code & affiliate ID
    referralCode: data.referralCode || '',
    affiliateId: data.affiliateId || '',
    
    // Keep all original fields for debugging
    ...data
  };
  
  console.log('✅ Normalized affiliate data:', normalized);
  return normalized;
};


// FUNGSI HELPER UNTUK MENDAPATKAN HEADER OTENTIKASI
const getAuthHeaders = (skipConnectionKey = false) => {
  const token = localStorage.getItem('jwtToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!skipConnectionKey) {
    headers['X-Connection-Key'] = 'kw7ZPgN5A8Y7';
  }
  return headers;
};

/**
 * Central Backend API URL - untuk KYC verification (OCR processing)
 * Diambil dari .env file: VITE_CENTRAL_API_URL
 * Default: http://localhost:4000 (jika tidak ada di .env)
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
  
// Fallback ke IP 10.128.26.247 jika tidak ada .env (per backend team)
   const fallbackUrl = 'http://10.128.26.247:4000';
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
       body: formData,
       headers: getAuthHeaders()
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

/**
 * Get Affiliate Network Data from affiliate_networks table
 * 
 * Field Mapping (from affiliate_networks table):
 * - total_referrals → totalDownlines
 * - commission_points → totalCommission (NOT user.commissionPoints)
 * - total_points → totalPoints (NOT user.totalPoints from user_points table)
 * - affiliate_tier → affiliateLevel
 * 
 * @param userId - User ID dari affiliate
 * @returns affiliate network object with downlines, commission, points from affiliate_networks
 */

export async function getAffiliateNetwork(userId: string) {
  try {
    const centralApiUrl = getCentralApiUrl();
    const endpoint = `${centralApiUrl}/api/membership/affiliate/network/${userId}`;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📡 FETCHING AFFILIATE NETWORK DATA`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🔗 Endpoint: ${endpoint}`);
    console.log(`👤 User ID: ${userId}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    console.log(`📤 Sending GET request with headers:`, headers);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    console.log(`\n📥 RESPONSE RECEIVED`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, {
      'content-type': response.headers.get('content-type'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin')
    });
    
    let result: any;
    try {
      result = await response.json();
      console.log(`📦 Raw JSON Response:`, result);
    } catch (err) {
      console.error('❌ Failed to parse JSON response:', err);
      console.log(`📄 Response text:`, await response.text());
      return null;
    }
    
    // Check for success
    if (response.ok) {
      console.log(`✅ Response OK (2xx status)`);
      
      // Handle wrapped format: {success: true, data: {...}}
      if (result?.data) {
        console.log(`📦 Response format: WRAPPED {data: {...}}`);
        const normalizedData = normalizeAffiliateResponse(result.data);
        console.log(`✅ Affiliate network fetched successfully:`, normalizedData);
        return normalizedData;
      } 
      // Handle direct format: {...}
      else if (result) {
        console.log(`📦 Response format: DIRECT {...}`);
        const normalizedData = normalizeAffiliateResponse(result);
        console.log(`✅ Affiliate network fetched successfully:`, normalizedData);
        return normalizedData;
      }
    }
    
    // Handle errors
    console.warn(`${'='.repeat(60)}`);
    console.warn(`❌ NETWORK FETCH FAILED`);
    console.warn(`${'='.repeat(60)}`);
    console.warn(`Status: ${response.status} ${response.statusText}`);
    console.warn(`Response:`, result);
    
    if (response.status === 403 || response.status === 401) {
      console.error(`🔒 Auth Error - Check if token is valid or if endpoint requires auth`);
    }
    if (response.status === 404) {
      console.error(`🚫 Endpoint not found - Verify backend URL and endpoint path`);
    }
    
    return null;
  } catch (error) {
    console.warn(`${'='.repeat(60)}`);
    console.error(`❌ FETCH EXCEPTION ERROR`);
    console.warn(`${'='.repeat(60)}`);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error type: ${error instanceof TypeError ? 'NETWORK/CORS' : 'OTHER'}`);
    console.error(`Error message: ${errorMsg}`);
    console.error(`Full error:`, error);
    
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS')) {
      console.error(`\n🌐 CORS TROUBLESHOOTING:`);
      console.error(`   1. Check browser console for CORS error message`);
      console.error(`   2. Backend team should add frontend origin to FRONTEND_ORIGIN env var`);
      console.error(`   3. Current frontend origin: ${window.location.origin}`);
    }
    
    return null;
  }
}

/**
 * Get Affiliate Stats Summary
 * 
 * Field Mapping (from affiliate_networks table):
 * - total_referrals → totalDownlines
 * - commission_points → totalCommission (NOT user.commissionPoints)
 * - total_points → totalPoints (NOT user.totalPoints from user_points table)
 * 
 * @param userId - User ID dari affiliate
 * @returns affiliate stats object from affiliate_networks
 */

export async function getAffiliateStats(userId: string) {
  try {
    const centralApiUrl = getCentralApiUrl();
    const endpoint = `${centralApiUrl}/api/membership/affiliate/stats/${userId}`;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 FETCHING AFFILIATE STATS (FALLBACK)`);
    console.log(`${'='.repeat(60)}`);
    console.log(`🔗 Endpoint: ${endpoint}`);
    console.log(`👤 User ID: ${userId}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    console.log(`\n📥 RESPONSE RECEIVED`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, {
      'content-type': response.headers.get('content-type'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin')
    });
    
    let result: any;
    try {
      result = await response.json();
      console.log(`📦 Raw JSON Response:`, result);
    } catch (err) {
      console.error('❌ Failed to parse JSON response:', err);
      return null;
    }
    
    if (response.ok) {
      console.log(`✅ Response OK (2xx status)`);
      
      if (result?.data) {
        console.log(`📦 Response format: WRAPPED {data: {...}}`);
        const normalizedData = normalizeAffiliateResponse(result.data);
        console.log('✅ Affiliate stats fetched successfully:', normalizedData);
        return normalizedData;
      } else if (result) {
        console.log(`📦 Response format: DIRECT {...}`);
        const normalizedData = normalizeAffiliateResponse(result);
        console.log('✅ Affiliate stats fetched successfully:', normalizedData);
        return normalizedData;
      }
    }
    
    console.warn(`${'='.repeat(60)}`);
    console.warn(`❌ STATS FETCH FAILED`);
    console.warn(`${'='.repeat(60)}`);
    console.warn(`Status: ${response.status} ${response.statusText}`);
    console.warn(`Response:`, result);
    return null;
  } catch (error) {
    console.warn(`${'='.repeat(60)}`);
    console.error(`❌ STATS FETCH EXCEPTION`);
    console.warn(`${'='.repeat(60)}`);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error message: ${errorMsg}`);
    console.error(`Full error:`, error);
    return null;
  }
}