/**
 * NgolabHub - Backend Database Final
 * Aligning with Master_Users, Affiliate_Network, Commission_Logs, and Global_Settings
 */

const SPREADSHEET_ID = '1i3K0WamGqC5goHYFWGgwQkXiGNF_4ns_SufNQvW3Vl8'; 

function getSheet(name) {
  const db = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = db.getSheetByName(name);
  if (!sheet) {
    sheet = db.insertSheet(name);
  }

  // Initialize Headers if needed
  const headers = {
    'Master_Users': ['ID', 'Nama', 'Email', 'Role', 'Status', 'KTM_URL', 'AI_Is_Telkom', 'AI_Confidence', 'AI_Reasoning', 'Referred_By', 'Join_Date', 'Points', 'Password', 'Nomor_Telepon', 'Foto_Profil'],
    'Affiliate_Network': ['UserID', 'Referral_Code', 'Level_Afiliasi', 'Total_Downline'],
    'Commission_Logs': ['LogID', 'Tanggal', 'Penerima_ID', 'Penyumbang_ID', 'Poin_Didapat'],
    'Redemption_Logs': ['LogID', 'UserID', 'Poin_Digunakan', 'VoucherID_Referensi', 'Status'],
    'Point_Logs': ['LogID', 'UserID', 'Tanggal', 'Jumlah', 'Sumber', 'Tipe'],
    'Global_Settings': ['Setting_Key', 'Setting_Value'],
    'Gamification_Stats': ['UserID', 'Total_Points', 'Cashback_Points', 'Commission_Points'],
    'AI_Insight_Data': ['LogID', 'UserID', 'Favorite_Category', 'Peak_Visit_Time', 'AI_Recommendation_Tag']
  };

  if (headers[name]) {
    const sheetHeaders = sheet.getRange(1, 1, 1, headers[name].length).getValues()[0];
    if (sheetHeaders[0] === '') {
      sheet.getRange(1, 1, 1, headers[name].length).setValues([headers[name]]);
    }
  }

  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput("Backend Ngolab Hub - Database Final Active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * JALANKAN FUNGSI INI SEKALI (KLIK RUN) DI EDITOR APPS SCRIPT
 * Untuk membuat semua tab dan MEMPERBAIKI NAMA KOLOM yang hilang/bergeser.
 */
function initializeDatabase() {
  const headers = {
    'Master_Users': ['ID', 'Nama', 'Email', 'Role', 'Status', 'KTM_URL', 'AI_Is_Telkom', 'AI_Confidence', 'AI_Reasoning', 'Referred_By', 'Join_Date', 'Points', 'Password', 'Nomor_Telepon', 'Foto_Profil'],
    'Affiliate_Network': ['UserID', 'Referral_Code', 'Level_Afiliasi', 'Total_Downline'],
    'Commission_Logs': ['LogID', 'Tanggal', 'Penerima_ID', 'Penyumbang_ID', 'Poin_Didapat'],
    'Redemption_Logs': ['LogID', 'UserID', 'Poin_Digunakan', 'VoucherID_Referensi', 'Status'],
    'Point_Logs': ['LogID', 'UserID', 'Tanggal', 'Jumlah', 'Sumber', 'Tipe'],
    'Global_Settings': ['Setting_Key', 'Setting_Value'],
    'Gamification_Stats': ['UserID', 'Total_Points', 'Cashback_Points', 'Commission_Points'],
    'AI_Insight_Data': ['LogID', 'UserID', 'Favorite_Category', 'Peak_Visit_Time', 'AI_Recommendation_Tag']
  };

  Object.keys(headers).forEach(tableName => {
    const sheet = getSheet(tableName);
    const headerRow = headers[tableName];
    
    // Memaksa tulis ulang header di baris pertama agar tidak ada kolom kosong/bergeser
    sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    
    Logger.log("Table " + tableName + " headers updated/initialized.");
  });
  
  return "Perbaikan Kolom Berhasil. Silakan cek Google Sheet Anda.";
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    let result;

    switch(action) {
      case 'login':
        result = loginUser(params.email, params.password);
        break;
      case 'register':
      case 'registerUser':
        result = registerUser(params.userData || params);
        break;
      case 'getDashboard':
        result = findUserProfile(params.userId || params.email, params.email);
        break;
      case 'getHubData':
        result = getHubData();
        break;
      case 'updateProfile':
        result = updateProfile(params.userData);
        break;
      case 'changePassword':
        result = changePassword(params.userId, params.oldPassword, params.newPassword);
        break;
      case 'updateAccountStatus':
        // Handle both old and new param names
        result = updateAccountStatus(params.userId, params.newStatus || params.status);
        break;
      case 'updateUserRoleHub':
        result = updateUserRoleHub(params.userId, params.newRole);
        break;
      case 'deleteUserHub':
        result = deleteRow(params.userId);
        break;
      case 'getAllAffiliates':
        result = getAllAffiliates();
        break;
      case 'getAllMembers':
        result = getAllMembers();
        break;
      case 'upgradeToAffiliate':
        result = upgradeToAffiliate(params);
        break;
      case 'getGlobalSettings':
        result = getGlobalSettings();
        break;
      case 'updateGlobalSetting':
        result = updateGlobalSetting(params.key, params.value);
        break;
      case 'redeemPoints':
        result = redeemPoints(params.userId, params.email, params.points, params.voucherId);
        break;
      case 'getCommissionLogs':
        result = getCommissionLogs();
        break;
      case 'syncGlobalSettings':
        result = syncGlobalSettings(params.data);
        break;
      case 'backfillAffiliateNetwork':
        result = backfillAffiliateNetwork();
        break;
      case 'backfillGamificationStats':
        result = backfillGamificationStats();
        break;
      case 'backfillAll':
        result = backfillAll();
        break;
      default:
        throw new Error("Action not found.");
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function buildJoinedUserProfile(baseUser) {
  const user = Object.assign({
    totalPoints: 0,
    cashbackPoints: 0,
    commissionPoints: 0,
    referralCode: '',
    affiliateLevel: 'Starter',
    totalDownlines: 0,
    pointLogs: []
  }, baseUser);

  const statsSheet = getSheet('Gamification_Stats');
  const statsData = statsSheet.getDataRange().getValues();
  for (let s = 1; s < statsData.length; s++) {
    if (String(statsData[s][0]) === String(user.id)) {
      user.totalPoints = Number(statsData[s][1] || 0);
      user.cashbackPoints = Number(statsData[s][2] || 0);
      user.commissionPoints = Number(statsData[s][3] || 0);
      break;
    }
  }

  const pointSheet = getSheet('Point_Logs');
  const pointData = pointSheet.getDataRange().getValues();
  user.pointLogs = [];
  for (let p = 1; p < pointData.length; p++) {
    if (String(pointData[p][1]) === String(user.id)) {
      user.pointLogs.push({
        id: String(pointData[p][0]),
        date: String(pointData[p][2]),
        amount: Number(pointData[p][3] || 0),
        source: String(pointData[p][4] || ''),
        type: String(pointData[p][5] || 'IN')
      });
    }
  }

  const commSheet = getSheet('Commission_Logs');
  const commData = commSheet.getDataRange().getValues();
  for (let c = 1; c < commData.length; c++) {
    if (String(commData[c][2]) === String(user.id)) {
      user.pointLogs.push({
        id: String(commData[c][0]),
        date: String(commData[c][1]),
        amount: Number(commData[c][4] || 0),
        source: 'Komisi Afiliasi (ID: ' + String(commData[c][3] || '-') + ')',
        type: 'IN'
      });
    }
  }

  user.pointLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (String(user.role) === 'MEMBER_AFFILIATE') {
    const affSheet = getSheet('Affiliate_Network');
    const affData = affSheet.getDataRange().getValues();
    for (let a = 1; a < affData.length; a++) {
      if (String(affData[a][0]) === String(user.id)) {
        user.referralCode = String(affData[a][1] || '');
        user.affiliateLevel = String(affData[a][2] || 'Starter');
        user.totalDownlines = Number(affData[a][3] || 0);
        break;
      }
    }
  }

  return user;
}

function findUserProfile(userIdOrEmail, fallbackEmail) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  const searchValue = String(userIdOrEmail || fallbackEmail || '').toLowerCase().trim();
  
  for (let i = 1; i < data.length; i++) {
    const rowUserId = String(data[i][0] || '').toLowerCase().trim();
    const rowEmail = String(data[i][2] || '').toLowerCase().trim();

    if (rowUserId === searchValue || rowEmail === searchValue) {
      return buildJoinedUserProfile({
        id: String(data[i][0]),
        name: String(data[i][1]),
        email: String(data[i][2]),
        role: String(data[i][3]),
        status: String(data[i][4]),
        ktm_url: String(data[i][5]),
        ai_is_telkom: data[i][6] === true || String(data[i][6]).toLowerCase() === 'true',
        ai_confidence: Number(data[i][7] || 0),
        ai_reasoning: String(data[i][8]),
        referredBy: String(data[i][9]),
        joinDate: String(data[i][10]),
        phone: String(data[i][13]),
        photoURL: String(data[i][14]),
        level: 'SILVER' // Logic for level can be derived from points later
      });
    }
  }
  return null;
}

function findUserByEmail(email) {
  return findUserProfile(email, email);
}

function registerUser(userData) {
  const sheet = getSheet('Master_Users');
  if (findUserByEmail(userData.email)) throw new Error("Email sudah terdaftar.");

  const userID = userData.id || 'U' + Math.random().toString(36).substr(2, 5).toUpperCase();
  const now = new Date();
  const referredBy = userData.referredBy || userData.referralCode || '-';

  // Logika Otomatisasi Role (Sesuai Permintaan Admin)
  let status = userData.status || (userData.role === "MEMBER" ? "ACTIVE" : "PENDING");
  let role = userData.role || "MEMBER";
  
  if (userData.ai_is_telkom === true && (userData.ai_confidence >= 0.8 || Number(userData.ai_confidence) >= 0.8)) {
    status = "ACTIVE";
    role = "MEMBER_AFFILIATE";
  }

  // Header Baru: ID, Nama, Email, Role, Status, KTM_URL, AI_Is_Telkom, AI_Confidence, AI_Reasoning, Referred_By, Join_Date, Points, Password, Nomor_Telepon, Foto_Profil
  sheet.appendRow([
    userID, 
    userData.name, 
    userData.email, 
    role, 
    status, 
    userData.ktm_url || '',
    userData.ai_is_telkom || false,
    userData.ai_confidence || 0,
    userData.ai_reasoning || '',
    referredBy, 
    now, 
    0, // Points
    userData.password || '',
    userData.phone || '', 
    userData.photoURL || ''
  ]);

  // Gamification Stats
  const statsSheet = getSheet('Gamification_Stats');
  statsSheet.appendRow([userID, 0, 0, 0]);

  // If final role is affiliate, make sure Affiliate_Network is also populated.
  if (role === 'MEMBER_AFFILIATE') {
    const affSheet = getSheet('Affiliate_Network');
    const personalReferralCode = 'NGOLAB-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    affSheet.appendRow([userID, personalReferralCode, 'Starter', 0]);
  }

  // Jika registrasi memakai referral code, berikan komisi ke pemilik kode (affiliate aktif).
  applyReferralCommission(userID, referredBy);

  // Safety: ensure gamification stats & affiliate network rows are populated
  try {
    backfillGamificationStats();
    if (role === 'MEMBER_AFFILIATE') {
      backfillAffiliateNetwork();
    }
  } catch(e) {
    Logger.log('Backfill warning during registerUser: ' + e.toString());
  }

  return findUserByEmail(userData.email);
}

function applyReferralCommission(newUserId, referralCodeInput) {
  const referralCode = String(referralCodeInput || '').trim();
  if (!referralCode || referralCode === '-') return;

  const affSheet = getSheet('Affiliate_Network');
  const affData = affSheet.getDataRange().getValues();

  let affiliateRow = -1;
  let affiliateUserId = '';
  for (let i = 1; i < affData.length; i++) {
    if (String(affData[i][1]).trim().toUpperCase() === referralCode.toUpperCase()) {
      affiliateRow = i + 1;
      affiliateUserId = String(affData[i][0]);
      break;
    }
  }

  // Kode referral tidak ditemukan: abaikan agar proses register tetap berhasil.
  if (affiliateRow === -1 || !affiliateUserId) return;
  if (affiliateUserId === String(newUserId)) return;

  // Pastikan pemilik referral adalah MEMBER_AFFILIATE yang aktif.
  const masterSheet = getSheet('Master_Users');
  const masterData = masterSheet.getDataRange().getValues();
  let ownerRole = '';
  let ownerStatus = '';
  for (let m = 1; m < masterData.length; m++) {
    if (String(masterData[m][0]) === affiliateUserId) {
      ownerRole = String(masterData[m][3]);
      ownerStatus = String(masterData[m][4]);
      break;
    }
  }
  if (ownerRole !== 'MEMBER_AFFILIATE' || ownerStatus !== 'ACTIVE') return;

  // Tambah total downline lalu hitung level affiliate terbaru.
  const currentDownlines = Number(affSheet.getRange(affiliateRow, 4).getValue() || 0);
  const updatedDownlines = currentDownlines + 1;
  const updatedLevel = getAffiliateLevelByDownlines(updatedDownlines);
  affSheet.getRange(affiliateRow, 3).setValue(updatedLevel);
  affSheet.getRange(affiliateRow, 4).setValue(updatedDownlines);

  // Hitung komisi berdasarkan level dan aturan Global_Settings.
  const commissionPoints = calculateReferralCommissionPoints(updatedLevel);
  if (commissionPoints <= 0) {
    SpreadsheetApp.flush();
    return;
  }

  // Update poin komisi di Gamification_Stats.
  const statsSheet = getSheet('Gamification_Stats');
  const statsData = statsSheet.getDataRange().getValues();
  let statsRow = -1;
  for (let s = 1; s < statsData.length; s++) {
    if (String(statsData[s][0]) === affiliateUserId) {
      statsRow = s + 1;
      break;
    }
  }

  if (statsRow === -1) {
    statsSheet.appendRow([affiliateUserId, 0, 0, commissionPoints]);
  } else {
    const currentCommission = Number(statsSheet.getRange(statsRow, 4).getValue() || 0);
    statsSheet.getRange(statsRow, 4).setValue(currentCommission + commissionPoints);
  }

  // Simpan jejak komisi untuk admin & user history.
  const commSheet = getSheet('Commission_Logs');
  const logId = 'CL' + Math.random().toString(36).substr(2, 6).toUpperCase();
  commSheet.appendRow([logId, new Date().toISOString(), affiliateUserId, String(newUserId), commissionPoints]);

  SpreadsheetApp.flush();
}

function getAffiliateLevelByDownlines(totalDownlines) {
  const settings = getGlobalSettings();
  const minPro = Number(settings.affiliate_level_pro_min_downlines || 10);
  const minElite = Number(settings.affiliate_level_elite_min_downlines || 30);

  if (totalDownlines >= minElite) return 'Elite';
  if (totalDownlines >= minPro) return 'Pro';
  return 'Starter';
}

function calculateReferralCommissionPoints(affiliateLevel) {
  const settings = getGlobalSettings();
  const basePoints = Number(settings.affiliate_referral_base_points || 1000);

  const defaultRateByLevel = {
    Starter: 2,
    Pro: 5,
    Elite: 10
  };

  const normalizedLevel = String(affiliateLevel || 'Starter');
  const levelRateKeyMap = {
    Starter: 'affiliate_commission_rate_starter',
    Pro: 'affiliate_commission_rate_pro',
    Elite: 'affiliate_commission_rate_elite'
  };

  const levelRateSetting = Number(settings[levelRateKeyMap[normalizedLevel]]);
  const globalFallbackRate = Number(settings.affiliate_commission_rate);
  const defaultRate = Number(defaultRateByLevel[normalizedLevel] || defaultRateByLevel.Starter);

  const commissionRate = !isNaN(levelRateSetting) && levelRateSetting >= 0
    ? levelRateSetting
    : (!isNaN(globalFallbackRate) && globalFallbackRate >= 0 ? globalFallbackRate : defaultRate);

  return Math.max(0, Math.round(basePoints * commissionRate / 100));
}

function loginUser(email, password) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  const searchEmail = email.toString().toLowerCase().trim();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][2].toString().toLowerCase().trim() === searchEmail) {
      if (String(data[i][12]) === String(password)) {
        return findUserByEmail(email);
      } else {
        throw new Error("Password salah.");
      }
    }
  }
  throw new Error("Email tidak ditemukan.");
}

