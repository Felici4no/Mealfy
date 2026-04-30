import { v4 as uuidv4 } from 'uuid';
import { MockDatabase } from '../../database/mock-db';
import { AppError } from '../../shared/errors/AppError';
import { DonorIndication, Family } from '../../shared/types';
import { normalizeString } from '../../shared/utils/normalizeUtils';

export class IndicationsService {
  static async create(data: any, userId: string): Promise<DonorIndication> {
    const indications = await MockDatabase.read<DonorIndication>('indications');
    const newIndication: DonorIndication = {
      ...data,
      id: `ind-${uuidv4()}`,
      indicatedByUserId: userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    indications.unshift(newIndication);
    await MockDatabase.write('indications', indications);
    return newIndication;
  }

  static async listAll(): Promise<DonorIndication[]> {
    return MockDatabase.read<DonorIndication>('indications');
  }

  static async convertToFamily(indicationId: string, user: any): Promise<Family> {
    const indications = await MockDatabase.read<DonorIndication>('indications');
    const idx = indications.findIndex(i => i.id === indicationId);
    
    if (idx === -1) throw new AppError('Indicação não encontrada', 404);
    const indication = indications[idx];

    if (indication.status === 'converted') {
      throw new AppError('Indicação já foi convertida', 409);
    }

    if (user.role === 'entity') {
      if (user.status !== 'approved') {
        throw new AppError('Entidades pendentes não podem converter indicações', 403);
      }

      // Validação de região
      const entities = await MockDatabase.read<any>('entities');
      const entityData = entities.find((e: any) => e.id === user.entityId);
      
      const indRegion = normalizeString(indication.region);
      const entityRegion = normalizeString(entityData?.region?.split('-')[0]);

      if (!indRegion.includes(entityRegion) && !entityRegion.includes(indRegion)) {
        throw new AppError('Indicação fora da sua região de atuação', 403);
      }
    }

    const families = await MockDatabase.read<Family>('families');
    const newFamily: Family = {
      id: `f-conv-${uuidv4()}`,
      representativeName: indication.representativeName,
      region: indication.region,
      childrenCount: indication.childrenCount,
      status: 'approved',
      supportStatus: 'needs_help',
      createdByEntityId: user.entityId,
      sourceType: 'donor_indication',
      sourceLabel: user.role === 'admin' ? 'Validado por Admin Mealfy' : `Validado por ${user.name}`,
      originalIndicationId: indication.id,
      latitude: -23.612 + (Math.random() * 0.05),
      longitude: -46.593 + (Math.random() * 0.05),
    };

    families.unshift(newFamily);
    await MockDatabase.write('families', families);

    indications[idx].status = 'converted';
    await MockDatabase.write('indications', indications);

    await MockDatabase.appendAuditLog({ type: 'CONVERT_INDICATION', indicationId, familyId: newFamily.id, userId: user.id });

    return newFamily;
  }

  static async updateStatus(id: string, status: any): Promise<DonorIndication> {
    const indications = await MockDatabase.read<DonorIndication>('indications');
    const idx = indications.findIndex(i => i.id === id);
    if (idx === -1) throw new AppError('Indicação não encontrada', 404);
    
    indications[idx].status = status;
    await MockDatabase.write('indications', indications);
    return indications[idx];
  }
}
