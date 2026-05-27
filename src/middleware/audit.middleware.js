import * as auditController from '../modules/audit/audit.controller.js'
export const LogFormat = 
{
    action: '',
    entityType: '',
    entityId: '',
    userId: '',
    teamId: '',
    chartId: '',
    stageId: '',
    taskId: '',
    details: '',
    performedAt: new Date(),
};

export const LogAction = async (info) =>
{
    const response = await auditController.log(info);
    return response;
};

export const recordAudit = async ({
    action,
    entityType = '',
    entityId = '',
    userId = '',
    details = {},
    ...context
}) => {
    try {
        await LogAction({
            action,
            entityType,
            entityId,
            userId,
            details: typeof details === 'string'
                ? details
                : JSON.stringify(details),
            ...context,
        });
    } catch (error) {
        console.error('Audit log failed:', error.message);
    }
};