function updateProfile(userData) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === userData.id) {
      // Update fields: Nama, Nomor_Telepon, Foto_Profil
      sheet.getRange(i + 1, 2).setValue(userData.name); 
      sheet.getRange(i + 1, 14).setValue(userData.phone); 
      sheet.getRange(i + 1, 15).setValue(userData.photoURL); 
      SpreadsheetApp.flush();
      return findUserByEmail(userData.email);
    }
  }
  throw new Error("User tidak ditemukan.");
}

function changePassword(userId, oldPass, newPass) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === userId) {
      if (String(data[i][12]) === String(oldPass)) {
        sheet.getRange(i + 1, 13).setValue(newPass);
        return "Berhasil";
      } else throw new Error("Kata sandi lama salah.");
    }
  }
  throw new Error("User tidak ditemukan.");
}

function updateAccountStatus(userId, newStatus) {
  return updateField(userId, 5, newStatus); // Col 5 is Status
}

function updateUserRoleHub(userId, newRole) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      sheet.getRange(i + 1, 4).setValue(newRole);

      // Jangan hapus relasi lama. Jika dijadikan affiliate, pastikan tabel pendukung ikut terisi.
      if (String(newRole) === 'MEMBER_AFFILIATE') {
        ensureAffiliateNetworkRow(userId, String(data[i][1] || ''), String(data[i][4] || 'ACTIVE'));
        ensureGamificationStatsRow(userId);
      }

      SpreadsheetApp.flush();
      return true;
    }
  }

  throw new Error('User tidak ditemukan.');
}

