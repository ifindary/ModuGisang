export function filterSensitiveInfo(data: any) {
  const fieldsToMask = process.env.SENSITIVE_FIELDS?.split(',') || [];
  const maskedData = { ...data };

  for (const field of fieldsToMask) {
    if (maskedData[field]) {
      maskedData[field] = '****'; // 민감 정보 마스킹
    }
  }

  return maskedData;
}
