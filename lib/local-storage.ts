import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { RegistrationStorageError, type Registration } from './registrations';

const writes = new Map<string, Promise<unknown>>();
type StoredRegistration = Registration & { id: string; created_at: string; status: 'new' };

async function readRows(target: string): Promise<StoredRegistration[]> {
  let text: string;
  try { text = await fs.readFile(target, 'utf8'); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new RegistrationStorageError('LOCAL_STORAGE_UNREADABLE');
  }
  try {
    const rows = JSON.parse(text) as unknown;
    if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== 'object' || typeof row.email !== 'string' || typeof row.role !== 'string')) throw Error();
    return rows as StoredRegistration[];
  } catch { throw new RegistrationStorageError('LOCAL_STORAGE_CORRUPT'); }
}

export async function checkLocalStorage(directory: string): Promise<void> {
  await readRows(path.join(directory, 'registrations.json'));
}

/** Serialized writes + atomic rename prevent lost requests in the dev server. */
export async function saveLocalRegistration(directory: string, registration: Registration): Promise<'submitted' | 'duplicate'> {
  const target = path.join(directory, 'registrations.json');
  const previous = writes.get(target) ?? Promise.resolve();
  const operation = previous.catch(() => undefined).then(async () => {
    await fs.mkdir(directory, { recursive: true });
    const rows = await readRows(target);
    if (rows.some((row) => row.role === registration.role && row.email.trim().toLowerCase() === registration.email)) return 'duplicate' as const;
    rows.push({ ...registration, id: randomUUID(), created_at: new Date().toISOString(), status: 'new' });
    const temporary = path.join(directory, `.registrations-${randomUUID()}.tmp`);
    try {
      const file = await fs.open(temporary, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(rows, null, 2), 'utf8'); await file.sync(); }
      finally { await file.close(); }
      await fs.rename(temporary, target);
    } finally { await fs.unlink(temporary).catch(() => undefined); }
    return 'submitted' as const;
  });
  writes.set(target, operation);
  try { return await operation; }
  finally { if (writes.get(target) === operation) writes.delete(target); }
}