function ensureAffiliateNetworkRow(userId, fallbackReferralSeed, currentStatus) {
  const affSheet = getSheet('Affiliate_Network');
  const affData = affSheet.getDataRange().getValues();

  for (let i = 1; i < affData.length; i++) {
    if (String(affData[i][0]) === String(userId)) {
      if (!affData[i][1]) {
        const referralCode = 'NGOLAB-' + String(fallbackReferralSeed || userId).slice(-4).toUpperCase();
        affSheet.getRange(i + 1, 2).setValue(referralCode);
      }
      if (!affData[i][2]) {
        affSheet.getRange(i + 1, 3).setValue('Starter');
      }
      if (!affData[i][3] && affData[i][3] !== 0) {
        affSheet.getRange(i + 1, 4).setValue(0);
      }
      return;
    }
  }

  const referralCode = 'NGOLAB-' + String(fallbackReferralSeed || userId).slice(-4).toUpperCase();
  affSheet.appendRow([userId, referralCode, 'Starter', 0]);
}

function ensureGamificationStatsRow(userId) {
  const statsSheet = getSheet('Gamification_Stats');
  const statsData = statsSheet.getDataRange().getValues();

  for (let i = 1; i < statsData.length; i++) {
    if (String(statsData[i][0]) === String(userId)) {
      return;
    }
  }

  statsSheet.appendRow([userId, 0, 0, 0]);
}

