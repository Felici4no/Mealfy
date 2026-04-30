import { MockDatabase } from '../../database/mock-db';
import { AppError } from '../../shared/errors/AppError';
import { User } from '../../shared/types';

export class AdminService {
  static async listPendingEntities(): Promise<any[]> {
    const users = await MockDatabase.read<User>('users');
    const entities = await MockDatabase.read<any>('entities');

    return users
      .filter(u => u.role === 'entity' && u.status === 'pending')
      .map(u => ({
        ...u,
        entityData: entities.find((e: any) => e.id === u.entityId)
      }));
  }

  static async approveEntity(userId: string): Promise<void> {
    const users = await MockDatabase.read<User>('users');
    const entities = await MockDatabase.read<any>('entities');

    const uIdx = users.findIndex(u => u.id === userId);
    if (uIdx === -1) throw new AppError('User not found', 404);

    users[uIdx].status = 'approved';
    
    const eIdx = entities.findIndex((e: any) => e.id === users[uIdx].entityId);
    if (eIdx !== -1) {
      entities[eIdx].status = 'approved';
    }

    await MockDatabase.write('users', users);
    await MockDatabase.write('entities', entities);
    await MockDatabase.appendAuditLog({ type: 'APPROVE_ENTITY', userId });
  }

  static async rejectEntity(userId: string): Promise<void> {
    const users = await MockDatabase.read<User>('users');
    const uIdx = users.findIndex(u => u.id === userId);
    if (uIdx === -1) throw new AppError('User not found', 404);

    users[uIdx].status = 'rejected';
    await MockDatabase.write('users', users);
    await MockDatabase.appendAuditLog({ type: 'REJECT_ENTITY', userId });
  }
}
