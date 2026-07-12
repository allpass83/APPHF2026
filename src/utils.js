const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createRoomCode(length = 6) {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * ROOM_CHARS.length);
    return ROOM_CHARS[index];
  }).join('');
}

export function normalizeRoomCode(value = '') {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function getVoteCounts(votes = {}) {
  const counts = { 1: 0, 2: 0, 3: 0 };

  Object.values(votes || {}).forEach((vote) => {
    if (vote?.choice && counts[vote.choice] !== undefined) {
      counts[vote.choice] += 1;
    }
  });

  return counts;
}

export function getFriendlyError(error) {
  const code = error?.code || '';

  if (code.includes('permission-denied')) return '沒有操作權限，請確認 Firebase 規則已部署。';
  if (code.includes('auth/operation-not-allowed')) return '請先在 Firebase Authentication 啟用匿名登入。';
  if (code.includes('auth/network-request-failed')) return '網路連線失敗，請稍後再試。';
  return error?.message || '發生未知錯誤。';
}