/**
 * BACKFILL: Scan Master_Users untuk user dengan role MEMBER_AFFILIATE yang tidak ada di Affiliate_Network
 * Auto-create missing rows dengan referral code dan default level 'Starter'.
 * Preserve semua existing data, hanya tambah yang missing.
 */
function backfillAffiliateNetwork() {
  const masterSheet = getSheet('Master_Users');
  const affSheet = getSheet('Affiliate_Network');
  
  const masterData = masterSheet.getDataRange().getValues();
  const affData = affSheet.getDataRange().getValues();
  
  // Build set of existing userID di Affiliate_Network
  const existingAffiliates = {};
  for (let i = 1; i < affData.length; i++) {
    existingAffiliates[String(affData[i][0])] = true;
  }
  
  let backfilledCount = 0;
  
  // Scan Master_Users untuk MEMBER_AFFILIATE yang missing
  for (let i = 1; i < masterData.length; i++) {
    const userID = String(masterData[i][0]);
    const role = String(masterData[i][3]);
    
    if (role === 'MEMBER_AFFILIATE' && !existingAffiliates[userID]) {
      // User adalah MEMBER_AFFILIATE tapi tidak ada di Affiliate_Network → create
      const referralCode = 'NGOLAB-' + userID.slice(-4).toUpperCase();
      affSheet.appendRow([userID, referralCode, 'Starter', 0]);
      backfilledCount++;
      Logger.log('Backfilled Affiliate_Network for user: ' + userID);
    }
  }
  
  SpreadsheetApp.flush();
  return {
    action: 'backfillAffiliateNetwork',
    backfilledCount: backfilledCount,
    message: backfilledCount + ' missing affiliate row(s) created.'
  };
}

