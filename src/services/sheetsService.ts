import { getAccessToken } from './firebase';
import { LeaderboardRecord } from '../types/ecosystem';

const SPREADSHEET_TITLE = '생태계_평형_시뮬레이션_기록부';
const SHEET_TAB_NAME = '기록목록';
const LOCAL_STORAGE_RECORDS_KEY = 'ecosystem_local_records';
const LOCAL_STORAGE_SHEET_ID_KEY = 'ecosystem_spreadsheet_id';

export interface SheetRecordRow {
  rowIndex: number; // 1-indexed row in sheet
  id: string;
  createdAt: string;
  playerName: string;
  modeKorean: string;
  organismsSummary: string;
  survivalSeconds: number;
  formattedTime: string;
  balanceScore: number;
}

/**
 * Searches user's Google Drive for existing spreadsheet, or creates one.
 */
export async function getOrCreateSpreadsheet(): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 로그인이 필요합니다.');
  }

  // 1. Check cached spreadsheet ID
  const cachedId = localStorage.getItem(LOCAL_STORAGE_SHEET_ID_KEY);
  if (cachedId) {
    try {
      const testRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cachedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (testRes.ok) {
        return {
          id: cachedId,
          url: `https://docs.google.com/spreadsheets/d/${cachedId}/edit`,
        };
      }
    } catch {
      // invalid or inaccessible, proceed to search
    }
  }

  // 2. Search Drive for existing file
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
      SPREADSHEET_TITLE
    )}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const found = searchData.files[0];
        localStorage.setItem(LOCAL_STORAGE_SHEET_ID_KEY, found.id);
        return {
          id: found.id,
          url: found.webViewLink || `https://docs.google.com/spreadsheets/d/${found.id}/edit`,
        };
      }
    }
  } catch (err) {
    console.warn('Drive search error, falling back to create:', err);
  }

  // 3. Create a new Spreadsheet with header row
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: '기록ID' } },
                    { userEnteredValue: { stringValue: '등록일시' } },
                    { userEnteredValue: { stringValue: '플레이어 이름' } },
                    { userEnteredValue: { stringValue: '시뮬레이션 모드' } },
                    { userEnteredValue: { stringValue: '구성 생물' } },
                    { userEnteredValue: { stringValue: '생존시간(초)' } },
                    { userEnteredValue: { stringValue: '기록(분:초)' } },
                    { userEnteredValue: { stringValue: '평형유지점수' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || '구글 시트 생성에 실패했습니다.');
  }

  const createdData = await createRes.json();
  const newId = createdData.spreadsheetId;
  localStorage.setItem(LOCAL_STORAGE_SHEET_ID_KEY, newId);

  return {
    id: newId,
    url: createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newId}/edit`,
  };
}

/**
 * Saves a simulation record to both LocalStorage and Google Sheets (if token present).
 */
export async function saveRecord(record: LeaderboardRecord): Promise<{ syncedToSheets: boolean; sheetUrl?: string }> {
  // Always save locally first
  const localList = getLocalRecords();
  const updatedList = [record, ...localList.filter((r) => r.id !== record.id)];
  localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(updatedList));

  const token = await getAccessToken();
  if (!token) {
    return { syncedToSheets: false };
  }

  try {
    const sheetInfo = await getOrCreateSpreadsheet();
    const rowValues = [
      record.id,
      record.createdAt,
      record.playerName,
      record.modeKorean,
      record.organismsSummary,
      record.survivalSeconds,
      record.formattedTime,
      record.balanceScore,
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!appendRes.ok) {
      console.error('Failed to append to sheet:', await appendRes.text());
      return { syncedToSheets: false };
    }

    return { syncedToSheets: true, sheetUrl: sheetInfo.url };
  } catch (err) {
    console.error('Sheet sync error:', err);
    return { syncedToSheets: false };
  }
}

/**
 * Loads records from Google Sheets if available, or returns local storage records.
 */
export async function fetchLeaderboard(): Promise<{
  records: LeaderboardRecord[];
  fromSheet: boolean;
  sheetUrl?: string;
}> {
  const token = await getAccessToken();
  const local = getLocalRecords();

  if (!token) {
    return { records: local, fromSheet: false };
  }

  try {
    const sheetInfo = await getOrCreateSpreadsheet();
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}/values/${encodeURIComponent(
      SHEET_TAB_NAME
    )}!A2:H500`;

    const res = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { records: local, fromSheet: false, sheetUrl: sheetInfo.url };
    }

    const data = await res.json();
    const rows: any[][] = data.values || [];

    const sheetRecords: LeaderboardRecord[] = rows
      .map((row, index) => {
        if (!row || row.length < 3) return null;
        return {
          id: row[0] || `sheet-${index + 2}`,
          sheetRowIndex: index + 2, // 1-indexed row number in the spreadsheet (Row 2 onwards)
          createdAt: row[1] || '',
          playerName: row[2] || '익명 탐구자',
          mode: (row[3]?.includes('그물') ? 'food_web' : 'food_chain') as any,
          modeKorean: row[3] || '먹이사슬',
          organismsSummary: row[4] || '',
          survivalSeconds: Number(row[5]) || 0,
          formattedTime: row[6] || '00:00.00',
          balanceScore: Number(row[7]) || 0,
        };
      })
      .filter(Boolean) as LeaderboardRecord[];

    // Sort descending by survivalSeconds
    sheetRecords.sort((a, b) => b.survivalSeconds - a.survivalSeconds);

    return {
      records: sheetRecords.length > 0 ? sheetRecords : local,
      fromSheet: true,
      sheetUrl: sheetInfo.url,
    };
  } catch (err) {
    console.error('Failed to load sheet leaderboard:', err);
    return { records: local, fromSheet: false };
  }
}

