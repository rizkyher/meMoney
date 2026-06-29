export async function listCategories(db: D1Database, userId: string) {
  return db
    .prepare(
      `SELECT * FROM categories
       WHERE archived = 0 AND (user_id IS NULL OR user_id = ?)
       ORDER BY type, is_default DESC, name`
    )
    .bind(userId)
    .all();
}