/**
 * BACKFILL: Scan Master_Users untuk user yang tidak ada di Gamification_Stats
 * Auto-create missing stats row dengan default 0 points.
 * Preserve semua existing data, hanya tambah yang missing.
 */
function backfillGamificationStats() {
  const masterSheet = getSheet('Master_Users');
  const statsSheet = getSheet('Gamification_Stats');
  
  const masterData = masterSheet.getDataRange().getValues();
  const statsData = statsSheet.getDataRange().getValues();
  
  // Build set of existing userID di Gamification_Stats
  const existingStats = {};
  for (let i = 1; i < statsData.length; i++) {
    existingStats[String(statsData[i][0])] = true;
  }
  
  let backfilledCount = 0;
  
  // Scan Master_Users untuk user yang missing di stats
  for (let i = 1; i < masterData.length; i++) {
    const userID = String(masterData[i][0]);
    
    if (!existingStats[userID]) {
      // User tidak ada di Gamification_Stats → create dengan 0 points
      statsSheet.appendRow([userID, 0, 0, 0]);
      backfilledCount++;
      Logger.log('Backfilled Gamification_Stats for user: ' + userID);
    }
  }
  
  SpreadsheetApp.flush();
  return {
    action: 'backfillGamificationStats',
    backfilledCount: backfilledCount,
    message: backfilledCount + ' missing stats row(s) created.'
  };
}