/**
 * Admin: Deletes a record from Google Sheets and LocalStorage.
 * Workspace integration compliance:
 * Caller must ensure explicit confirmation is obtained in UI before invoking this.
 */
export async function deleteRecord(record: LeaderboardRecord): Promise<{ success: boolean; message: string }> {
  // Remove from local storage
  const local = getLocalRecords().filter((r) => r.id !== record.id);
  localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(local));

  const token = await getAccessToken();
  if (!token || !record.sheetRowIndex) {
    return { success: true, message: '로컬 기록에서 삭제되었습니다.' };
  }

  try {
    const sheetInfo = await getOrCreateSpreadsheet();

    // 1. Get sheetId (numeric integer id) of tab SHEET_TAB_NAME
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) {
      throw new Error('시트 정보를 불러올 수 없습니다.');
    }
    const metaData = await metaRes.json();
    const targetSheet = metaData.sheets?.find(
      (s: any) => s.properties?.title === SHEET_TAB_NAME
    );
    const numericSheetId = targetSheet?.properties?.sheetId ?? 0;

    // 2. deleteDimension request (0-indexed)
    // record.sheetRowIndex is 1-indexed, so row 2 is index 1
    const rowIndex0 = record.sheetRowIndex - 1;

    const deleteRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: numericSheetId,
                dimension: 'ROWS',
                startIndex: rowIndex0,
                endIndex: rowIndex0 + 1,
              },
            },
          },
        ],
      }),
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json();
      throw new Error(err.error?.message || '구글 시트 행 삭제에 실패했습니다.');
    }

    return { success: true, message: '구글 시트와 앱에서 성공적으로 삭제되었습니다.' };
  } catch (err: any) {
    console.error('Delete row error:', err);
    return { success: false, message: err.message || '삭제 중 오류가 발생했습니다.' };
  }
}

export function getLocalRecords(): LeaderboardRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    if (!raw) {
      // Provide some initial friendly 4th grade sample records
      return [
        {
          id: 'demo-1',
          playerName: '김태양 (과학부장)',
          mode: 'food_web',
          modeKorean: '먹이그물',
          organismsSummary: '풀, 대나무, 토끼, 메뚜기, 개구리, 뱀, 독수리',
          survivalSeconds: 142.5,
          formattedTime: '02:22.50',
          balanceScore: 92,
          createdAt: '2026. 10. 25. 14:30',
        },
        {
          id: 'demo-2',
          playerName: '이봄이 (4-1반)',
          mode: 'food_chain',
          modeKorean: '먹이사슬',
          organismsSummary: '과일나무, 다람쥐, 뱀, 늑대',
          survivalSeconds: 98.2,
          formattedTime: '01:38.20',
          balanceScore: 85,
          createdAt: '2026. 10. 26. 10:15',
        },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
