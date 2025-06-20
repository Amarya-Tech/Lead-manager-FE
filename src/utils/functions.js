

export const cleanPayload = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanPayload(item));
  }

  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleaned[key] = cleanPayload(value);
          }
        } else if (typeof value === 'object') {
          const cleanedValue = cleanPayload(value);
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          if (typeof value === 'string' && value.trim() === '') {
          } else {
            cleaned[key] = value;
          }
        }
      }
    }
    return cleaned;
  }

  return obj;
};