/**
 * BACKFILL: Run semua backfill functions sekaligus.
 * Returns summary untuk kedua backfill (affiliate + gamification stats).
 */
function backfillAll() {
  try {
    const affResult = backfillAffiliateNetwork();
    const statsResult = backfillGamificationStats();
    
    return {
      success: true,
      affiliate: affResult,
      stats: statsResult,
      totalBackfilled: affResult.backfilledCount + statsResult.backfilledCount
    };
  } catch (e) {
    Logger.log('Error in backfillAll: ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}


function upgradeToAffiliate(userData) {
  const email = userData.email;
  const user = findUserByEmail(email);
  if (!user) throw new Error("User tidak ditemukan.");
  if (user.role === 'MEMBER_AFFILIATE') throw new Error("User sudah menjadi Afiliasi.");

  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === user.id) {
      // Update Row: Role(3), Status(4), KTM_URL(5), AI_Is_Telkom(6), AI_Confidence(7), AI_Reasoning(8)
      sheet.getRange(i + 1, 4).setValue('MEMBER_AFFILIATE'); 
      sheet.getRange(i + 1, 5).setValue('ACTIVE');
      sheet.getRange(i + 1, 6).setValue(userData.ktm_url || '');
      sheet.getRange(i + 1, 7).setValue(userData.ai_is_telkom || false);
      sheet.getRange(i + 1, 8).setValue(userData.ai_confidence || 0);
      sheet.getRange(i + 1, 9).setValue(userData.ai_reasoning || '');
      break;
    }
  }

  const affSheet = getSheet('Affiliate_Network');
  // Check if already in affiliate_network
  const affData = affSheet.getDataRange().getValues();
  let alreadyInAff = false;
  for(let a=1; a<affData.length; a++) {
    if(String(affData[a][0]) === user.id) {
      alreadyInAff = true;
      break;
    }
  }

  if (!alreadyInAff) {
    const personalReferralCode = 'NGOLAB-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    affSheet.appendRow([user.id, personalReferralCode, 'Starter', 0]);
  }

  SpreadsheetApp.flush();
  return findUserByEmail(email);
}

function getAllAffiliates() {
  const sheet = getSheet('Affiliate_Network');
  const data = sheet.getDataRange().getValues();
  const masterSheet = getSheet('Master_Users');
  const masterData = masterSheet.getDataRange().getValues();
  
  const results = [];
  const included = {};

  // Base list from Affiliate_Network
  for (let i = 1; i < data.length; i++) {
    const userID = String(data[i][0]);
    let name = '';
    let email = '';
    let status = '';
    let role = '';
    let ktmUrl = '';

    for(let j=1; j<masterData.length; j++) {
      if(String(masterData[j][0]) === userID) {
        name = String(masterData[j][1]);
        email = String(masterData[j][2]);
        role = String(masterData[j][3]);
        status = String(masterData[j][4]); // Status is index 4
        ktmUrl = String(masterData[j][5] || '');
        break;
      }
    }

    if (!role || role === 'MEMBER_AFFILIATE') {
      results.push({
        id: userID,
        name: name,
        email: email,
        referralCode: String(data[i][1]),
        affiliateLevel: String(data[i][2]),
        totalDownline: Number(data[i][3]),
        status: status,
        ktmUrl: ktmUrl
      });
      included[userID] = true;
    }
  }

  // Safety net: also include users with role MEMBER_AFFILIATE from Master_Users
  // even if their Affiliate_Network row is missing.
  for (let i = 1; i < masterData.length; i++) {
    const userID = String(masterData[i][0]);
    const role = String(masterData[i][3]);
    if (role !== 'MEMBER_AFFILIATE' || included[userID]) continue;

    const referralCode = 'NGOLAB-' + userID.slice(-4).toUpperCase();
    results.push({
      id: userID,
      name: String(masterData[i][1]),
      email: String(masterData[i][2]),
      referralCode: referralCode,
      affiliateLevel: 'Starter',
      totalDownline: 0,
      status: String(masterData[i][4]),
      ktmUrl: String(masterData[i][5] || '')
    });

    // Backfill missing Affiliate_Network row so next requests are consistent.
    sheet.appendRow([userID, referralCode, 'Starter', 0]);
    included[userID] = true;
  }

  return results;
}

function getAllMembers() {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  const results = [];
  for (let i = 1; i < data.length; i++) {
    results.push({
      id: String(data[i][0]),
      name: String(data[i][1]),
      email: String(data[i][2]),
      role: String(data[i][3]), // Role is index 3
      status: String(data[i][4]), // Status is index 4
      joinDate: String(data[i][10])
    });
  }
  return results;
}

function getGlobalSettings() {
  const sheet = getSheet('Global_Settings');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function updateGlobalSetting(key, value) {
  const sheet = getSheet('Global_Settings');
  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([key, value]);
  }
  SpreadsheetApp.flush();
  return true;
}

function redeemPoints(userId, email, points, voucherId) {
  const statsSheet = getSheet('Gamification_Stats');
  const statsData = statsSheet.getDataRange().getValues();
  
  let userRow = -1;
  let currentCommissionPoints = 0;
  
  for (let s = 1; s < statsData.length; s++) {
    if (String(statsData[s][0]) === userId) {
      userRow = s + 1;
      currentCommissionPoints = Number(statsData[s][3] || 0);
      break;
    }
  }
  
  if (userRow === -1) throw new Error("Stats user tidak ditemukan.");
  if (currentCommissionPoints < points) throw new Error("Poin komisi tidak mencukupi.");
  
  // Deduct points
  statsSheet.getRange(userRow, 4).setValue(currentCommissionPoints - points);
  
  // Log redemption
  const redeemSheet = getSheet('Redemption_Logs');
  const logId = 'RL' + Math.random().toString(36).substr(2, 5).toUpperCase();
  const now = new Date().toISOString();
  
  // Redemption_Logs: LogID, UserID, Poin_Digunakan, VoucherID_Referensi, Status
  redeemSheet.appendRow([logId, userId, points, voucherId, 'SUCCESS']);
  
  SpreadsheetApp.flush();
  return findUserByEmail(email);
}

function getCommissionLogs() {
  const sheet = getSheet('Commission_Logs');
  const data = sheet.getDataRange().getValues();

  if (!data || data.length < 2) {
    return [];
  }

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = row[index];
    });
    return entry;
  });
}

