export async function writeAuditLog(client, {
  actorUserId = null,
  action,
  entityType = null,
  entityId = null,
  metadata = {},
  request = null,
}) {
  if (actorUserId) {
    await client.query("SELECT set_config('app.user_id', $1, true)", [actorUserId]);
  }

  const userAgent = request?.get?.('user-agent')?.slice(0, 512) || null;
  const ipAddress = request?.ip || null;

  await client.query(
    'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)',
    [actorUserId, action, entityType, entityId, JSON.stringify(metadata), ipAddress, userAgent],
  );
}
