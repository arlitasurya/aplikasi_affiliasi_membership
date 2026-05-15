import { API_BASE_URL } from '../constants';

const uploadCandidates = [
  '/api/membership/affiliate/verify',
  '/api/affiliate/kyc/verify'
];

export async function verifyAffiliateKtm(userId: string, ktmFile: File) {
  const makeFormData = () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('ktm_image', ktmFile);
    return formData;
  };

  let lastError: string | null = null;

  for (const path of uploadCandidates) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        body: makeFormData(),
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success !== false) {
        return result;
      }

      lastError = result?.message || `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown upload error';
    }
  }

  throw new Error(lastError || 'Gagal mengirim KTM ke backend');
}