// --- LOGIKA UNTUK PROJECT ADMIN HUB (MANAJEMEN) ---
function getHubData() {
  const sheet = getSheet('Master_Users');
  const rawData = sheet.getDataRange().getValues();
  const statsSheet = getSheet('Gamification_Stats');
  const statsData = statsSheet.getDataRange().getValues();

  return { 
    members: formatData(rawData, statsData), 
    stats: getStats(rawData) 
  };
}

function updateField(userId, column, newValue) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === userId) {
      sheet.getRange(i + 1, column).setValue(newValue);
      SpreadsheetApp.flush();
      return true;
    }
  }
  throw new Error("User tidak ditemukan.");
}

function deleteRow(userId) {
  const sheet = getSheet('Master_Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === userId) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return true;
    }
  }
  throw new Error("User tidak ditemukan.");
}

function formatData(rawData, statsData) {
  const headers = rawData[0];
  const members = [];

  const statsByUserId = {};
  if (statsData && statsData.length > 1) {
    for (let s = 1; s < statsData.length; s++) {
      const userId = String(statsData[s][0] || '');
      if (!userId) continue;

      statsByUserId[userId] = {
        totalPoints: Number(statsData[s][1] || 0),
        cashbackPoint: Number(statsData[s][2] || 0),
        commissionPoints: Number(statsData[s][3] || 0)
      };
    }
  }

  for (let i = 1; i < rawData.length; i++) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.toLowerCase()] = rawData[i][index];
    });

    const userId = String(rawData[i][0] || '');
    const stat = statsByUserId[userId] || { totalPoints: 0, cashbackPoint: 0, commissionPoints: 0 };

    obj.total_points = stat.totalPoints;
    obj.cashback_point = stat.cashbackPoint;
    obj.cashback_points = stat.cashbackPoint;
    obj.commission_points = stat.commissionPoints;
    obj.points = stat.totalPoints;

    members.push(obj);
  }
  return members;
}

