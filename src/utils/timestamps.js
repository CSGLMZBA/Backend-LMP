const isDate = (value) => value instanceof Date;

const isFirestoreTimestamp = (value) => (
  value &&
  typeof value === 'object' &&
  typeof value.toDate === 'function' &&
  (
    typeof value.seconds === 'number' ||
    typeof value._seconds === 'number'
  )
);

const isSerializedTimestamp = (value) => (
  value &&
  typeof value === 'object' &&
  typeof value._seconds === 'number'
);

const isSerializedWebTimestamp = (value) => (
  value &&
  typeof value === 'object' &&
  typeof value.seconds === 'number' &&
  typeof value.nanoseconds === 'number'
);

const toIsoString = (date) => (
  Number.isNaN(date.getTime()) ? null : date.toISOString()
);

const serializedTimestampToDate = (value) => (
  new Date(
    value._seconds * 1000 +
    Math.floor((value._nanoseconds || 0) / 1000000)
  )
);

const serializedWebTimestampToDate = (value) => (
  new Date(
    value.seconds * 1000 +
    Math.floor((value.nanoseconds || 0) / 1000000)
  )
);

export const normalizeTimestamps = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (isDate(value)) {
    return toIsoString(value);
  }

  if (isFirestoreTimestamp(value)) {
    return toIsoString(value.toDate());
  }

  if (isSerializedTimestamp(value)) {
    return toIsoString(serializedTimestampToDate(value));
  }

  if (isSerializedWebTimestamp(value)) {
    return toIsoString(serializedWebTimestampToDate(value));
  }

  if (Array.isArray(value)) {
    return value.map(normalizeTimestamps);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeTimestamps(entryValue),
      ])
    );
  }

  return value;
};