function getStats(rawData) {
  let totalMembers = 0;
  let activeMembers = 0;
  let pendingMembers = 0;
  let affiliates = 0;

  for (let i = 1; i < rawData.length; i++) {
    totalMembers++;
    const role = String(rawData[i][3]);
    const status = String(rawData[i][4]);
    
    if (status === 'ACTIVE') activeMembers++;
    if (status === 'PENDING') pendingMembers++;
    if (role === 'MEMBER_AFFILIATE') affiliates++;
  }

  return {
    totalMembers,
    activeMembers,
    pendingMembers,
    affiliates
  };
}

/**
 * Sinkronisasi Global Settings untuk Komisi (Starter, Pro, Elite)
 * Dipanggil dari tombol 'Deploy & Safe Protocol' di Admin Control Center
 * Data yang diterima harus menggunakan key: affiliate_commission_rate_starter, affiliate_commission_rate_pro, affiliate_commission_rate_elite
 */
function syncGlobalSettings(data) {
  if (!data) {
    throw new Error("Data is required for syncGlobalSettings");
  }

  try {
    // Update semua 3 settings komisi sekaligus dengan key yang benar
    // Key harus sesuai dengan yang digunakan di calculateReferralCommissionPoints()
    updateGlobalSetting('affiliate_commission_rate_starter', data.affiliate_commission_rate_starter);
    updateGlobalSetting('affiliate_commission_rate_pro', data.affiliate_commission_rate_pro);
    updateGlobalSetting('affiliate_commission_rate_elite', data.affiliate_commission_rate_elite);

    SpreadsheetApp.flush();

    Logger.log('Global settings synced - Starter: ' + data.affiliate_commission_rate_starter + 
               '% | Pro: ' + data.affiliate_commission_rate_pro + 
               '% | Elite: ' + data.affiliate_commission_rate_elite + '%');

    return {
      success: true,
      message: 'Global settings synchronized successfully',
      data: {
        affiliate_commission_rate_starter: data.affiliate_commission_rate_starter,
        affiliate_commission_rate_pro: data.affiliate_commission_rate_pro,
        affiliate_commission_rate_elite: data.affiliate_commission_rate_elite
      }
    };
  } catch (error) {
    Logger.log('Error in syncGlobalSettings: ' + error);
    throw new Error('Failed to sync global settings: ' + error.toString());
  }
}
